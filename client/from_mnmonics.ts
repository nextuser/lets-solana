import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import BIP32Factory from 'bip32';
import { Buffer } from 'buffer';
import dotenv from 'dotenv'
import bs58 from 'bs58'
import fs from 'fs'

//根据助记词推算密钥(secretkey)和地址(publickey)
const ed25519 = require('ed25519-hd-key')
dotenv.config()
// BIP44路径
const BIP44_PATH = "m/44'/501'/0'/0'";

async function main() {
    // 输入助记词
    const mnemonic = process.env.MNEMONIC; // 替换为你的助记词
    if (!mnemonic) {
        console.log('Your need export MNEMONIC=  ')
        process.exit(-1)
    }
    // 验证助记词
    if (!bip39.validateMnemonic(mnemonic)) {
        throw new Error('无效的助记词');
    }

    // 生成种子
    const seed = await bip39.mnemonicToSeed(mnemonic);
    // 派生密钥
    const derivedSeed = ed25519.derivePath(BIP44_PATH, seed.toString('hex')).key
    // 创建 ED25519 密钥对
    const keypair = Keypair.fromSeed(derivedSeed.slice(0, 32)); // 只取前32字节

    // 输出公钥和私钥
    console.log('Public Key:', keypair.publicKey.toBase58());
    console.log('Private Key:', bs58.encode(keypair.secretKey)); // Base64 编码私钥

    write_secretekey(keypair)
}


function write_secretekey(keypair : Keypair){
    let arr = [];
    keypair.secretKey.forEach((item)=>{
        arr.push(item)
    })

    let account= keypair.publicKey.toBase58()
    let msg = JSON.stringify(arr);
    //console.log('msg ', msg)
    let file = ".config/solana/" + account + ".json"
    let target =process.env.HOME + "/" + file
    fs.writeFileSync(target,msg)
    console.log("write file  :\n",target);
}
main().catch(err => {
    console.error('发生错误:', err);
});