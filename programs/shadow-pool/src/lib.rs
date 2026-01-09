use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("BqL5WE2r6kdDPbuT7pbuNpgkbD6iL6rqTbmnQf3BybdN");

pub mod errors;
pub mod constants;

use errors::ShadowError;

#[program]
pub mod shadow_pool {
    use super::*;

    /// Initialize a new privacy pool
    pub fn initialize(
        ctx: Context<Initialize>,
        denomination: u64,
        fee_bps: u16,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.authority = ctx.accounts.authority.key();
        pool.denomination = denomination;
        pool.fee_bps = fee_bps;
        pool.fee_recipient = ctx.accounts.authority.key();
        pool.merkle_root = [0u8; 32];
        pool.current_index = 0;
        pool.total_deposited = 0;
        pool.total_withdrawn = 0;
        pool.enabled = true;
        pool.bump = ctx.bumps.pool;
        
        msg!("Privacy pool initialized with denomination: {} lamports", denomination);
        Ok(())
    }

    /// Deposit funds into the privacy pool
    pub fn deposit(
        ctx: Context<Deposit>,
        commitment: [u8; 32],
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        
        require!(pool.enabled, ShadowError::PoolInactive);
        require!(pool.current_index < 1_000_000, ShadowError::PoolFull);

        // Transfer SOL from depositor to pool vault
        let transfer_ix = system_program::Transfer {
            from: ctx.accounts.depositor.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
        };
        
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                transfer_ix,
            ),
            pool.denomination,
        )?;

        // Store commitment in nullifier account
        let nullifier = &mut ctx.accounts.nullifier;
        nullifier.commitment = commitment;
        nullifier.leaf_index = pool.current_index;
        nullifier.used = false;

        // Update pool state
        pool.current_index += 1;
        pool.total_deposited += pool.denomination;

        // Simple merkle root update (MVP - just hash commitment with index)
        let mut hasher_input = [0u8; 36];
        hasher_input[..32].copy_from_slice(&commitment);
        hasher_input[32..36].copy_from_slice(&pool.current_index.to_le_bytes());
        pool.merkle_root = simple_hash(&hasher_input);

        msg!("Deposit #{} successful", pool.current_index);
        emit!(DepositEvent {
            commitment,
            leaf_index: pool.current_index - 1,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Withdraw funds from the privacy pool
    pub fn withdraw(
        ctx: Context<Withdraw>,
        nullifier_hash: [u8; 32],
        root: [u8; 32],
        recipient: Pubkey,
        proof_a: [u8; 64],
        proof_b: [u8; 128],
        proof_c: [u8; 64],
    ) -> Result<()> {
        let pool = &ctx.accounts.pool;
        let nullifier = &mut ctx.accounts.nullifier;
        
        require!(pool.enabled, ShadowError::PoolInactive);
        require!(!nullifier.used, ShadowError::NullifierAlreadyUsed);

        // MVP: Basic proof validation (non-zero)
        let proof_valid = proof_a.iter().any(|&b| b != 0) 
            && proof_b.iter().any(|&b| b != 0) 
            && proof_c.iter().any(|&b| b != 0);
        require!(proof_valid, ShadowError::InvalidProof);

        // MVP: Accept if root matches current root
        require!(root == pool.merkle_root, ShadowError::InvalidMerkleRoot);

        // Mark nullifier as used
        nullifier.used = true;
        nullifier.nullifier_hash = nullifier_hash;

        // Calculate fee
        let fee = (pool.denomination as u128 * pool.fee_bps as u128 / 10000) as u64;
        let amount_after_fee = pool.denomination.saturating_sub(fee);

        // Transfer from vault to recipient
        **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= amount_after_fee;
        **ctx.accounts.recipient.to_account_info().try_borrow_mut_lamports()? += amount_after_fee;

        // Transfer fee if any
        if fee > 0 {
            **ctx.accounts.vault.to_account_info().try_borrow_mut_lamports()? -= fee;
            **ctx.accounts.fee_recipient.to_account_info().try_borrow_mut_lamports()? += fee;
        }

        msg!("Withdrawal successful: {} lamports to {}", amount_after_fee, recipient);
        emit!(WithdrawEvent {
            nullifier_hash,
            recipient,
            amount: amount_after_fee,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

// Simple hash function for MVP (not cryptographically secure - use Poseidon in production)
fn simple_hash(data: &[u8]) -> [u8; 32] {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    
    let mut hasher = DefaultHasher::new();
    data.hash(&mut hasher);
    let h1 = hasher.finish();
    
    let mut hasher2 = DefaultHasher::new();
    h1.hash(&mut hasher2);
    let h2 = hasher2.finish();
    
    let mut result = [0u8; 32];
    result[..8].copy_from_slice(&h1.to_le_bytes());
    result[8..16].copy_from_slice(&h2.to_le_bytes());
    result[16..24].copy_from_slice(&h1.to_be_bytes());
    result[24..32].copy_from_slice(&h2.to_be_bytes());
    result
}

// ============== ACCOUNTS ==============

#[derive(Accounts)]
#[instruction(denomination: u64)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + PrivacyPool::SIZE,
        seeds = [b"privacy_pool", denomination.to_le_bytes().as_ref()],
        bump
    )]
    pub pool: Account<'info, PrivacyPool>,
    
    /// CHECK: Vault PDA for holding funds
    #[account(
        mut,
        seeds = [b"vault", pool.key().as_ref()],
        bump
    )]
    pub vault: AccountInfo<'info>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(commitment: [u8; 32])]
pub struct Deposit<'info> {
    #[account(
        mut,
        seeds = [b"privacy_pool", pool.denomination.to_le_bytes().as_ref()],
        bump = pool.bump,
        constraint = pool.enabled @ ShadowError::PoolInactive
    )]
    pub pool: Account<'info, PrivacyPool>,
    
    #[account(
        init,
        payer = depositor,
        space = 8 + Nullifier::SIZE,
        seeds = [b"commitment", commitment.as_ref()],
        bump
    )]
    pub nullifier: Account<'info, Nullifier>,
    
    /// CHECK: Vault PDA
    #[account(
        mut,
        seeds = [b"vault", pool.key().as_ref()],
        bump
    )]
    pub vault: AccountInfo<'info>,
    
    #[account(mut)]
    pub depositor: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(nullifier_hash: [u8; 32])]
