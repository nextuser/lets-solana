use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

#[derive(BorshSerialize, BorshDeserialize)]
pub struct Counter {
    pub counter: u32,
}

entrypoint!(instruction);

fn instruction(program_id: &Pubkey, accounts: &[AccountInfo], _data: &[u8]) -> ProgramResult {
    let iter = &mut accounts.iter();
    let account = next_account_info(iter)?;
    if account.owner != program_id {
        let s = format!(
            "account data owner[{}] is not programId[{}]",
            account.owner.to_string(),
            program_id.to_string()
        );
        msg!(&s[..]);
        return Err(ProgramError::IncorrectProgramId);
    }
    let mut counter: Counter = BorshDeserialize::try_from_slice(&account.data.borrow()).unwrap();
    counter.counter += 1;
    BorshSerialize::serialize(&counter, &mut *account.data.borrow_mut())?;
    msg!("Count={}", counter.counter);
    Ok({})
}
