const {
    createMetadataAccountV3,
    findMetadataPda
} = require("@metaplex-foundation/mpl-token-metadata");
const web3 = require("@solana/web3.js");
const { createSignerFromKeypair, none, signerIdentity } = require("@metaplex-foundation/umi");
const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
const { fromWeb3JsKeypair, fromWeb3JsPublicKey } = require('@metaplex-foundation/umi-web3js-adapters');
import {get_pg,DEVNET_RPC_URL} from './utils'

// 从文件加载钱包密钥
function loadWalletKey(keypairFile) {
    const fs = require("fs");
    return web3.Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString()))
    );
}

async function main() {
    console.log("RUN...");
    const pg = get_pg();
    // 加载钱包密钥对并设置铸币地址
    const myKeypair = pg.wallet.keypair//loadWalletKey("id.json");
    //todo  use mint_token.ts to create token mint,  set the minter to payer
    const mint = new web3.PublicKey("7pjkkXx1e3XyDkqPxpprVzUfrR1tEDqKW7MvZ4MWS1qJ");
    console.log("mint:",mint.toBase58());
    // 使用自定义 RPC 连接到 Solana 开发网络
    const umi = createUmi(DEVNET_RPC_URL);
    // const umi = createUmi("https://api.devnet.solana.com");
    // const umi = createUmi("https://api.mainnet-beta.solana.com");

    // 设置签名者身份
    const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(myKeypair));
    umi.use(signerIdentity(signer, true));

    // 定义代币的元数据
    const onChainData = {
        name: "To Da Moon", // 代币名称
        symbol: "TDM", // 代币符号
        uri: "https://tse1-mm.cn.bing.net/th/id/OIP-C.YVV-ksyPTQIH8Zq8PMhICAHaHa",
        sellerFeeBasisPoints: 0,  // 设置销售费用为0
        creators: none(),
        collection: none(),
        uses: none(),
    };

    // 设置铸币授权和铸币地址
    const accounts = {
        mint: fromWeb3JsPublicKey(mint),
        mintAuthority: signer,
    };

    // 创建元数据账户
    const txid = await createMetadataAccountV3(umi, {
        ...accounts,
        isMutable: true, // 设置元数据可修改
        collectionDetails: null,
        data: onChainData,
    }).sendAndConfirm(umi);

    console.log(txid);
}

main();