pub struct Withdraw<'info> {
    #[account(
        seeds = [b"privacy_pool", pool.denomination.to_le_bytes().as_ref()],
        bump = pool.bump,
        constraint = pool.enabled @ ShadowError::PoolInactive
    )]
    pub pool: Account<'info, PrivacyPool>,
    
    #[account(
        mut,
        seeds = [b"commitment", nullifier.commitment.as_ref()],
        bump,
        constraint = !nullifier.used @ ShadowError::NullifierAlreadyUsed
    )]
    pub nullifier: Account<'info, Nullifier>,
    
    /// CHECK: Vault PDA
    #[account(
        mut,
        seeds = [b"vault", pool.key().as_ref()],
        bump
    )]
    pub vault: AccountInfo<'info>,
    
    /// CHECK: Recipient address
    #[account(mut)]
    pub recipient: AccountInfo<'info>,
    
    /// CHECK: Fee recipient
    #[account(mut)]
    pub fee_recipient: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

// ============== STATE ==============

#[account]
pub struct PrivacyPool {
    pub authority: Pubkey,
    pub merkle_root: [u8; 32],
    pub current_index: u32,
    pub denomination: u64,
    pub total_deposited: u64,
    pub total_withdrawn: u64,
    pub enabled: bool,
    pub fee_bps: u16,
    pub fee_recipient: Pubkey,
    pub bump: u8,
}

impl PrivacyPool {
    pub const SIZE: usize = 32 + 32 + 4 + 8 + 8 + 8 + 1 + 2 + 32 + 1;
}

#[account]
pub struct Nullifier {
    pub commitment: [u8; 32],
    pub nullifier_hash: [u8; 32],
    pub leaf_index: u32,
    pub used: bool,
}

impl Nullifier {
    pub const SIZE: usize = 32 + 32 + 4 + 1;
}

// ============== EVENTS ==============

#[event]
pub struct DepositEvent {
    pub commitment: [u8; 32],
    pub leaf_index: u32,
    pub timestamp: i64,
}

#[event]
pub struct WithdrawEvent {
    pub nullifier_hash: [u8; 32],
    pub recipient: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}
