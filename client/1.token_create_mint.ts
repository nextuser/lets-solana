import {
    createMint,
    getMint,
    mintTo,
    getOrCreateAssociatedTokenAccount,
    getAccount,
} from '@solana/spl-token'

import { Keypair ,PublicKey,Connection} from '@solana/web3.js'
import {get_pg,PlayGround,query_balance} from './utils'

async function create_token() : Promise<[PlayGround, Keypair,PublicKey]>{
  let pg = get_pg();
  const payer = pg.wallet.keypair;
  const token_authority = Keypair.generate();
  const freezer = Keypair.generate();

  const token_addr = await createMint(
      pg.connection,
      payer,
      token_authority.publicKey,
      freezer.publicKey,
      6
  )
  console.log("token mint:",token_addr.toBase58())
  console.log("who mint the token:",token_authority.publicKey.toBase58());
  console.log("freezer",freezer.publicKey.toBase58());
  const mint_info = await getMint(pg.connection,token_addr)
  console.log("supply :",mint_info.supply)
  return [pg,token_authority,token_addr]
}

async function mint_token(token:PublicKey,authority:Keypair, target : PublicKey,pg :PlayGround){
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    pg.connection,
    pg.wallet.keypair,
    token,
    target,
  );

  const payer = pg.wallet.keypair;
  console.log("token mint:",token.toBase58());
  console.log("ata account:",tokenAccount.address.toBase58());
  const mint = await getMint(pg.connection,token);
  console.log("token mint authority:", mint.mintAuthority.toBase58());
  console.log("payer :",payer.publicKey.toBase58())
  console.log("target:",target.toBase58());
  try{
        await mintTo(pg.connection, payer, token, tokenAccount.address, authority, 1000_000_000_000)
    }catch(e){
      console.log("mint_token error",e);
      return null;
    }
  return tokenAccount.address
}

async function getSupply(conn : Connection,token : PublicKey){
    let tokenInfo =  await getMint(conn,token)
    
    return [tokenInfo.supply,tokenInfo.decimals, tokenInfo.address]
}


async function main(){
    let cost = await query_balance();
    let [pg,token_authority,token] = await create_token();
    const target = Keypair.generate().publicKey;


    const payer = pg.wallet.keypair;
    console.log("payer info ",payer.publicKey.toBase58() )
    let token_mint = await getMint(pg.connection,token);
    console.log("token mint: mint authority",token_mint.mintAuthority.toBase58(),
        "freezeAuthority", token_mint.freezeAuthority.toBase58(),
        "supply",token_mint.supply);


    let token_account = await mint_token(token,token_authority,target,pg)
    if(!token_account){

        return;
    }
    let [supply,decimal,_] =  await getSupply(pg.connection,token)
    console.log("main supply,decimal :",supply,decimal)

  
  cost = await query_balance() - cost;
  console.log("main cost:",cost);
  const tokenAccountInfo = await getAccount(
    pg.connection,
    token_account
    )
    console.log("token account info : owner",tokenAccountInfo.owner.toBase58(), 
                ",account address=",tokenAccountInfo.address.toBase58(),
                "token address", tokenAccountInfo.mint.toBase58()  );  
   console.log("token account amount:",tokenAccountInfo.amount, 
    tokenAccountInfo.address.toBase58());
}


main();
