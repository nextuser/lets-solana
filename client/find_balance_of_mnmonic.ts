
// 从 私钥字符串 生成账户私钥的json文件，需要设置环境变量
//  export SECRET_KEY=...
// 
import "dotenv/config"
import base58 from 'bs58'
import { Keypair ,GetBalanceConfig}  from "@solana/web3.js"
import path from "path"
import fs from "fs"
import * as bip39 from 'bip39';


import { config } from "dotenv"
import { get_pg,getKeypair } from "./utils"

const ed25519 = require('ed25519-hd-key')
// BIP44路径
const BIP44_PATH = "m/44'/501'/0'/0'";
config()
let menmonics  = [
    '...',
]


async function queryBalance( mnemonic  : string){
    // 验证助记词
    if (!bip39.validateMnemonic(mnemonic)) {
        console.log('无效的助记词:' + mnemonic);
        return;
    }

    // 生成种子
    const seed = await bip39.mnemonicToSeed(mnemonic);
    // 派生密钥
    const derivedSeed = ed25519.derivePath(BIP44_PATH, seed.toString('hex')).key
    // 创建 ED25519 密钥对
    const keypair = Keypair.fromSeed(derivedSeed.slice(0, 32)); // 只取前32字节

        
    let payer = getKeypair();
    let pg = get_pg(payer,'mainnet');
    console.log(  keypair.publicKey.toBase58(),await pg.connection.getBalance(keypair.publicKey)/1e9, `mnemonic=${mnemonic}`);
}

menmonics.forEach((key)=>{
    queryBalance(key)
})
