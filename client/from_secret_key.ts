
// 从 私钥字符串 生成账户，配合 .env 配置文件
import "dotenv/config"
import base58 from 'bs58'
import { Keypair } from "@solana/web3.js"
import path from "path"
import fs from "fs"
import { config } from "dotenv"
config()
// SECRET_KEY 从phantom  设置-》选中账户->显示私钥
if(!process.env.SECRET_KEY){
    console.log("export SECRET_KEY first");
    process.exit(1);
}
const userKeypair2 =  Keypair.fromSecretKey(base58.decode(process.env.SECRET_KEY))
console.log(userKeypair2)
let account = userKeypair2.publicKey.toBase58();
// 转换为Base58编码
console.log(`The public key is:`,account)
// 处理私钥的打印格式
////console.log(`The secret key is:`,base58.encode(userKeypair2.secretKey))
let arr = [];
userKeypair2.secretKey.forEach((item)=>{
    arr.push(item)
})


let msg = JSON.stringify(arr);
//console.log('msg ', msg)
let file = "./.config/solana/" + account + ".json"
let target = path.resolve(process.env.HOME,file)
fs.writeFileSync(target,msg)
console.log("write file  :\n",target);