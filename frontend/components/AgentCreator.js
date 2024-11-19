import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { createAgent } from '../services/agentService'

const AGENT_TYPES = {
  token_launcher: {
    name: 'Token Launcher',
    description: 'Creates and manages token launches',
    defaultParams: {
      autoLaunch: false,
      initialSupply: 1000000,
      decimals: 9,
    }
  },
  payment_manager: {
    name: 'Payment Manager',
    description: 'Handles automated payments and transfers',
    defaultParams: {
      autoTransfer: false,
      maxAmount: 1000,
      recipientList: [],
    }
  },
  yield_optimizer: {
    name: 'Yield Optimizer',
    description: 'Optimizes yield farming strategies',
    defaultParams: {
      autoCompound: false,
      riskLevel: 'medium',
      minAPY: 5,
    }
  }
}

export default function AgentCreator() {
  const wallet = useWallet()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('token_launcher')
  const [parameters, setParameters] = useState(AGENT_TYPES.token_launcher.defaultParams)
  const [isCreating, setIsCreating] = useState(false)

  const handleTypeChange = (newType) => {
    setType(newType)
    setParameters(AGENT_TYPES[newType].defaultParams)
  }

  const handleParameterChange = (key, value) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleCreateAgent = async () => {
    if (!wallet.connected || !name || !type) return
    
    try {
      setIsCreating(true)
      const agentData = {
        wallet_address: wallet.publicKey.toString(),
        name,
        description,
        type,
        parameters,
        status: 'idle',
        created_at: new Date().toISOString(),
      }
      
      await createAgent(agentData)
      alert('Agent created successfully!')
      
      // Reset form
      setName('')
      setDescription('')
      setType('token_launcher')
      setParameters(AGENT_TYPES.token_launcher.defaultParams)
    } catch (error) {
      console.error('Error creating agent:', error)
      alert('Failed to create agent. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Create New Agent</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agent Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="My Agent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            rows="3"
            placeholder="Agent description..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agent Type
          </label>
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            {Object.entries(AGENT_TYPES).map(([key, value]) => (
              <option key={key} value={key}>
                {value.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            {AGENT_TYPES[type].description}
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Parameters</h4>
          {Object.entries(parameters).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              {typeof value === 'boolean' ? (
                <select
                  value={value.toString()}
                  onChange={(e) => handleParameterChange(key, e.target.value === 'true')}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              ) : typeof value === 'number' ? (
                <input
                  type="number"
                  value={value}
                  onChange={(e) => handleParameterChange(key, Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleParameterChange(key, e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleCreateAgent}
          disabled={isCreating || !wallet.connected || !name || !type}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed"
        >
          {isCreating ? 'Creating...' : 'Create Agent'}
        </button>
      </div>
    </div>
  )
} 