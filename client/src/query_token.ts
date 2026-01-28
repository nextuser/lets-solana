import {AccountLayout, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import {clusterApiUrl, Connection, PublicKey} from "@solana/web3.js";
import {get_pg} from './utils'
async function query_token_by_owner(owner:string) {

  let pg = get_pg();

  const tokenAccounts = await pg.connection.getTokenAccountsByOwner(
    new PublicKey(owner),
    {programId: TOKEN_PROGRAM_ID    }
  );

  console.log("Token                                         Balance  ");
  console.log("------------------------------------------------------------");
  tokenAccounts.value.forEach((tokenAccount) => {
    const accountData = AccountLayout.decode(tokenAccount.account.data);
    console.log(`${accountData.mint.toBase58()}   ${accountData.amount}  }`);
  })

}

async function query_token(owner,token?:string) {

    let pg = get_pg();

    let filter = token ? { mint : new PublicKey(token)} : { programId: TOKEN_PROGRAM_ID };
  
    const tokenAccounts = await pg.connection.getTokenAccountsByOwner(
      new PublicKey(owner),
      filter
    );
  
    console.log("Token                                         Balance  ");
    console.log("------------------------------------------------------------");
    tokenAccounts.value.forEach((tokenAccount) => {
      const accountData = AccountLayout.decode(tokenAccount.account.data);
      console.log(`${accountData.mint.toBase58()}   ${accountData.amount}  }`);
    })
  
  }

///query_token_by_owner('ArNcUm85DCJtGT82sBhBp23oEfQsQ5gSSDztaeo8GQu5')

let owner = 'ArNcUm85DCJtGT82sBhBp23oEfQsQ5gSSDztaeo8GQu5'
let token = 'D2Yd1fYM3eP5tN28MB2JkjAapXyNGfAsENFTR8XsE26e'
query_token(owner,token);

query_token(owner);
