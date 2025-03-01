# lets-solana
lets study solana

#  发币的例子
## 1. 创建mint
定义好.env  文件,需要从helius 申请一个api token

```bash
cd client 
cp env.sample .env
```


###  修改.env 文件
```bash
# file .env 
HELIUS_API_KEY={todo }
```

###  启用环境变量 和执行脚本
source .env 
npx tsx 1.token_create_mint.ts
```
可以看到类似输出
```bash
token mint: DHA6nFzzjhJCzFkDWTaysjS9EkKE5swgUCuVpH7vEJ95
```

## 2. 创建token 的metadata
### export TOKEN_MINT
需要根据前一步打印的tokenmin ,export变量 
```bash
export TOKEN_MINT=DHA6nFzzjhJCzFkDWTaysjS9EkKE5swgUCuVpH7vEJ95
```
### 执行脚本
```bash
npx tsx 2.token_decorate.ts 
```

## 3. mint token被传送给其他用户

```bash
npx tsx 3.token_mint.ts 
```

