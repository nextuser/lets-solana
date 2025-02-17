// Client


import web3 from '@solana/web3.js'
import { get_pg,getKeypair } from './utils';
const PROGRAM_ID= '3QSLsEgTxY27krVo2A7Fc7hCWsVbvzryKUpMH1NNfK3b';
let keypair = getKeypair();
let pg =  get_pg(keypair,'3QSLsEgTxY27krVo2A7Fc7hCWsVbvzryKUpMH1NNfK3b');

async function show_balance(){
    console.log("My address:", pg.wallet.publicKey.toString());
    const balance = await pg.connection.getBalance(pg.wallet.publicKey);
    console.log(`My balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`);
}

show_balance();