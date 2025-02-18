import { 
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    TransactionInstruction,
    sendAndConfirmTransaction } from "@solana/web3.js";
import * as  bs58 from 'bs58';
import  {get_pg} from './utils'
import dotenv from 'dotenv'
import { Buffer } from "buffer";


async function main(){
    let pg = get_pg();
    const connection = pg.connection;
    const payer = pg.wallet.keypair;
    dotenv.config();
    const program_a = new PublicKey(process.env.PROGRAM_A);
    const program_b = new PublicKey(process.env.PROGRAM_B)
    //这里需要用seed， payer的publickey 生成，因此是 
    const [pda,bump] = PublicKey.findProgramAddressSync([Buffer.from('pda_seed')], program_a);
    console.log("pda account",pda.toBase58());
    type AccountMeta = {
        /** An account's public key */
        pubkey: PublicKey;
        /** True if an instruction requires a transaction signature matching `pubkey` */
        isSigner: boolean;
        /** True if the `pubkey` can be loaded as a read-write account. */
        isWritable: boolean;
    };
    const transaction = new Transaction().add(new TransactionInstruction({
        keys:[
            { pubkey:payer.publicKey, isSigner:true, isWritable:true},
            { pubkey:pda, isSigner:false, isWritable:true},
            { pubkey: SystemProgram.programId, isSigner:false,isWritable:false},
            {pubkey: program_b,isSigner:false,isWritable:false}
        ],
        programId : program_a,
        data: Buffer.from(Uint8Array.of(bump))
    }));

    const signature = await sendAndConfirmTransaction(
        pg.connection,
        transaction,
        [payer],
        {commitment:"confirmed"}
    )
    console.log("tx signature:",signature);    

}

main()