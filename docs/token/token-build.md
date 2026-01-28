# 1.下载token程序
ai说token 的开源代码在 http://github.com/solana-labs/solana-program-library/
但是这个网站说token已经转移到 http:://github.com/solana-program/spl-token
```
git clone git@github.com:solana-program/token.git
```


# 2. 编译token
## 2.1 编译token rust程序
### 2.1.1 cargo版本问题
- 问题
  提示下载cargo 1.8.6 失败， 使用rust show发现当前版本是1.9.0
```shell
[2025-11-06T08:42:58.300235788Z ERROR cargo_build_sbf] Failed to obtain package metadata: `cargo metadata` exited with an error: info: syncing channel updates for '1.86.0-x86_64-unknown-linux-gnu'
    info: downloading component 'rust'
    error: could not download nonexisten
```
- 分析
  1.8.6 不是一个很常用的版本，因为配置的rust 镜像没有这个版本。
  因为token目录下有个
```bash
 cat ../../token/rust-toolchain.toml
[toolchain]
channel = "1.86.0"

```
- 解决方案
  删除token目录下的rust-toolchain.toml文件 ,或更名成rust-toolchain.toml.bak

### 2.1.2 编译warning问题
- 问题
  ```
  warning: unexpected `cfg` condition value: `custom-heap`
 --> program/src/entrypoint.rs:9:1
  |
9 | solana_program_entrypoint::entrypoint!(process_instruction);
  | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  |
  ```
- 分析
Cargo.toml这个警告是由于 solana_program_entrypoint 宏内部使用了未在项目配置中声明的 cfg(feature = "custom-heap") 条件，而你的工作区配置中通过 check-cfg 限制了允许的 feature 值，导致不匹配。以下是解决方法：
- 解决方案
修改Cargo.toml
```Toml
[workspace.lints.rust.unexpected_cfgs]
level = "warn"
check-cfg = [
    'cfg(target_os, values("solana"))',
    'cfg(feature, values("custom-alloc", "custom-panic", "frozen-abi", "no-entrypoint"))',
]

```
## 2.2 本地部署token
- 命令和执行结果
```bash
$ solana program deploy ~/.target/deploy/spl_token.so
Program Id: GSuLFQt1zws4u1gUGDtm3hmfSSgEd1fVCR8PgF3AbgzE
Signature: 4ut73ahKQkjp62z8cx7cBtZNtzd79kvdpqkCDwu1xCudC4iWUiMwuGZdG1Wz7vzwZM2K2QiYJR98i3qb69znh5Ay


  ```
# 3. token的数据结构

## 3.1 token account （钱包的结构）,从


