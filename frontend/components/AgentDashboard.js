import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { getUserAgents, updateAgentStatus, deleteAgent } from '../services/agentService'
import AgentExecutionService from '../services/agentExecutionService'

const STATUS_COLORS = {
  idle: 'bg-gray-100 text-gray-800',
  running: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800'
}

export default function AgentDashboard() {
  const wallet = useWallet()
  const { connection } = useConnection()
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState({})

  useEffect(() => {
    loadAgents()
  }, [wallet.publicKey])

  const loadAgents = async () => {
    if (!wallet.publicKey) return
    try {
      const userAgents = await getUserAgents(wallet.publicKey.toString())
      setAgents(userAgents)
    } catch (error) {
      console.error('Error loading agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (agentId, newStatus) => {
    try {
      await updateAgentStatus(agentId, newStatus)
      setAgents(prev => prev.map(agent => 
        agent._id === agentId ? { ...agent, status: newStatus } : agent
      ))
    } catch (error) {
      console.error('Error updating agent status:', error)
      alert('Failed to update agent status.')
    }
  }

  const handleDeleteAgent = async (agentId) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        await deleteAgent(agentId)
        setAgents(prev => prev.filter(agent => agent._id !== agentId))
      } catch (error) {
        console.error('Error deleting agent:', error)
        alert('Failed to delete agent.')
      }
    }
  }

  const handleExecuteAgent = async (agent) => {
    if (executing[agent._id]) return;
    
    try {
      setExecuting(prev => ({ ...prev, [agent._id]: true }));
      
      // Update agent status to running
      await updateAgentStatus(agent._id, { status: 'running' });
      setAgents(prev => prev.map(a => 
        a._id === agent._id ? { ...a, status: 'running' } : a
      ));

      // Execute agent
      const executionService = new AgentExecutionService(connection, wallet);
      const result = await executionService.executeAgent(agent);

      if (result.success) {
        alert(`Agent executed successfully!\nAction: ${result.action}`);
        // Update agent status to idle
        await updateAgentStatus(agent._id, { status: 'idle' });
        setAgents(prev => prev.map(a => 
          a._id === agent._id ? { ...a, status: 'idle' } : a
        ));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error executing agent:', error);
      alert('Failed to execute agent. Check console for details.');
      // Update agent status to error
      await updateAgentStatus(agent._id, { status: 'error' });
      setAgents(prev => prev.map(a => 
        a._id === agent._id ? { ...a, status: 'error' } : a
      ));
    } finally {
      setExecuting(prev => ({ ...prev, [agent._id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        Loading agents...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Your AI Agents</h3>
        
        {agents.length === 0 ? (
          <p className="text-gray-500">No agents created yet.</p>
        ) : (
          <div className="space-y-4">
            {agents.map((agent) => (
              <div key={agent._id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium text-lg">{agent.name}</h4>
                    <p className="text-sm text-gray-500">{agent.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[agent.status]}`}>
                    {agent.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="font-medium">Type:</span> {agent.type}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span> {new Date(agent.created_at).toLocaleString()}
                  </div>
                  {agent.last_action && (
                    <div className="col-span-2">
                      <span className="font-medium">Last Action:</span> {new Date(agent.last_action).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded p-3 mb-4">
                  <h5 className="font-medium mb-2">Parameters:</h5>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(agent.parameters).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium">{key}:</span> {String(value)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <select
                    value={agent.status}
                    onChange={(e) => handleStatusChange(agent._id, e.target.value)}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    <option value="idle">Idle</option>
                    <option value="running">Running</option>
                    <option value="paused">Paused</option>
                  </select>

                  <button
                    onClick={() => handleDeleteAgent(agent._id)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
                  >
                    Delete
                  </button>

                  <button
                    onClick={() => handleExecuteAgent(agent)}
                    disabled={executing[agent._id] || agent.status === 'running'}
                    className="px-3 py-1 bg-green-100 text-green-600 rounded text-sm hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {executing[agent._id] ? 'Executing...' : 'Execute'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 