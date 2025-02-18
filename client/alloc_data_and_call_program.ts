
import web3, { Keypair } from '@solana/web3.js'
import * as borsh from 'borsh'
import { Schema, deserialize, serialize } from 'borsh';
import { get_pg,getKeypair ,PROGRAM_ID} from './utils';
let keypair = getKeypair();

(async function(){

//数据账户的数据结构定义，和lib.rs 定义的Counter对应
class Counter {
    counter: number = 0;
    constructor(fields: { counter: number } | undefined = undefined) {
      if (fields) {
        this.counter = fields.counter;
      }
    }
  }

 // todo 这个schema语法没有理解透彻
   const schema : Schema = new Map([
     [Counter, { kind: "struct", fields: [["counter", "u32"]] }],
   ]);
  // const schema :StructType = { "struct" : {counter : "u32" }} }
  //构建数据账户，赋予初值. 计算数据账号的空间
  const space = borsh.serialize(schema, new Counter()).length;
  console.log("data area space:",space);
  let pg = get_pg(keypair);
 
  // 为了减免租金的最小开销。
  
  const rentFee =  await pg.connection.getMinimumBalanceForRentExemption(space)
  console.log(`space=${space},lamports=${rentFee}`);
  //分配数据账号的内存空间  （为一个新的地址分配空间， 支付租金）
  let data_key_pair = new web3.Keypair();
  let create_data = web3.SystemProgram.createAccount({
    fromPubkey: pg.wallet.publicKey,
    newAccountPubkey: data_key_pair.publicKey,
    lamports: rentFee,
    space: space,
    programId:PROGRAM_ID,
  });
  
  //应该是这个数据账户创建后，被转让给程序账户。
  
  let tx_call = new web3.TransactionInstruction({
    keys: [
      {
        pubkey: data_key_pair.publicKey,
        /** True if an instruction requires a transaction signature matching `pubkey` */
        isSigner: false,
        /** True if the `pubkey` can be loaded as a read-write account. */
        isWritable: true,
      },
    ],
    programId: PROGRAM_ID,
  });
  console.log("data account address:", data_key_pair.publicKey.toBase58());
  let tx = new web3.Transaction();
  tx.add(create_data, tx_call);
  
  const txHash = await web3.sendAndConfirmTransaction(pg.connection, tx, [
    pg.wallet.keypair,
    data_key_pair,
  ]);
  
  console.log("transaction hash:", txHash);
  

})();