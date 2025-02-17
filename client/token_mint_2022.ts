import {
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    clusterApiUrl,
    sendAndConfirmTransaction,
  } from "@solana/web3.js";
  
  import {
    MINT_SIZE,
    TOKEN_2022_PROGRAM_ID,
    createInitializeMint2Instruction,
    getMinimumBalanceForRentExemptMint,
  } from "@solana/spl-token";
  
  import {get_pg,getKeypair} from './utils'
  

  ////const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  let keypair = getKeypair();
  let pg = get_pg(keypair);

  function get_minter(){
    return Keypair.generate()
    //return keypair
  }
  

async function main(){

  const minter = get_minter();
  const rentFee = await getMinimumBalanceForRentExemptMint(pg.connection);
  
  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: pg.wallet.publicKey,
    newAccountPubkey: minter.publicKey,
    space: MINT_SIZE,
    lamports: rentFee,
    programId: TOKEN_2022_PROGRAM_ID,
  });
  
  const initializeMintInstruction = createInitializeMint2Instruction(
    minter.publicKey,
    2,
    pg.wallet.publicKey, //mint authority
    pg.wallet.publicKey, // freeze authority
    TOKEN_2022_PROGRAM_ID
  );
  let tx = new Transaction();
  tx = tx.add(createAccountInstruction, initializeMintInstruction);
  
  const digest = await sendAndConfirmTransaction(pg.connection, tx, [
    pg.wallet.keypair,
    minter,
  ]);
  
  console.log("minter adress:",minter.publicKey.toBase58())
  show_tx(digest);
  
  function show_tx(digest: string) {
    console.log(`https://solscan.io/tx/${digest}?cluster=devnet`);
  }
}

main();