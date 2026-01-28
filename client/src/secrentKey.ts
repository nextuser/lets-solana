import {readSecretKeyFromFile } from './utils'
import * as path from 'path';
import bs58 from "bs58";
const keypair = readSecretKeyFromFile(path.resolve(process.env.HOME,'./.config/solana/id.json'));
console.log( bs58.encode(keypair.secretKey))