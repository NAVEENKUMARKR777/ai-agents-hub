import { useEffect } from 'react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { useConnection } from '@solana/wallet-adapter-react'
import { useNetwork } from './WalletProvider'
import { clusterApiUrl } from '@solana/web3.js'

export default function NetworkSwitch() {
  const { network, setNetwork } = useNetwork()
  const { connection } = useConnection()

  const handleNetworkChange = async (newNetwork) => {
    setNetwork(newNetwork)
    try {
      await connection.getRecentBlockhash()
    } catch (error) {
      console.error('Network switch error:', error)
    }
  }

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-gray-700">Network:</span>
      <select 
        value={network}
        onChange={(e) => handleNetworkChange(e.target.value)}
        className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
      >
        <option value={WalletAdapterNetwork.Devnet}>Devnet</option>
        <option value={WalletAdapterNetwork.Mainnet}>Mainnet</option>
      </select>
    </div>
  )
} 