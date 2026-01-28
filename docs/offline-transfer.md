
# 使用场景
##  假设使用用户a 向用户b 转账 ，做离线转账， 
### 机器1 有 user_a 的私钥 user_a.json, 
```bash
$ solana-keygen new -o user_a.json
$ solana airdrop 10 user_a.json

$ solana-keygen pubkey user_a.json
5PXGnujgn4krEznEg7QydU8YLEVJKfFEyJ46z3oZKRPt

```

    机器1 知道 两个用户的公约USER_A,USER_B

### 创建nonce account
```shell 
solana-keygen new -o nonce.json
solana create-nonce-account nonce.json 0.1

solana-keygen pubkey nonce.json
```

###  机器2 有user_b.json, 
  机器1 知道 两个用户的公约USER_A,USER_B
```shell
$ solana-keygen new -o user_b.json

$ solana-keygen pubkey user_b.json
DmpyfL7ZQCETqixTWVNEX44QusrezjmQDzAZg3cQoWUf
```



### 两个机器都配置公用地址
```shell
export USER_A=5PXGnujgn4krEznEg7QydU8YLEVJKfFEyJ46z3oZKRPt
export USER_B=DmpyfL7ZQCETqixTWVNEX44QusrezjmQDzAZg3cQoWUf
export NONCE=ZJuCQkpqgXisayp3KCAdPsMuXcCsxvoRo7M8v6zVyfn
```

# 离线转账的考虑
假设此时没有solana网络， a 向b 转账 1 sol。
如果a 签名好， 把签名信息和公约



### block hash show example
```shell
$ solana nonce-account $NONCE

Balance: 0.1 SOL
Minimum Balance Required: 0.00144768 SOL
Nonce blockhash: 4NXnh5LHdEMyFZU6ogWyveaQ64xKYn38hGAKT6CJuYA5
Fee: 5000 lamports per signature
Authority: 5PXGnujgn4krEznEg7QydU8YLEVJKfFEyJ46z3oZKRPt

```


### export BLOCK_HASH （这个需要在线的时候获得）
```shell
export BLOCK_HASH=`solana nonce-account $NONCE |grep blockhash |awk -F ': ' '{gsub(/[[:space:]]/, "", $2); print $2}'`
echo "blockhash is [$BLOCK_HASH]"
```
## 机器1离线签名交易 transer a =>b  
### command
```shell 
$ solana transfer $USER_B 1 \
    --blockhash $BLOCK_HASH \
    --nonce $NONCE \
    --nonce-authority $USER_A \
    --sign-only \
    --keypair user_a.json \
    --from $USER_A  \
    --fee-payer user_a.json \
    > a2b.txt
```


### offline output
```
 cat a2b.txt

Blockhash: Eo8YJRk6BhzGE2LZ44i1ebTRsFgD3uNvRguHPsPuP4Ww
Signers (Pubkey=Signature):
 5PXGnujgn4krEznEg7QydU8YLEVJKfFEyJ46z3oZKRPt=5psu7QbhJFHcy4uoH7cDgk8jSj1YcxRb96bdSjzd5wDfrA3TiKZjZBhSsA7TzDZa3SD9ytantSPXnk4wv6HJEiZn

```

### define SIGNATURE_A2B
```shell
export SIGNATURE_A2B=`cat a2b.txt |grep -A 1 Signers |grep $USER_A `
export SIGNATURE_A2B=`echo $SIGNATURE_A2B|xargs `
echo "SIGNATURE_A2B=[$SIGNATURE_A2B]"
```

## 机器1 生成变量， 以便在另一台机器使用 （可以考虑在机器2 扫描机器1 的密钥，获得公用地址和nonce， blockhash）
```bash
echo "export BLOCK_HASH=$BLOCK_HASH"
echo "export USER_A=$USER_A"
echo "export USER_B=$USER_B"
echo "export NONCE=$NONCE"
echo "export SIGNATURE_A2B='$SIGNATURE_A2B'"

```
- output sample
```shell
export BLOCK_HASH=Eo8YJRk6BhzGE2LZ44i1ebTRsFgD3uNvRguHPsPuP4Ww
export USER_A=5PXGnujgn4krEznEg7QydU8YLEVJKfFEyJ46z3oZKRPt
export USER_B=DmpyfL7ZQCETqixTWVNEX44QusrezjmQDzAZg3cQoWUf
export NONCE=ZJuCQkpqgXisayp3KCAdPsMuXcCsxvoRo7M8v6zVyfn
export SIGNATURE_A2B='5PXGnujgn4krEznEg7QydU8YLEVJKfFEyJ46z3oZKRPt=5psu7QbhJFHcy4uoH7cDgk8jSj1YcxRb96bdSjzd5wDfrA3TiKZjZBhSsA7TzDZa3SD9ytantSPXnk4wv6HJEiZn'


  ```

## 机器2 签名交易提交 
### 执行上面输出的字符串
### 机器2 提交

```shell
solana transfer $USER_B 1 \
--blockhash $BLOCK_HASH \
--nonce $NONCE \
--nonce-authority $USER_A \
--signer $SIGNATURE_A2B \
--from $USER_A \
--fee-payer $USER_A \
--allow-unfunded-recipient

```

