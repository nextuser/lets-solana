import {get_pg,getKeypair,getWssConnection } from "./utils";
 
(async () => {
  let keypair = getKeypair();
  let pg = await get_pg(keypair);
  // Establish new connect to devnet - websocket client connected to devnet will also be registered here
  const connection =  pg.connection;
  // Create a test wallet to listen to

   // Register a callback to listen to the wallet (ws subscription)
  connection.onAccountChange(
    keypair.publicKey,
    (updatedAccountInfo, context) =>
      console.log("Updated account info: ", updatedAccountInfo),
    "confirmed",
  );
})();