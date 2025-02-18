use borsh::{BorshDeserialize,BorshSerialize};
use solana_program::{
    account_info::{next_account_info,AccountInfo},
    program::invoke,
    program::invoke_signed,
    entrypoint,
    entrypoint::{ProgramResult} ,
    msg, 
    program_error::ProgramError, 
    pubkey::Pubkey, 
    system_instruction,
    instruction::AccountMeta, 
    sysvar::{rent::Rent,Sysvar}
    
};

#[derive(BorshSerialize,BorshDeserialize,Debug)]
pub struct DataTransferObj{
    pub x : u32,
    pub y : u32,
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id : &Pubkey,
    accounts: &[AccountInfo],
    _instructions : &[u8]
)->ProgramResult {
    let account_iter = &mut accounts.iter();
    let payer = next_account_info(account_iter)?;
    if !payer.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    let pda_account = next_account_info(account_iter)?;
    let system_program = next_account_info(account_iter)?;
    let program_b_account = next_account_info(account_iter)?;
    let (pda,bump ) = Pubkey::find_program_address(&[b"pda_seed"], program_id);
    if pda != *pda_account.key {
       return Err(ProgramError::InvalidSeeds) 
    }
    
    let rent = Rent::get()?;
    let space = std::mem::size_of::< DataTransferObj >();
    let rent_lamports = rent.minimum_balance(space);
    let from_pubkey = payer.key;
    
    let owner = program_id;
    ///let (pda_bump,_ ) = _instructions.split_first().ok_or(ProgramError::InvalidInstructionData)?;


    let signer_seeds : &[&[u8];2]= &[
         b"pda_seed",
         &[_instructions[0]]
     ];
    // let pda = Pubkey::create_program_address(signer_seeds,program_id)?;
    // if(pda.ne(&pda_account.key)){
    //     return Err(ProgramError::InvalidAccountData)
    // };
    let instruction_create = system_instruction::create_account(
        payer.key, 
        &pda, 
        rent_lamports, 
        space as u64, 
        &*program_id);

    invoke_signed(
        &instruction_create, 
        &
        [
            payer.clone(),
            pda_account.clone(),
            system_program.clone(),
        ],
        &[signer_seeds]
    );

    msg!("create PDA successfully");

    let instruction = solana_program::instruction::Instruction{
        program_id: *program_b_account.key,
        accounts: vec![AccountMeta{ pubkey: *pda_account.key,is_signer:false,is_writable:false}],
        data : vec![]
    };
    invoke_signed(&instruction,
                 &[pda_account.clone(), 
                 program_b_account.clone()],
                &[&[b"pda_seed", &[bump]]]
                )?;


    Ok(())    
}
