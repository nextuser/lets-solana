import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import BIP32Factory from 'bip32';
import { Buffer } from 'buffer';
import dotenv from 'dotenv'
import bs58 from 'bs58'
import fs from 'fs'
import { base64 } from '@metaplex-foundation/umi/serializers';
import * as crypto from 'crypto'
//根据助记词推算密钥(secretkey)和地址(publickey)
///const ed25519 = require('ed25519-hd-keyed25519-hd-key')
import * as ed25519 from 'ed25519-hd-key'
import {  toSuiAddress } from './sui_util';
dotenv.config()
// BIP44路径
const BIP44_SOLANA_PATH = "m/44'/501'/0'/0'";
const BIP44_SUI_PATH = "m/44'/784'/0'/0'/0'";
//const BIP_PATH_FORMAT  = "m/44'/%u'/0'/0'/0'"
const COIN_SOLANA = "501";
const COIN_SUI = "784";


function getBip44Path(coinType:string) : string{
    return `m/44'/${coinType}'/0'/0'/0'`
}

function generate_keypair(mnemonic:string,coinType:string) :Keypair{
        // 生成种子
        const seed =  bip39.mnemonicToSeedSync(mnemonic);
        console.log('seed ', seed)
        const hex_bytes=  seed.toString('hex');
        console.log("hex seed byte",Buffer.from(hex_bytes));
        const bip44path = getBip44Path(coinType);
        console.log("****BIP44_PATH:",bip44path);
        // 派生密钥
        const derivedSeed = ed25519.derivePath(bip44path,hex_bytes).key
        // 创建 ED25519 密钥对
        const keypair = Keypair.fromSeed(derivedSeed.slice(0, 32)); // 只取前32字节
        return keypair;
}


function generate_keypair_path(mnemonic:string,bip44path:string) :Keypair{
        // 生成种子
        const seed =  bip39.mnemonicToSeedSync(mnemonic);
        console.log('seed ', seed)
        const hex_bytes=  seed.toString('hex');
        console.log("hex seed byte",Buffer.from(hex_bytes));
        console.log("****BIP44_PATH:",bip44path);
        // 派生密钥
        const derivedSeed = ed25519.derivePath(bip44path,hex_bytes).key
        // 创建 ED25519 密钥对
        const keypair = Keypair.fromSeed(derivedSeed.slice(0, 32)); // 只取前32字节
        return keypair;
}


import { sha3_256 } from 'js-sha3';
async function processSolana(mnemonic:string){
    let keypair = generate_keypair_path(mnemonic,BIP44_SOLANA_PATH);

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

    await processSolana(mnemonic);
    processSui(mnemonic);
}

import { bech32 } from 'bech32';
function processSui(mnemonic:string){
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    console.log('seed ', seed)
    const hex_bytes=  seed.toString('hex');
    console.log("hex seed byte",Buffer.from(hex_bytes));
    const bip44path = BIP44_SUI_PATH;
    console.log("****BIP44_PATH:",bip44path);
    // 派生密钥
    const privateKey = ed25519.derivePath(bip44path,hex_bytes).key

    // 步骤 3：生成 suiprivkey
    const privateKeyWithFlag = Buffer.concat([Buffer.from([0x00]), privateKey]);
    const words = bech32.toWords(privateKeyWithFlag);
    const suiPrivateKey = bech32.encode('suiprivkey', words);
    console.log("suiprivkey:", suiPrivateKey);

        // 步骤 4：生成 sui.keystore
    const keystoreEntry = privateKeyWithFlag.toString('base64');
    console.log("sui.keystore Entry:", keystoreEntry);

    const publicKey = ed25519.getPublicKey(privateKey)

    // 步骤 5：生成公钥
    console.log("Public Key (hex):", publicKey.toString('hex'));

    // 步骤 6：生成 Sui 地址
    const suiAddress = toSuiAddress(publicKey);
    console.log("Sui Address:", suiAddress);

    // 对公钥进行哈希处理
// 输出公钥和私钥
    ///console.log('SUI Public Key:', Buffer.from(keypair.publicKey.toBytes()).toString('hex'));
    //console.log('SUI Private Key:', bs58.encode(keypair.secretKey)); // Base64 编码私钥
    let flag = 0;
   // 生成 sui.keystore 格式（33 字节：标志字节 + 32 字节私钥）

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