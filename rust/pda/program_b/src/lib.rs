use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};

use bs58::encode;


entrypoint!(instruction);

fn instruction(
    program_id: &Pubkey,
    accounts : &[AccountInfo],
    data : & [u8]
) -> ProgramResult{
    let iter = &mut accounts.iter();
    let pda_account = next_account_info(iter)?;
    msg!("programeId is {}" ,encode(program_id).into_string());
    msg!("program b:instruction data={:?},length={}",
    data,data.len());
    
    msg!("successfull recieve pda {},owner={}"
    ,encode(&pda_account.key).into_string()
    ,encode(&pda_account.owner).into_string());
    
    msg!("program pda_account :data={:?},length={}",
        pda_account.data,pda_account.data_len());
    return Ok(())
}