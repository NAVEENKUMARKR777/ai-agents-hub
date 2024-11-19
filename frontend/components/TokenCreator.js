import { useState, useEffect } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { TokenService } from '../services/tokenService'
import { useNetwork } from './WalletProvider'
import { saveToken, getUserTokens } from '../services/apiService'
import Modal from './Modal'

export default function TokenCreator() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { network } = useNetwork()
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [decimals, setDecimals] = useState(9)
  const [amount, setAmount] = useState(1000000)
  const [isCreating, setIsCreating] = useState(false)
  const [tokens, setTokens] = useState([])
  const [selectedToken, setSelectedToken] = useState(null)
  const [transferAmount, setTransferAmount] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [showMintModal, setShowMintModal] = useState(false)
  const [showBurnModal, setShowBurnModal] = useState(false)
  const [modalToken, setModalToken] = useState(null)
  const [modalAmount, setModalAmount] = useState('')

  // Load tokens from MongoDB when wallet connects
  useEffect(() => {
    const loadTokens = async () => {
      if (wallet.publicKey) {
        try {
          const userTokens = await getUserTokens(wallet.publicKey.toString());
          setTokens(userTokens);
        } catch (error) {
          console.error('Error loading tokens:', error);
        }
      }
    };

    loadTokens();
  }, [wallet.publicKey]);

  const handleCreateToken = async () => {
    if (!wallet.connected) return
    
    try {
      setIsCreating(true)
      const tokenService = new TokenService(connection, wallet)
      const newToken = await tokenService.createToken(decimals, amount, tokenName, tokenSymbol)
      
      const tokenInfo = {
        wallet_address: wallet.publicKey.toString(),
        ...newToken,
        name: tokenName,
        symbol: tokenSymbol,
        decimals,
        network,
        createdAt: new Date().toISOString()
      }

      // Save to MongoDB
      await saveToken(tokenInfo)
      
      setTokens(prev => [tokenInfo, ...prev])
      setTokenName('')
      setTokenSymbol('')
      alert('Token created successfully!')
    } catch (error) {
      console.error('Error creating token:', error)
      alert('Failed to create token. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const getExplorerUrl = (address) => {
    const baseUrl = network === 'mainnet-beta' 
      ? 'https://explorer.solana.com' 
      : 'https://explorer.solana.com/?cluster=devnet'
    return `${baseUrl}/address/${address}`
  }

  const handleMint = async (token, amount) => {
    try {
      const tokenService = new TokenService(connection, wallet)
      await tokenService.mintToken(token.mint, amount)
      alert('Tokens minted successfully!')
    } catch (error) {
      console.error('Error minting tokens:', error)
      alert('Failed to mint tokens.')
    }
  }

  const handleBurn = async (token, amount) => {
    try {
      const tokenService = new TokenService(connection, wallet)
      await tokenService.burnToken(token.mint, amount)
      alert('Tokens burned successfully!')
    } catch (error) {
      console.error('Error burning tokens:', error)
      alert('Failed to burn tokens.')
    }
  }

  const handleTransfer = async (token) => {
    if (!recipientAddress || !transferAmount) {
      alert('Please enter recipient address and amount')
      return
    }
    
    try {
      const tokenService = new TokenService(connection, wallet)
      await tokenService.transferToken(token.mint, recipientAddress, Number(transferAmount))
      alert('Transfer successful!')
      setSelectedToken(null)
      setTransferAmount('')
      setRecipientAddress('')
    } catch (error) {
      console.error('Error transferring tokens:', error)
      alert('Failed to transfer tokens.')
    }
  }

  const handleDeleteToken = async (tokenToDelete) => {
    if (window.confirm('Are you sure you want to delete this token from your list?')) {
      try {
        // Remove from UI
        setTokens(prev => prev.filter(token => token.mint !== tokenToDelete.mint))
        // Remove from database
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tokens/${tokenToDelete.mint}`, {
          method: 'DELETE',
        })
      } catch (error) {
        console.error('Error deleting token:', error)
        alert('Failed to delete token.')
      }
    }
  }

  const handleMintSubmit = async () => {
    if (!modalToken || !modalAmount) return
    
    try {
      const tokenService = new TokenService(connection, wallet)
      await tokenService.mintToken(modalToken.mint, Number(modalAmount))
      alert('Tokens minted successfully!')
      setShowMintModal(false)
      setModalAmount('')
      setModalToken(null)
    } catch (error) {
      console.error('Error minting tokens:', error)
      alert('Failed to mint tokens.')
    }
  }

  const handleBurnSubmit = async () => {
    if (!modalToken || !modalAmount) return
    
    try {
      const tokenService = new TokenService(connection, wallet)
      await tokenService.burnToken(modalToken.mint, Number(modalAmount))
      alert('Tokens burned successfully!')
      setShowBurnModal(false)
      setModalAmount('')
      setModalToken(null)
    } catch (error) {
      console.error('Error burning tokens:', error)
      alert('Failed to burn tokens.')
    }
  }

  const renderTokenButtons = (token) => (
    <div className="flex flex-wrap gap-2">
      <a
        href={getExplorerUrl(token.mint)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-purple-600 hover:text-purple-800"
      >
        View on Explorer
      </a>
      
      <button
        onClick={() => {
          setModalToken(token)
          setShowMintModal(true)
        }}
        className="text-sm text-green-600 hover:text-green-800"
      >
        Mint
      </button>
      
      <button
        onClick={() => {
          setModalToken(token)
          setShowBurnModal(true)
        }}
        className="text-sm text-red-600 hover:text-red-800"
      >
        Burn
      </button>

      <button
        onClick={() => setSelectedToken(selectedToken === token ? null : token)}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        Transfer
      </button>

      <button
        onClick={() => handleDeleteToken(token)}
        className="text-sm text-gray-600 hover:text-gray-800"
      >
        Delete
      </button>
    </div>
  )

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Create New Token</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token Name
              </label>
              <input
                type="text"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="My Token"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token Symbol
              </label>
              <input
                type="text"
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="MTK"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Decimals
              </label>
              <input
                type="number"
                value={decimals}
                onChange={(e) => setDecimals(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Supply
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <button
              onClick={handleCreateToken}
              disabled={isCreating || !wallet.connected || !tokenName || !tokenSymbol}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create Token'}
            </button>
          </div>
        </div>

        {tokens.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Your Tokens</h3>
            <div className="space-y-4">
              {tokens.map((token, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{token.name} ({token.symbol})</h4>
                      <p className="text-sm text-gray-500">Created: {new Date(token.createdAt).toLocaleString()}</p>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {token.network}
                    </span>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Mint:</span> {token.mint}</p>
                    <p><span className="font-medium">Token Account:</span> {token.tokenAccount}</p>
                    <p><span className="font-medium">Initial Supply:</span> {token.amount}</p>
                  </div>

                  {renderTokenButtons(token)}

                  {selectedToken === token && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Recipient Address
                        </label>
                        <input
                          type="text"
                          value={recipientAddress}
                          onChange={(e) => setRecipientAddress(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                          placeholder="Enter recipient wallet address"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount
                        </label>
                        <input
                          type="number"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                          placeholder="Enter amount to transfer"
                        />
                      </div>
                      <button
                        onClick={() => handleTransfer(token)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                      >
                        Send Tokens
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mint Modal */}
      <Modal
        isOpen={showMintModal}
        onClose={() => {
          setShowMintModal(false)
          setModalAmount('')
          setModalToken(null)
        }}
        title="Mint Tokens"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount to Mint
            </label>
            <input
              type="number"
              value={modalAmount}
              onChange={(e) => setModalAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter amount"
            />
          </div>
          <button
            onClick={handleMintSubmit}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Mint Tokens
          </button>
        </div>
      </Modal>

      {/* Burn Modal */}
      <Modal
        isOpen={showBurnModal}
        onClose={() => {
          setShowBurnModal(false)
          setModalAmount('')
          setModalToken(null)
        }}
        title="Burn Tokens"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount to Burn
            </label>
            <input
              type="number"
              value={modalAmount}
              onChange={(e) => setModalAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter amount"
            />
          </div>
          <button
            onClick={handleBurnSubmit}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
          >
            Burn Tokens
          </button>
        </div>
      </Modal>
    </>
  )
} 