
import { get_pg, PlayGround,query_token } from './utils'
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import { createAssociatedTokenAccountInstruction, 
    createSyncNativeInstruction, 
    getAccount, 
    getAssociatedTokenAddress,
    getOrCreateAssociatedTokenAccount, 
    NATIVE_MINT, 
    transfer } from "@solana/spl-token";
async function main(){
    let pg = get_pg();
    let owner =  Keypair.generate()
    const tokenAccount = await getAssociatedTokenAddress(
        NATIVE_MINT,
        owner.publicKey
    )

    // console.log("token account:",tokenAccount);
    // let accountInfo = await getAccount(pg.connection,tokenAccount)
    // console.log("accountInfo",accountInfo)



    let tx = new Transaction()
    const payer = pg.wallet.keypair;

    let inst = createAssociatedTokenAccountInstruction(
       payer.publicKey,
       tokenAccount,
       owner.publicKey,
       NATIVE_MINT
    )
    tx.add(inst)

    let ret = await sendAndConfirmTransaction(pg.connection,tx,[payer])
    console.log("create ",ret)

    let tx2 = new Transaction()
    tx2.add(SystemProgram.transfer({
        fromPubkey:payer.publicKey,
        toPubkey:tokenAccount,
        lamports:LAMPORTS_PER_SOL/100
    }))
    tx2.add(createSyncNativeInstruction(
        tokenAccount
    ))
    const ret2 = await sendAndConfirmTransaction(pg.connection,tx2,[payer])
    let accountInfo = await getAccount(pg.connection,tokenAccount)
    console.log("after transfer ,accountInfo owner ,token_mint,",accountInfo.owner, accountInfo.mint)
    console.log("ret2 ",ret2)

    let target = '3sn1DvVpFdw3csJ1tvvsP8wXBWTygAXgDHLUzf3Fcyi6'
    console.log("NATIVE_MINT:",NATIVE_MINT.toBase58());
    let source = owner.publicKey.toBase58();
    //query_token(NATIVE_MINT,source)
    await do_transfer(pg,owner,target);
    //query_token(NATIVE_MINT,source)

}

main()



async function do_transfer(pg:PlayGround,source :Keypair, dest :string){
    let sourceAccount = await getAssociatedTokenAddress(
        NATIVE_MINT,
        source.publicKey
    )
    let targetAccount = await getOrCreateAssociatedTokenAccount(
        pg.connection,
        pg.wallet.keypair,
        NATIVE_MINT,
        new PublicKey(dest),
    )
    console.log("transfer from:",sourceAccount.toBase58());
    console.log("transfer to:",targetAccount.address.toBase58());
    
    let payer = pg.wallet.keypair
    const digest = await transfer(
        pg.connection,
        payer,
        sourceAccount,
        targetAccount.address,
        source,
        30000,
        [payer, source]
    )
    console.log("transfer digest : ",digest)
}