
// 从 私钥字符串 生成账户私钥的json文件，需要设置环境变量
//  export SECRET_KEY=...
// 
import "dotenv/config"
import base58 from 'bs58'
import { Keypair ,GetBalanceConfig}  from "@solana/web3.js"
import path from "path"
import fs from "fs"
import { config } from "dotenv"
import { get_pg,getKeypair } from "./utils"
config()
let keys = [
    'aDcmPNhsYKcmgzh7aAdnwgM9WifYN2nc7pT2LzzJNsuLQyrha8sDWCnPY3iuGSDBMv8d1EfBxVuzbqciJEPYvoJ',
]

async function queryBalance( key : string){
    console.log('process:',key)
    const userKeypair2 =  Keypair.fromSecretKey(base58.decode(key))
    let payer = getKeypair();
    let pg = get_pg(payer,'mainnet');
    console.log("account     balance     key");
    console.log(  userKeypair2.publicKey.toBase58(),await pg.connection.getBalance(userKeypair2.publicKey)/1e9,key);
}

keys.forEach((key)=>{
    queryBalance(key)
})
