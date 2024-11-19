import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { TokenService } from '../services/tokenService'

export default function TokenTransfer() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [tokenMint, setTokenMint] = useState('')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)

  const handleTransfer = async () => {
    if (!wallet.connected || !tokenMint || !recipient || !amount) return
    
    try {
      setIsTransferring(true)
      const tokenService = new TokenService(connection, wallet)
      const signature = await tokenService.transferToken(tokenMint, recipient, Number(amount))
      alert(`Transfer successful! Signature: ${signature}`)
    } catch (error) {
      console.error('Error transferring token:', error)
      alert('Failed to transfer tokens. Please try again.')
    } finally {
      setIsTransferring(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Transfer Tokens</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Token Mint Address
          </label>
          <input
            type="text"
            value={tokenMint}
            onChange={(e) => setTokenMint(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter token mint address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter recipient wallet address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter amount to transfer"
          />
        </div>

        <button
          onClick={handleTransfer}
          disabled={isTransferring || !wallet.connected || !tokenMint || !recipient || !amount}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed"
        >
          {isTransferring ? 'Transferring...' : 'Transfer Tokens'}
        </button>
      </div>
    </div>
  )
} 