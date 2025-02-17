import { PublicKey } from "@solana/web3.js";
import { getMint, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { get_pg } from "./utils"; 

/**
 * 1. create token
   spl-token create-token --program-2022
 *  2. create  account
   spl-token create-account $TOKEN
 */
async function main(){
    const TOKEN_1='C33qt1dZGZSsqTrHdtLKXPZNoxs6U1ZBfyDkzmj6mXeR'  //owner=TOKEN_2022_PROGRAM_ID
    const TOKEN_2='DAb837UGzxaR8DVCYUwmxtwTfUsh1RGgD9N8dJnJ358L'  //owner=TOKEN_PROGRAM_ID
    const TOKEN_3 = 'F5hnk6LutqqFxcnQ7Q18pA7yMXtL3ezv8C2rmwEwmdoT'
    const address = new PublicKey(TOKEN_3);
    
    const pg =  get_pg();
    const mintData = await getMint(

    pg.connection,
    address,
    "confirmed",
    TOKEN_2022_PROGRAM_ID,
    );
    console.log("Mint data:", mintData);   
    console.log(
    JSON.stringify(
        mintData,
        (key, value) => {
        // Convert BigInt to String
            if (typeof value === "bigint") {
                return value.toString();
            }
            // Handle Buffer objects
            if (Buffer.isBuffer(value)) {
                return `<Buffer ${value.toString("hex")}>`;
            }
            if(Array.isArray(value) && value.length > 10){
                return `array of Length ${value.length},values: ${value.slice(0,10)} ...`;
            }
            return value;

        },
        2,
    ),
    );
}


main()