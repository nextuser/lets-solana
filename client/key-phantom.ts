import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import BIP32Factory,{BIP32Interface} from 'bip32';
import dotenv from 'dotenv'

dotenv.config();
// 定义助记词
const mnemonic: string = process.env.MNEMONIC;
// 定义派生路径，这里使用 Solana 常用的 BIP - 44 派生路径
const derivationPath: string = "m/44'/501'/0'/0'";

async function generateKeypairFromMnemonic(): Promise<Keypair | null> {
    try {
        // 将助记词转换为种子
        const seed: Buffer = await bip39.mnemonicToSeed(mnemonic);

        const ecc = require('tiny-secp256k1')
        // You must wrap a tiny-secp256k1 compatible implementation
        const bip32 = BIP32Factory(ecc)
        // 从种子创建根节点
        const root: BIP32Interface = bip32.fromSeed(seed);
        // 根据指定的派生路径派生节点
        const node: BIP32Interface = root.derivePath(derivationPath);
        // 获取派生节点的私钥
        const privateKey = node.privateKey;

        if (!privateKey) {
            throw new Error('Failed to get private key from derived node.');
        }

        // 使用私钥创建 Solana 密钥对
        const keypair: Keypair = Keypair.fromSecretKey(privateKey);
        // 打印生成的公钥地址
        console.log('Generated Address:', keypair.publicKey.toString());
        return keypair;
    } catch (error) {
        console.error('Error generating keypair:', error);
        return null;
    }
}

// 调用函数生成密钥对
generateKeypairFromMnemonic();