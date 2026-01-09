use anchor_lang::prelude::*;

#[error_code]
pub enum ShadowError {
    #[msg("Pool is not active")]
    PoolInactive,
    
    #[msg("Pool is full")]
    PoolFull,
    
    #[msg("Invalid proof")]
    InvalidProof,
    
    #[msg("Invalid merkle root")]
    InvalidMerkleRoot,
    
    #[msg("Nullifier has already been used")]
    NullifierAlreadyUsed,
    
    #[msg("Invalid denomination")]
    InvalidDenomination,
    
    #[msg("Unauthorized")]
    Unauthorized,
    
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
}
