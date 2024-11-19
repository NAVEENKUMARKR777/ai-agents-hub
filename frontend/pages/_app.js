import '../styles/globals.css'
import { WalletContextProvider } from '../components/WalletProvider'
import { useState, useEffect } from 'react'

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-xl">Loading...</div>
    </div>
  )
}

export default function App({ Component, pageProps }) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return <Loading />
  }

  return (
    <WalletContextProvider>
      <Component {...pageProps} />
    </WalletContextProvider>
  )
} 