import {
    createMetadataAccountV3,
    findMetadataPda,
    DataV2Args
} from "@metaplex-foundation/mpl-token-metadata";
import * as web3  from "@solana/web3.js";
import { createSignerFromKeypair, none, signerIdentity } from "@metaplex-foundation/umi";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';

import {get_pg} from './utils'
import fs from 'fs'


//todo need export TOKEN_MIN=...



// 可以执行 token_mint.ts 生成一个token mint. 
//注意token_min 的token_account 没有被创建metadata的时候才能create
let TOKEN_MINT
if(process.env.TOKEN_MINT ){
    TOKEN_MINT = process.env.TOKEN_MINT   
} else {
    console.log("export TOKEN_MINT=.... first");
}
async function main() {
    console.log("RUN...");
    const pg = get_pg();
    // 加载钱包密钥对并设置铸币地址
    const myKeypair = pg.wallet.keypair
    const mint = new web3.PublicKey(TOKEN_MINT);
    console.log("mint:",mint.toBase58());
    // 使用自定义 RPC 连接到 Solana 开发网络
    const umi = createUmi(pg.rpc_url);
    // const umi = createUmi("https://api.devnet.solana.com");
    // const umi = createUmi("https://api.mainnet-beta.solana.com");

    // 设置签名者身份
    const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(myKeypair));
    umi.use(signerIdentity(signer, true));
    let before_meta= findMetadataPda(umi,{mint:fromWeb3JsPublicKey(mint)})
    console.log('before_meta',before_meta);
    // 定义代币的元数据
    const onChainData : DataV2Args = {
        name: "張國榮", // 代币名称
        symbol: "ZGR", // 代币符号
        //uri:"https://pic1.zhimg.com/v2-443744b0a6e268704d6d2d2ab4b6af60_r.jpg",
        uri: "https://aggregator.walrus-testnet.walrus.space/v1/Qy-RhoeUnM0o_PF6Hwj_DcidjvmrmxKmfn_ACQO01wk", // 元数据 JSON 文件链接
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

    console.log("begin ceate meta account for:",mint);

    // 创建元数据账户
    const txid = await createMetadataAccountV3(umi, {
        ...accounts,
        isMutable: true, // 设置元数据可修改
        collectionDetails: null,
        data: onChainData,
    }).sendAndConfirm(umi);
    
    console.log(txid.signature.toString());

    let after_meta= findMetadataPda(umi,{mint:fromWeb3JsPublicKey(mint)})
    console.log('afeter_meta',after_meta);
}

main();