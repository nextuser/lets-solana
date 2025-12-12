# token 概念分析
- token mint 地址是可以是ata地址，也可以是keypair生成的地址，参考代码

  - @solana/web3.js 
    - createMint.ts
```typescript
export async function createMint(
    connection: Connection,
    payer: Signer,
    mintAuthority: PublicKey,
    freezeAuthority: PublicKey | null,
    decimals: number,
    keypair = Keypair.generate(),
    confirmOptions?: ConfirmOptions,
    programId = TOKEN_PROGRAM_ID,
): Promise<PublicKey> {
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
```

# token ATA 地址是一个派生地址 
 它的seed是  [owner, token-program-id,  token-mint]

- @solana/web3.js
  - associatedTokenAccount.ts
```typescript
export function getAssociatedTokenAddressSync(
    mint: PublicKey,
    owner: PublicKey,
    allowOwnerOffCurve = false,
    programId = TOKEN_PROGRAM_ID,
    associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID,
): PublicKey {
    if (!allowOwnerOffCurve && !PublicKey.isOnCurve(owner.toBuffer())) throw new TokenOwnerOffCurveError();

    const [address] = PublicKey.findProgramAddressSync(
        [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
        associatedTokenProgramId,
    );

    return address;
}


```