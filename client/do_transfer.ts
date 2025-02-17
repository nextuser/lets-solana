//用于transfer 转账
import { get_pg,getKeypair,show_account, show_balance} from "./utils";
import * as web3 from '@solana/web3.js'
import { SystemProgram,SystemInstruction,Keypair,LAMPORTS_PER_SOL, Transaction, sendAndConfirmRawTransaction, Connection } from "@solana/web3.js";

let payer = getKeypair();
let pg = get_pg(payer,);
let  other = new Keypair();

async function main(){
    console.log("other balance:")
    await show_balance(pg.connection,other.publicKey.toBase58(), "other balance:");

    await show_balance(pg.connection,payer.publicKey.toBase58(),"payer balance:");
    let transferInstruction = SystemProgram.transfer({  
        /** Account that will transfer lamports */
        fromPubkey: payer.publicKey,
        /** Account that will receive transferred lamports */
        toPubkey: other.publicKey,
        /** Amount of lamports to transfer */
        lamports: LAMPORTS_PER_SOL /10
    })
    const transaction = new Transaction().add(transferInstruction)
    let s = await web3.sendAndConfirmTransaction(pg.connection,transaction, [payer])
    console.log("transaction signatrue", s);
    console.log("other balance after transfer:")
    await show_balance(pg.connection,other.publicKey.toBase58(),"other:");
    await show_balance(pg.connection,payer.publicKey.toBase58(),"payer:");
}

main();
