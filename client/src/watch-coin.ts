import {
    Connection,
    PublicKey,
    Keypair,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction,
    LAMPORTS_PER_SOL,
    AccountInfo,
    ParsedAccountData,
    Commitment,
    clusterApiUrl
} from '@solana/web3.js';
import {  TOKEN_PROGRAM_ID } from '@solana/spl-token';

// 配置 Solana 网络连接
const commitment: Commitment = 'confirmed';
const connection = new Connection(clusterApiUrl('mainnet-beta'), commitment);

// 假设这是 PumpFun Meme 币的 Mint 地址
const pumpfunMintAddress = new PublicKey('YOUR_PUMPFUN_MINT_ADDRESS');

// 监听代币账户变化
async function listenForTransfers() {
    // 获取所有相关代币账户
    const tokenAccounts = await connection.getParsedTokenAccountsByMint(
        pumpfunMintAddress,
        { programId: TOKEN_PROGRAM_ID }
    );

    tokenAccounts.value.forEach(({ pubkey, account }) => {
        const parsedAccount = account.data as ParsedAccountData;
        if (parsedAccount.type === 'account') {
            connection.onAccountChange(pubkey, (newAccountInfo: AccountInfo<Buffer>) => {
                const newParsedAccount = connection.getParsedAccountInfo(pubkey).then((res) => {
                    const data = res.value?.data as ParsedAccountData;
                    if (data && data.type === 'account') {
                        console.log(`Transfer detected on account ${pubkey.toString()}`);
                        console.log(`New balance: ${data.info.tokenAmount.uiAmount}`);
                        // 在这里可以添加逻辑判断是否发起购买
                        initiatePurchase();
                    }
                });
            }, commitment);
        }
    });
}

// 发起购买的函数
async function initiatePurchase() {
    try {
        // 假设这是你的钱包私钥
        const secretKey = new Uint8Array([/* 你的私钥字节数组 */]);
        const wallet = Keypair.fromSecretKey(secretKey);

        // 假设这是购买所需的目标账户地址
        const targetAccount = new PublicKey('TARGET_ACCOUNT_ADDRESS');

        // 创建一个新的交易
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: targetAccount,
                lamports: LAMPORTS_PER_SOL * 0.1 // 假设购买所需的 SOL 数量
            })
        );

        // 发送并确认交易
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [wallet]
        );
        console.log(`Transaction sent: ${signature}`);
    } catch (error) {
        console.error('Error initiating purchase:', error);
    }
}

// 开始监听
listenForTransfers().catch((error) => {
    console.error('Error listening for transfers:', error);
});