[state.rs](https://github.com/solana-program/token/blob/main/interface/src/state.rs)
```rust
pub struct Account {
    /// The mint associated with this account
    pub mint: Pubkey,
    /// The owner of this account.
    pub owner: Pubkey,
    /// The amount of tokens this account holds.
    pub amount: u64,
    /// If `delegate` is `Some` then `delegated_amount` represents
    /// the amount authorized by the delegate
    pub delegate: COption<Pubkey>,
    /// The account's state
    pub state: AccountState,
    /// If `is_native.is_some`, this is a native token, and the value logs the
    /// rent-exempt reserve. An Account is required to be rent-exempt, so
    /// the value is used by the Processor to ensure that wrapped SOL
    /// accounts do not drop below this threshold.
    pub is_native: COption<u64>,
    /// The amount delegated
    pub delegated_amount: u64,
    /// Optional authority to close the account.
    pub close_authority: COption<Pubkey>,
}
```
### 3.1.1 从内存分布上来看，account的数据结构
#### 3.1.1.1  创建token，和account（钱包）
- 创建token
```shell
$ spl-token create-token 
Creating token 3f15x9hFHwZGAFqGf3MYVxiDnhJxFop6itAUVFNpGLej ...

$ export TOKEN=3f15x9hFHwZGAFqGf3MYVxiDnhJxFop6itAUVFNpGLej

```
- 创建account
```shell
$ spl-token create-account $TOKEN
Creating account 2ELZpyvZHPDZM1rVpCKUDRGdQ8dxAGXAPcQWcjPPwTEx
$ export WALLET=2ELZpyvZHPDZM1rVpCKUDRGdQ8dxAGXAPcQWcjPPwTEx
```
#### 3.1.1.2 查看Account的数据：
```bash
solana account $WALLET

Public Key: 2ELZpyvZHPDZM1rVpCKUDRGdQ8dxAGXAPcQWcjPPwTEx
Balance: 0.00203928 SOL
Owner: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
Executable: false
Rent Epoch: 18446744073709551615
Length: 165 (0xa5) bytes
0000:   27 73 8a 86  72 fb 0d b5  8b 24 df 77  ac 40 c0 58   's..r....$.w.@.X
0010:   e4 89 1d e3  cd 26 15 ea  1a eb fd 5e  7b 87 1d 20   .....&.....^{.. 
0020:   b0 f3 97 56  6d 03 ee 6f  fd 17 5e 39  ef 8d 34 1b   ...Vm..o..^9..4.
0030:   16 4e 98 07  dc b5 75 75  d8 57 7a 37  01 3d 77 ea   .N....uu.Wz7.=w.
0040:   00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00   ................

```

#### 3.1.1.3 比对第一段32字节是token mint，可以将token的base58 转换成hex
```shell
$ echo $TOKEN | base58 -d  |xxd -p
27738a8672fb0db58b24df77ac40c058e4891de3cd2615ea1aebfd5e7b87

```

#### 3.1.1.3 第二个32字节数据是minter，也就是当前用户的地址
可以和3.1.1.2 对照着看
```shell
  echo `solana address` |base58 -d |xxd -p
b0f397566d03ee6ffd175e39ef8d341b164e9807dcb57575d8577a37013d

```



  ## 3.2 token mint 结构
  [state.rs](https://github.com/solana-program/token/blob/main/interface/src/state.rs)

  ```rust
pub struct Mint {
    /// Optional authority used to mint new tokens. The mint authority may only
    /// be provided during mint creation. If no mint authority is present
    /// then the mint has a fixed supply and no further tokens may be
    /// minted.
    pub mint_authority: COption<Pubkey>,
    /// Total supply of tokens.
    pub supply: u64,
    /// Number of base 10 digits to the right of the decimal place.
    pub decimals: u8,
    /// Is `true` if this structure has been initialized
    pub is_initialized: bool,
    /// Optional authority to freeze token accounts.
    pub freeze_authority: COption<Pubkey>,
}
  ```   
  ### 3.2.1 查看新创建的token的数据结构
  ```shell
ljl@ljl-lenovo:program$ solana account $TOKEN

Public Key: 3f15x9hFHwZGAFqGf3MYVxiDnhJxFop6itAUVFNpGLej
Balance: 0.0014616 SOL
Owner: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
Executable: false
Rent Epoch: 18446744073709551615
Length: 82 (0x52) bytes
0000:   01 00 00 00  b0 f3 97 56  6d 03 ee 6f  fd 17 5e 39   .......Vm..o..^9
0010:   ef 8d 34 1b  16 4e 98 07  dc b5 75 75  d8 57 7a 37   ..4..N....uu.Wz7
0020:   01 3d 77 ea  00 00 00 00  00 00 00 00  09 01 00 00   .=w.............
0030:   00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00   ................
0040:   00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00   ................
0050:   00 00                                                ..

ljl@ljl-lenovo:program$ echo `solana address` |base58 -d |xxd -p
b0f397566d03ee6ffd175e39ef8d341b164e9807dcb57575d8577a37013d
77ea

  ```
  因为第一个字段是Option， 因此第一个byte是01， 表示后面会接具有mint权限的用户，
  当前minter用户是当前执行spl-token create-token命令的用户，用solana address 可以获得。

  # 铸造代币，查看Mint.supply  Account.amount 变化

  ```shell
  spl-token mint $TOKEN 100  $WALLET
  solana account $TOKEN
  solana account $WALLET
  ```
### 代币账户查看：
```shell
ljl@ljl-lenovo:program$  solana account $TOKEN

Public Key: 3f15x9hFHwZGAFqGf3MYVxiDnhJxFop6itAUVFNpGLej
Balance: 0.0014616 SOL
Owner: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
Executable: false
Rent Epoch: 18446744073709551615
Length: 82 (0x52) bytes
0000:   01 00 00 00  b0 f3 97 56  6d 03 ee 6f  fd 17 5e 39   .......Vm..o..^9
0010:   ef 8d 34 1b  16 4e 98 07  dc b5 75 75  d8 57 7a 37   ..4..N....uu.Wz7
0020:   01 3d 77 ea  00 e8 76 48  17 00 00 00  09 01 00 00   .=w...vH........
0030:   00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00   ................
0040:   00 00 00 00  00 00 00 00  00 00 00 00  00 00 00 00   ................
0050:   00 00                                                ..

```

小端字节序的转换规则
小端字节序的特点是：低位字节存放在低地址，高位字节存放在高地址。即内存中字节的顺序需要反转后再解析为十六进制数值。
对于你看到的字节序列 [00, e8, 76, 48, 17, 00, 00, 00]，反转顺序后得到：
00 00 00 17 48 76 e8 00
转换为十六进制数值为 0x174876E800，再转为十进制是 100,000,000,000（10^11），而非 100。
因为1sol = 10^9 lamports，所以100,000,000,000 / 10^9 = 100。

  # spl-token 阅读代码的