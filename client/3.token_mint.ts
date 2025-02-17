import {
    createMint,
    getMint,
    mintTo,
    getOrCreateAssociatedTokenAccount,
    getAccount
} from '@solana/spl-token'

import { Keypair ,PublicKey,Connection} from '@solana/web3.js'
import {get_pg,PlayGround} from './utils'
import { openSync } from 'fs';
import { exit } from 'process';
//todo need export TOKEN_MIN=...
async function mint_token(token:PublicKey,minter : Keypair,pg :PlayGround,amount : bigint){
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    pg.connection,
    pg.wallet.keypair,
    token,
    pg.wallet.publicKey,
  )

  console.log("token account:",tokenAccount.address.toBase58());

  await mintTo(pg.connection,pg.wallet.keypair,token, tokenAccount.address,minter,amount)
  return tokenAccount.address
}

async function main(){
  let pg = get_pg();
  let minter = pg.wallet.keypair;
  let token = process.env.TOKEN_MINT
  if(!token) {
    console.log("export TOKEN_MINT first ");
    exit(-1)
  }
  let token_account = await mint_token(new PublicKey(token),minter,pg,1000_000_000_0000_0000n)

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