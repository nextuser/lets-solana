import * as web3 from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv'
import { TOKEN_PROGRAM_ID , AccountLayout } from '@solana/spl-token';
dotenv.config();
export const  DEVNET_RPC_URL:string = process.env.DEVNET_RPC_URL
//用来模拟https://beta.solpg.io/ 的环境中的pg
export type PlayGround = {
    wallet : {
        keypair:web3.Keypair,
        publicKey:web3.PublicKey
    },
    connection:web3.Connection,
    rpc_url : string
    //PROGRAM_ID :web3.PublicKey
}

export function getWssConnection(){
    return new  web3.Connection(process.env.DEVNET_WSS_URL,"confirmed");
}

export function get_rpc_url(){
    if(process.env.SOLANA_ENV== "mainnet"){
        //# return process.env.MAINNET_RPC_URL
        return process.env.DEVNET_RPC_URL
    } else {
        return process.env.DEVNET_RPC_URL
    }
}

export function get_pg(payer? :web3.Keypair) : PlayGround{
    if(!payer){
        payer = getKeypair();
    }
    const rpc_url = get_rpc_url();
    
    let connection = new web3.Connection(rpc_url, "confirmed");
    console.log("connected:",rpc_url);
    return {
        wallet : { publicKey:payer.publicKey,
            keypair :payer},
        connection: connection,
        rpc_url : rpc_url,
       // PROGRAM_ID : new web3.PublicKey(programId) ,
    }
}


// 定义读取秘钥文件的函数
function readSecretKeyFromFile(filePath: string): web3.Keypair {
    try {
        // 读取文件内容
        const secretKeyData = fs.readFileSync(path.resolve(__dirname, filePath), 'utf8');
        // 将文件内容解析为 JSON 格式
        const secretKeyArray = JSON.parse(secretKeyData);
        // 将解析后的数组转换为 Uint8Array 类型
        const secretKeyUint8Array = new Uint8Array(secretKeyArray);
        // 使用 Uint8Array 创建 Keypair 对象
        return web3.Keypair.fromSecretKey(secretKeyUint8Array);
    } catch (error) {
        console.error('Error reading secret key file:', error);
        throw error;
    }
}

export function getKeypair() : web3.Keypair{
    // 示例：指定秘钥文件路径
    const secretKeyFilePath = path.resolve(process.env.HOME,'./.config/solana/id.json');
    // 调用函数读取秘钥文件
    const keypair = readSecretKeyFromFile(secretKeyFilePath);

    // 打印公钥和私钥（注意：私钥信息敏感，请勿随意打印）
    console.log('connected : Public Key:', keypair.publicKey.toBase58());
    // console.log('Secret Key:', keypair.secretKey); 
    return keypair;

}


export function show_tx(digest: string) {
    console.log(`https://solscan.io/tx/${digest}?cluster=devnet`);
}

export async function show_balance(connection:web3.Connection,addr :string, prompt ? : string){
    if(prompt) console.log(prompt);
    console.log("My address:", addr);
    const balance = await connection.getBalance(new web3.PublicKey(addr));
    console.log(`My balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`);
}

export async function show_account(connection:web3.Connection,addr :string){
    console.log("account info of ", addr);
    console.log(await connection.getAccountInfo(new web3.PublicKey(addr)));
}

export async function query_token(owner,token?:string) {
    let pg = get_pg();
    let filter = token ? { mint : new PublicKey(token)} : { programId: TOKEN_PROGRAM_ID };
    const tokenAccounts = await pg.connection.getTokenAccountsByOwner(
      new PublicKey(owner),
      filter
    );
    console.log("Token                                         Balance  ");
    console.log("------------------------------------------------------------");
    tokenAccounts.value.forEach((tokenAccount) => {
      const accountData = AccountLayout.decode(tokenAccount.account.data);
      console.log(`${accountData.mint.toBase58()}   ${accountData.amount}  }`);
    })
  
  }

export const PROGRAM_ID= new PublicKey('D3ppXDXN3mzM6v8rQYTzwW8A3hCaDG5Eg6e7uToYJJjw');