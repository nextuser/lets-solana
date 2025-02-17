
import web3 from '@solana/web3.js'
import * as borsh from 'borsh'
import { Schema, deserialize, serialize } from 'borsh';
import { get_pg,getKeypair ,show_tx,show_balance,show_account,PROGRAM_ID} from './utils';

let keypair = getKeypair();
let pg =  get_pg(keypair);
async function main() {
class Counter {
    counter: number = 0;
    constructor(fields: { counter: number } | undefined = undefined) {
      if (fields) {
        this.counter = fields.counter;
      }
    }
  }
  
  const Schema = new Map([
    [Counter, { kind: "struct", fields: [["counter", "u32"]] }],
  ]);
  
  // const GreetingSchema = new Map([
  //   [GreetingAccount, { kind: "struct", fields: [["counter", "u32"]] }],
  // ]);
  const DATA_ADDR = "Y8qdevywEPmDVe2X7v3Hr1pXSbqzyKZ6JY8ySLeG5aS"; 
  //用于调用合约的数据账户， 可以当做输入参数数据账户的地址（base58）
  const data_key = new web3.PublicKey(
    //"8GtgtD9pusjzNF3sNaJtVid1y3EnRqRDEdV5FMSKZLtR"
    DATA_ADDR
  );
  
  let tx_call = new web3.TransactionInstruction({
    keys: [
      {
        pubkey: data_key,
        /** True if an instruction requires a transaction signature matching `pubkey` */
        isSigner: false,
        /** True if the `pubkey` can be loaded as a read-write account. */
        isWritable: true,
      },
    ],
    programId: new web3.PublicKey(PROGRAM_ID),
  });
  let tx = new web3.Transaction();
  tx.add(tx_call);
  
  const txHash = await web3.sendAndConfirmTransaction(pg.connection, tx, [
    pg.wallet.keypair,
  ]);
  
  show_tx(txHash);
  show_balance(pg.connection,DATA_ADDR);
  show_account(pg.connection,DATA_ADDR);

}

main();