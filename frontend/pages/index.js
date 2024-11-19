import { useWallet } from '@solana/wallet-adapter-react'
import WalletButton from '../components/WalletButton'
import Welcome from '../components/Welcome'
import Dashboard from '../components/Dashboard'

export default function Home() {
  const { connected } = useWallet()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">AI Agents Hub</h1>
            <WalletButton />
          </div>
        </div>
      </nav>
      
      {!connected ? <Welcome /> : <Dashboard />}
    </div>
  )
} 