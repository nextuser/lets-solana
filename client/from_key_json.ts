
// 从 私钥字符串 生成账户私钥的json文件，需要设置环境变量
//  export SECRET_KEY=...
// 
import "dotenv/config"
import base58 from 'bs58'
import { Keypair } from "@solana/web3.js"
import path from "path"
import fs from "fs"
import { config } from "dotenv"
import {get_pg,show_balance} from './utils'
config()
function show_account(file_name:string){
    

    let data = fs.readFileSync(file_name).toString();
    let arr = JSON.parse(data);
    let skey = new Uint8Array(arr);

    const userKeypair2 =  Keypair.fromSecretKey(skey)
    let account = userKeypair2.publicKey.toBase58();
    // 转换为Base58编码
    console.log(`The public key is:`,account)
    console.log('private key：',base58.encode(userKeypair2.secretKey));
    // 处理私钥的打印格式
    ////console.log(`The secret key is:`,base58.encode(userKeypair2.secretKey))
    let pg = get_pg();
    show_balance(pg.connection, account,"balance")
}
/**
 * 生成账户私钥的json文件
 * ```bash
 *  solana-keygen grind --startswith Bob
 * ```
 * */
let accounts = [
    'BobMFsLAYCuhw2YdW898whM3EiHszuS9DUCR3AmEWkk4',
    'Bobb4B6n4898Zr7bQfttryCJDq4geib9vMZ6ZiGBWaWv',
    'Bob8VSgkbigNVLL3pxEeon9mKB5uLwnD9EtTaTooYYSi',
]

accounts.forEach((account)=>{
   
    let file_name = path.resolve(__dirname,`../../bak/${account}.json`)
    console.log("json file:",file_name);
    show_account(file_name)
})
show_account(process.env.HOME +"/.config/solana/id.json");
// show_account("BobMFsLAYCuhw2YdW898whM3EiHszuS9DUCR3AmEWkk4")
// show_account("Bobb4B6n4898Zr7bQfttryCJDq4geib9vMZ6ZiGBWaWv")

