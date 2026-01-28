import * as bip39 from 'bip39';
import { Keypair } from '@solana/web3.js';
import { derivePath } from 'ed25519-hd-key';
import {bytesToHex} from '@noble/hashes/utils';

/**
 * 从助记词派生Solana密钥对
 * @param mnemonic - BIP39助记词
 * @param passphrase - 可选的BIP39密码
 * @param derivationPath - 可选的BIP32派生路径，默认使用m/44'/501'/0'/0'
 * @returns Solana密钥对
 */
export function keypairFromMnemonic(
  mnemonic: string,
  passphrase: string = '',
  derivationPath: string = "m/44'/501'/0'/0'"
): Keypair {
  // 验证助记词
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic phrase');
  }

  // 从助记词生成种子
  const seed = bip39.mnemonicToSeedSync(mnemonic, passphrase);

  // 如果没有提供派生路径，直接使用种子
  if (!derivationPath || derivationPath === 'm' || derivationPath === 'm/') {
    return Keypair.fromSeed(seed.slice(0, 32));
  }

  // 使用派生路径派生密钥
  const derivedSeed = derivePath(derivationPath, seed.toString('hex')).key;

  // 从派生的种子创建Solana密钥对
  return Keypair.fromSeed(derivedSeed);
}

/**
 * 生成随机的Solana密钥对和助记词
 * @param wordCount - 助记词长度，默认12个单词
 * @param passphrase - 可选的BIP39密码
 * @param derivationPath - 可选的BIP32派生路径
 * @returns 包含助记词和密钥对的对象
 */
export function generateKeypairWithMnemonic(
  wordCount: 12 | 15 | 18 | 21 | 24 = 12,
  passphrase: string = '',
  derivationPath: string = "m/44'/501'/0'/0'"
): { mnemonic: string; keypair: Keypair } {
  // 生成随机助记词
  const mnemonic = bip39.generateMnemonic(wordCount * 4 / 3);

  // 派生密钥对
  const keypair = keypairFromMnemonic(mnemonic, passphrase, derivationPath);

  return { mnemonic, keypair };
}

// 示例用法
if (require.main === module) {
  // 生成新的助记词和密钥对
  const { mnemonic, keypair } = generateKeypairWithMnemonic();
  console.log('Mnemonic:', mnemonic);
  console.log('Public Key:', keypair.publicKey.toBase58());
  console.log('Secret Key:', bytesToHex(keypair.secretKey));

  // 从现有助记词派生密钥对
  const existingMnemonic = process.env.MNEMONIC || "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
  const derivedKeypair = keypairFromMnemonic(existingMnemonic);
  console.log('\nDerived Public Key:', derivedKeypair.publicKey.toBase58());
}