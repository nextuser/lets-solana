import  {blake2b}  from '@noble/hashes/blake2'
import { bytesToHex } from '@noble/hashes/utils';
import * as ed25519 from 'ed25519-hd-key';

const SUI_ADDRESS_LENGTH = 32;

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
    suiBytes.set([0],0);
    suiBytes.set(rawBytes, 1);
    console.log("toSuiBytes length:",suiBytes.length);
    return suiBytes;
  }


  export   function toSuiAddress(publicKey:Uint8Array ) {
        if(publicKey.length != 33){
            throw new Error("publicKey length must be 33");
        }
        let  addressHash = blake2b(publicKey, { dkLen: 32 });
        let address = bytesToHex(addressHash)
        address =  address.slice(0, SUI_ADDRESS_LENGTH * 2)

      return normalizeSuiAddress(
        address
      );
    }