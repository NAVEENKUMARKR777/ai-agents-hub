export default function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gradient-to-b from-white to-gray-50 px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Welcome to AI Agents Hub</h1>
        <p className="text-xl text-gray-600 mb-12">Connect your wallet to get started</p>
        
        <div className="bg-white p-8 rounded-lg shadow-lg text-left space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Features:</h2>
          <ul className="space-y-4 text-gray-600">
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Create and manage AI agents</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Launch Solana tokens</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Manage payments and transactions</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Access DEX functionality</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Optimize yield strategies</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
} 