import { Connection, Keypair, LAMPORTS_PER_SOL,BlockheightBasedTransactionConfirmationStrategy } from "@solana/web3.js";
 
(async () => {
  const keypair = Keypair.generate();
 
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  const signature = await connection.requestAirdrop(
    keypair.publicKey,
    LAMPORTS_PER_SOL,
  );
  
  let hash = (await connection.getLatestBlockhash());
  const blockhash = hash.blockhash;
  const lastValidBlockHeight = hash.lastValidBlockHeight 
  console.log("blockhash",blockhash);
  console.log("block height", lastValidBlockHeight);

  let arg : BlockheightBasedTransactionConfirmationStrategy = {
    blockhash,
    lastValidBlockHeight,
    signature,
  }
  let ret = await connection.confirmTransaction(arg);
  console.log("blockhash",arg.blockhash);
  console.log("block height", arg.lastValidBlockHeight);
  console.log("ret:",ret);
})();