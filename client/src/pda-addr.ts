import { PublicKey } from "@solana/web3.js";
import { Buffer } from "buffer";

const programId = new PublicKey("11111111111111111111111111111111");

const [PDA, bump] = PublicKey.findProgramAddressSync([Buffer.from("pda_seed")], programId);

console.log(`PDA: ${PDA}`);
console.log(`Bump: ${bump}`);