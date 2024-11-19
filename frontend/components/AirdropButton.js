import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

export default function AirdropButton({ network }) {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const [requesting, setRequesting] = useState(false)

  const handleAirdrop = async () => {
    if (!publicKey || network !== WalletAdapterNetwork.Devnet) return
    
    try {
      setRequesting(true)
      const signature = await connection.requestAirdrop(publicKey, 2 * LAMPORTS_PER_SOL)
      await connection.confirmTransaction(signature)
      alert('Airdrop successful!')
    } catch (error) {
      console.error('Airdrop failed:', error)
      alert('Airdrop failed. Please try again.')
    } finally {
      setRequesting(false)
    }
  }

  if (!publicKey || network !== WalletAdapterNetwork.Devnet) return null

  return (
    <button
      onClick={handleAirdrop}
      disabled={requesting}
      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors duration-200 ease-in-out shadow-sm"
    >
      {requesting ? 'Requesting...' : 'Request 2 SOL'}
    </button>
  )
} 