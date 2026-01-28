import { AccountMeta, Connection, Keypair, TransactionInstruction,PublicKey, sendAndConfirmRawTransaction } from '@solana/web3.js';
import { get_pg} from './utils'
import  web3 from '@solana/web3.js'

async function main(){
    // // 假设这是一个自定义程序的指令
    // const programId = new PublicKey('5idcgLuTgmzCyHYNPE3pGQMiysFAxqNNxRK6bTjtV3Sc');
    // const writableAccount = new PublicKey('BU2ycfFXNpSMgUXYbySk6zHVQHbNX5VZzWSm5U9dU8u3');

    // const instruction = new TransactionInstruction({
    //     keys: [
    //         { pubkey: writableAccount, isSigner: false, isWritable: true },
    //         // 其他账户...
    //     ],
    //     programId,
    //     data: Buffer.from("pda_seed"),
    // });
    // let pg = get_pg()
    // let tx = new web3.Transaction();
    // tx.add(instruction);
    // const txHash = await web3.sendAndConfirmTransaction(pg.connection, tx, [
    //     pg.wallet.keypair,
    //   ]);
    // console.log("tx digest",txHash); 

}

main()