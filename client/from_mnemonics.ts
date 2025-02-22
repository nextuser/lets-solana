import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import BIP32Factory from 'bip32';
import { Buffer } from 'buffer';
import dotenv from 'dotenv'
import bs58 from 'bs58'
import fs from 'fs'
import { base64 } from '@metaplex-foundation/umi/serializers';

//根据助记词推算密钥(secretkey)和地址(publickey)
const ed25519 = require('ed25519-hd-key')
dotenv.config()
// BIP44路径
const BIP44_SOLANA_PATH = "m/44'/501'/0'/0'";
const BIP44_SUI_PATH = "m/44'/784'/0'/0'";
const BIP_PATH_FORMAT  = "m/%u'/784'/0'/0'"
const COIN_SOLANA = "501";
const COIN_SUI = "784";

function getBip44Path(coinType:string) : string{
    return `m/44'/${coinType}'/0'/0'`
}

async function generate_keypair(mnemonic:string,coinType:string) :Keypair{
        // 生成种子
        const seed = await bip39.mnemonicToSeedSync(mnemonic);
        console.log('seed ', seed)
        const hex_bytes=  seed.toString('hex');
        console.log("hex byte",Buffer.from(hex_bytes));
        const bip44path = getBip44Path(COIN_SOLANA);
        console.log("derived bip44path:",bip44path);
        // 派生密钥
        const derivedSeed = ed25519.derivePath(bip44path,hex_bytes).key
        // 创建 ED25519 密钥对
        const keypair = Keypair.fromSeed(derivedSeed.slice(0, 32)); // 只取前32字节
        return keypair;
}

function uint8ArrayToHex(uint8Array) {
    let hexString = '';
    for (let i = 0; i < uint8Array.length; i++) {
        const hex = uint8Array[i].toString(16).padStart(2, '0');
        hexString += hex;
    }
    return hexString;
}

import { sha3_256 } from 'js-sha3';
async function processSolana(mnemonic:string){
    let keypair = await  generate_keypair(mnemonic,COIN_SOLANA);

    // 对公钥进行哈希处理
// 输出公钥和私钥
    console.log('SOLANA Public Key:', keypair.publicKey.toBase58());
    console.log('SOLANA Private Key:', bs58.encode(keypair.secretKey)); // Base64 编码私钥

    write_secretekey(keypair)
}


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

    processSolana(mnemonic);
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