import { 
  createMint, 
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
  burn,
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  createMintToInstruction,
  createBurnInstruction,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token'
import { 
  Keypair, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  sendAndConfirmTransaction,
} from '@solana/web3.js'

export class TokenService {
  constructor(connection, wallet) {
    this.connection = connection
    this.wallet = wallet
  }

  async createToken(decimals = 9, amount = 1000000, name = '', symbol = '') {
    try {
      if (!this.wallet.publicKey) throw new Error("Wallet not connected")

      // Generate a new keypair for the mint
      const mintKeypair = Keypair.generate()
      const mintPubkey = mintKeypair.publicKey

      // Get the minimum lamports required for the mint
      const lamports = await this.connection.getMinimumBalanceForRentExemption(82)

      // Get the associated token account address
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mintPubkey,
        this.wallet.publicKey
      )

      // Create a transaction for creating the mint account and initializing it
      const createMintTransaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: this.wallet.publicKey,
          newAccountPubkey: mintPubkey,
          space: 82,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mintPubkey,
          decimals,
          this.wallet.publicKey,
          this.wallet.publicKey,
          TOKEN_PROGRAM_ID
        ),
        createAssociatedTokenAccountInstruction(
          this.wallet.publicKey,
          associatedTokenAddress,
          this.wallet.publicKey,
          mintPubkey
        )
      )

      // Sign and send the transaction
      const signature = await this.wallet.sendTransaction(createMintTransaction, this.connection, {
        signers: [mintKeypair]
      })
      await this.connection.confirmTransaction(signature)

      // Create mint to instruction
      const mintToTransaction = new Transaction().add(
        createMintToInstruction(
          mintPubkey,
          associatedTokenAddress,
          this.wallet.publicKey,
          amount * (10 ** decimals)
        )
      )

      // Sign and send the mint transaction
      const mintSignature = await this.wallet.sendTransaction(mintToTransaction, this.connection)
      await this.connection.confirmTransaction(mintSignature)

      return {
        mint: mintPubkey.toBase58(),
        tokenAccount: associatedTokenAddress.toBase58(),
        amount,
        name,
        symbol
      }
    } catch (error) {
      console.error('Error creating token:', error)
      throw error
    }
  }

  async mintToken(mintAddress, amount) {
    try {
      const mint = new PublicKey(mintAddress)
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mint,
        this.wallet.publicKey
      )

      const transaction = new Transaction().add(
        createMintToInstruction(
          mint,
          associatedTokenAddress,
          this.wallet.publicKey,
          amount * (10 ** 9)
        )
      )

      const signature = await this.wallet.sendTransaction(transaction, this.connection)
      await this.connection.confirmTransaction(signature)
    } catch (error) {
      console.error('Error minting token:', error)
      throw error
    }
  }

  async burnToken(mintAddress, amount) {
    try {
      const mint = new PublicKey(mintAddress)
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mint,
        this.wallet.publicKey
      )

      const transaction = new Transaction().add(
        createBurnInstruction(
          associatedTokenAddress,
          mint,
          this.wallet.publicKey,
          amount * (10 ** 9)
        )
      )

      const signature = await this.wallet.sendTransaction(transaction, this.connection)
      await this.connection.confirmTransaction(signature)
    } catch (error) {
      console.error('Error burning token:', error)
      throw error
    }
  }

  async transferToken(tokenMint, recipientAddress, amount) {
    try {
      const mint = new PublicKey(tokenMint)
      const recipient = new PublicKey(recipientAddress)

      const sourceTokenAddress = await getAssociatedTokenAddress(
        mint,
        this.wallet.publicKey
      )

      const destinationTokenAddress = await getAssociatedTokenAddress(
        mint,
        recipient
      )

      // Check if destination token account exists, if not create it
      const destinationAccount = await this.connection.getAccountInfo(destinationTokenAddress)
      
      const transaction = new Transaction()

      if (!destinationAccount) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            this.wallet.publicKey,
            destinationTokenAddress,
            recipient,
            mint
          )
        )
      }

      transaction.add(
        createTransferInstruction(
          sourceTokenAddress,
          destinationTokenAddress,
          this.wallet.publicKey,
          amount * (10 ** 9)
        )
      )

      const signature = await this.wallet.sendTransaction(transaction, this.connection)
      await this.connection.confirmTransaction(signature)
      return signature
    } catch (error) {
      console.error('Error transferring token:', error)
      throw error
    }
  }
} 