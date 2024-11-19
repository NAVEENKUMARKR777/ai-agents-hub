import { useState, useEffect } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useNetwork } from './WalletProvider'

export default function WalletBalance() {
  const [balance, setBalance] = useState(0)
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const { network } = useNetwork()

  useEffect(() => {
    if (!publicKey) return

    const getBalance = async () => {
      try {
        const balance = await connection.getBalance(publicKey)
        setBalance(balance / LAMPORTS_PER_SOL)
      } catch (e) {
        console.error('Error getting balance:', e)
        setBalance(0)
      }
    }

    getBalance()
    const intervalId = setInterval(getBalance, 1000)

    return () => clearInterval(intervalId)
  }, [connection, publicKey, network])

  if (!publicKey) return null

  return (
    <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
      <div className="text-sm font-medium text-gray-900">
        Balance: {balance.toFixed(4)} SOL
        <span className="ml-2 text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
          {network}
        </span>
      </div>
    </div>
  )
} 