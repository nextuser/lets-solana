import { get_pg } from "./utils";
import nacl from "tweetnacl"
import {decodeUTF8} from "tweetnacl-util"

//import {signBytes,getUtf8Encoder, getBase58Decoder, verifySignature} from "@solana/web3.js"
async function main(){
    let pg = get_pg();
    let keypair = pg.wallet.keypair;
    let message = "some messages to sign"
    let message_bytes = decodeUTF8(message)
    let signature = nacl.sign.detached(message_bytes,keypair.secretKey)
    let verified = nacl.sign.detached.verify(message_bytes,signature,keypair.publicKey.toBytes());
    console.log("verified:",verified);

}

main();