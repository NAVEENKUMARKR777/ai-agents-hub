import { useEffect, useState } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export default function WalletButton() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <button className="px-4 py-2 bg-purple-600 text-white rounded">Connect Wallet</button>
  }

  return <WalletMultiButton />
} 