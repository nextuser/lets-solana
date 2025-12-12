import {
    createMint,
    getMint,
    mintTo,
    getOrCreateAssociatedTokenAccount,
    getAccount
} from '@solana/spl-token'

import { Keypair ,PublicKey,Connection} from '@solana/web3.js'
import {get_pg,PlayGround,query_balance} from './utils'

async function create_token2() : Promise<[PlayGround, Keypair,PublicKey]>{
  let pg = get_pg();
  const payer = pg.wallet.keypair;
  const minter = payer//Keypair.generate();
  const freezer = Keypair.generate();

  const token_addr = await createMint(
      pg.connection,
      payer,
      minter.publicKey,
      freezer.publicKey,
      6
  )

  const token_addr2 = await createMint(
      pg.connection,
      payer,
      minter.publicKey,
      freezer.publicKey,
      6
  )
  console.log("token mint:",token_addr.toBase58())
  console.log("token mint2:",token_addr2.toBase58())
  console.log("minter",minter.publicKey.toBase58());
  console.log("freezer",freezer.publicKey.toBase58());
  const mint_info = await getMint(pg.connection,token_addr)
  console.log("supply :",mint_info.supply)
  return [pg,minter,token_addr]
}

async function mint_token(token:PublicKey,minter : Keypair,pg :PlayGround){
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    pg.connection,
    pg.wallet.keypair,
    token,
    pg.wallet.publicKey,
  )

  console.log("token account:",tokenAccount.address.toBase58());

  await mintTo(pg.connection,pg.wallet.keypair,token, tokenAccount.address,minter,1000_000_000_000)
  return tokenAccount.address
}

async function getSupply(conn : Connection,token : PublicKey){
    let tokenInfo =  await getMint(conn,token)
    
    return [tokenInfo.supply,tokenInfo.decimals, tokenInfo.address]
}


async function main(){
  let cost = await query_balance();
  let [pg,minter,token] = await create_token2();
//   let token_account = await mint_token(token,minter,pg)
//   let [supply,decimal,_] =  await getSupply(pg.connection,token)
//   console.log("supply,decimal :",supply,decimal)
  
//   cost = await query_balance() - cost;
//   console.log("cost:",cost);
//   const tokenAccountInfo = await getAccount(
//     pg.connection,
//     token_account
//     )
//     console.log("token account info : owner",tokenAccountInfo.owner.toBase58(), 
//                 ",account address=",tokenAccountInfo.address.toBase58(),
//                 "token address", tokenAccountInfo.mint.toBase58()  );  
//    console.log("token account amount:",tokenAccountInfo.amount, 
//     tokenAccountInfo.address.toBase58());
// }
}

main();