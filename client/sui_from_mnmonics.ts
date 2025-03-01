import { derivePath,getPublicKey } from 'ed25519-hd-key';
import  { mnemonicToSeedSync } from 'bip39';
import  { bech32 } from 'bech32';
import { base64 } from '@metaplex-foundation/umi/serializers';
import  {blake2b}  from '@noble/hashes/blake2b'
import { sha3_256 } from 'js-sha3';
//const crypto = require('crypto');
import crypto from 'crypto'
import dotenv from 'dotenv'
dotenv.config();
import { bytesToHex } from '@noble/hashes/utils';
const SUI_ADDRESS_LENGTH=32

function normalizeSuiAddress(value, forceAdd0x = false) {
    let address = value.toLowerCase();
    if (!forceAdd0x && address.startsWith("0x")) {
      address = address.slice(2);
    }
    return `0x${address.padStart(SUI_ADDRESS_LENGTH * 2, "0")}`;
  }

  function toSuiBytes(publicKey:Uint8Array) {
    const rawBytes = publicKey;
    const suiBytes = new Uint8Array(rawBytes.length + 1);
    suiBytes.set([0]);
    suiBytes.set(rawBytes, 1);
    console.log("toSuiBytes length:",suiBytes.length);
    return suiBytes;
  }
  /**
   * Return the Sui address associated with this Ed25519 public key
   */
  function toSuiAddress(publicKey:Uint8Array ) {
    return normalizeSuiAddress(
      bytesToHex(blake2b(toSuiBytes(publicKey), { dkLen: 32 })).slice(0, SUI_ADDRESS_LENGTH * 2)
    );
  }



(async () => {
  // 示例助记词和路径
  const mnemonic = process.env.MNEMONIC;
  if(!mnemonic){
    console.log("export MNEMONIC=... first");
    return;
  }
  const derivationPath = "m/44'/784'/0'/0'/0'";

  // 步骤 1：生成种子
  const seed = mnemonicToSeedSync(mnemonic);
  console.log("Seed (hex):", seed.toString('hex'));

  // 步骤 2：派生私钥
  const { key: privateKey } = derivePath(derivationPath, seed.toString('hex'));
  console.log("Raw Private Key (hex):", privateKey.toString('hex'));

  // 步骤 3：生成 suiprivkey
  const privateKeyWithFlag = Buffer.concat([Buffer.from([0x00]), privateKey]);
  const words = bech32.toWords(privateKeyWithFlag);
  const suiPrivateKey = bech32.encode('suiprivkey', words);
  console.log("suiprivkey:", suiPrivateKey);

  // 步骤 4：生成 sui.keystore
  const keystoreEntry = privateKeyWithFlag.toString('base64');
  console.log("sui.keystore Entry:", keystoreEntry);

  // 步骤 5：生成公钥   注意这里因为私钥前面没有加0,需要第二个参数设置为false
  const publicKey = await getPublicKey(privateKey,false);

  console.log("base64 addr",base64.deserialize(publicKey))
  const suiAddress: string =  toSuiAddress(publicKey)
  console.log("Sui Address:", suiAddress);
})();