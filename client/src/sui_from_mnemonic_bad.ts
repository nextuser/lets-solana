import * as bip39 from 'bip39';
import * as ed25519 from 'ed25519-hd-key';
import { Buffer } from 'buffer';
import { bech32 } from 'bech32';
import * as crypto from 'crypto';
import {toSuiAddress} from './sui_util'


const COIN_SUI = "784";
// import  {blake2b}  from '@noble/hashes/blake2b'
// import { bytesToHex } from '@noble/hashes/utils';

// const COIN_SUI = "784";
// const SUI_ADDRESS_LENGTH = 32;

// function normalizeSuiAddress(value, forceAdd0x = false) {
//     let address = value.toLowerCase();
//     if (!forceAdd0x && address.startsWith("0x")) {
//       address = address.slice(2);
//     }
//     return `0x${address.padStart(SUI_ADDRESS_LENGTH * 2, "0")}`;
//   }

//   function toSuiBytes(publicKey:Uint8Array) {
//     const rawBytes = publicKey;
//     const suiBytes = new Uint8Array(rawBytes.length + 1);
//     suiBytes.set([0],0);
//     suiBytes.set(rawBytes, 1);
//     console.log("toSuiBytes length:",suiBytes.length);
//     return suiBytes;
//   }


//     function toSuiAddress(publicKey:Uint8Array ) {
//         let  addressHash = blake2b(publicKey, { dkLen: 32 });
//         let address = bytesToHex(addressHash)
//         address =  address.slice(0, SUI_ADDRESS_LENGTH * 2)

//       return normalizeSuiAddress(
//         address
//       );
//     }

function getBip44Path(coinType: string): string {
    return `m/44'/${coinType}'/0'/0'/0'`;
}

function generateSuiKeysFromMnemonic(mnemonic: string) {
    // 1. 使用助记词和密码短语生成种子
    const seed =  bip39.mnemonicToSeedSync(mnemonic);
    const hexBytes = seed.toString('hex');
    
    // 2. 获取 SUI 的 BIP44 路径
    const bip44Path = getBip44Path(COIN_SUI);
    
    // 3. 派生密钥
    const derivedSeed = ed25519.derivePath(bip44Path, hexBytes);
    
    // 4. 生成私钥）
    const privateKey = derivedSeed.key;
    
    // 5. 生成带标志位的私钥（用于 SUI keystore）
    const privateKeyWithFlag = Buffer.concat([Buffer.from([0x00]), privateKey]);
    
    // 6. 生成 bech32 格式的私钥
    const words = bech32.toWords(privateKeyWithFlag);
    const suiPrivateKey = bech32.encode('suiprivkey', words);
    
    // 7. 生成公钥
    const publicKey = ed25519.getPublicKey(privateKey,true);//加前缀0
    
    // 8. 生成 SUI 地址

    const suiAddress:string = toSuiAddress(publicKey);
    
    return {
        privateKey: privateKey,
        privateKeyBech32: suiPrivateKey,
        publicKey: publicKey,
        address: suiAddress,
        keystoreEntry: privateKeyWithFlag.toString('base64')
    };
}

if(!process.env.MNEMONIC){
    console.error('MNEMONIC is not set');
    process.exit(1);
}

console.log(generateSuiKeysFromMnemonic(process.env.MNEMONIC ));
