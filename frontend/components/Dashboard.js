import { useWallet } from '@solana/wallet-adapter-react'
import { useNetwork } from './WalletProvider'
import NetworkSwitch from './NetworkSwitch'
import WalletBalance from './WalletBalance'
import AirdropButton from './AirdropButton'
import TokenCreator from './TokenCreator'
import AgentCreator from './AgentCreator'
import AgentDashboard from './AgentDashboard'
import ModelInitializer from './ModelInitializer'

export default function Dashboard() {
  const { publicKey } = useWallet()
  const { network } = useNetwork()

  return (
    <div className="max-w-6xl mx-auto p-8">
      <ModelInitializer />
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h2>
      
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <NetworkSwitch />
            <WalletBalance />
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Wallet Address:</p>
              <p className="font-mono text-sm break-all">{publicKey?.toString()}</p>
            </div>
            <div className="mt-4">
              <AirdropButton network={network} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <TokenCreator />
          </div>
          <div className="space-y-8">
            <AgentCreator />
            <AgentDashboard />
          </div>
        </div>
      </div>
    </div>
  )
} 