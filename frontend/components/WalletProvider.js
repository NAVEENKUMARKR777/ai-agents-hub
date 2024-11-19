import { useMemo, useEffect, useState, createContext, useContext } from 'react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'

require('@solana/wallet-adapter-react-ui/styles.css')

const NetworkContext = createContext(null)

export function WalletContextProvider({ children }) {
  const [mounted, setMounted] = useState(false)
  const [network, setNetwork] = useState(WalletAdapterNetwork.Devnet)
  
  const endpoint = useMemo(() => clusterApiUrl(network), [network])
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [])

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <NetworkContext.Provider value={{ network, setNetwork }}>
      <ConnectionProvider endpoint={endpoint} config={{ commitment: 'confirmed' }}>
        <SolanaWalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            {mounted && children}
          </WalletModalProvider>
        </SolanaWalletProvider>
      </ConnectionProvider>
    </NetworkContext.Provider>
  )
}

export const useNetwork = () => {
  const context = useContext(NetworkContext)
  if (!context) {
    throw new Error('useNetwork must be used within a WalletContextProvider')
  }
  return context
} 