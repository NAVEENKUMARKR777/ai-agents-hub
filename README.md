# AI Agents Hub

A dashboard built on the LangChain framework that enables users to create AI agents for launching Solana tokens and managing payments via designated wallets.

## Features

- Wallet integration with Phantom
- Network switching between Devnet and Mainnet
- Token creation and management
- AI agents for automated operations
- Real-time market analysis
- Risk management system
- Yield optimization strategies

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB (v4.4 or higher)
- Phantom Wallet browser extension

## Project Structure 

AI-AGENTS-HUB/
├── frontend/ # Next.js frontend application
├── backend/ # FastAPI backend application
├── .env # Environment variables
└── README.md


## Installation

1. Clone the repository:
git clone https://github.com/NAVEENKUMARKR777/ai-agents-hub.git
cd ai-agents-hub


2. Create and configure the .env file in the root directory:
SOLANA_NETWORK=devnet
BACKEND_URL=http://localhost:8000
MONGODB_URI=mongodb://localhost:27017/ai_agents_hub

3. Install dependencies:
cd frontend
npm install
cd ../backend
pip install -r requirements.txt

4. Run the applications:
cd frontend
npm run dev
cd ../backend
uvicorn main:app -- or python main.py


## Running the Application

1. Start MongoDB:


2. Start the backend server:

bash
cd backend
python main.py
The backend will run on http://localhost:8000

3. Start the frontend development server:

bash
cd frontend
npm run dev
The frontend will run on http://localhost:3000


The frontend will run on http://localhost:3000

## Testing

1. Connect your Phantom wallet
2. Switch between Devnet and Mainnet
3. Create a token:
   - Set token name and symbol
   - Configure decimals and initial supply
   - Click "Create Token"

4. Create an AI agent:
   - Choose agent type
   - Configure parameters
   - Click "Create Agent"

5. Test token operations:
   - Mint tokens
   - Burn tokens
   - Transfer tokens
   - View on Solana Explorer

6. Test AI agent operations:
   - Execute agent tasks
   - Monitor performance
   - View analytics

## API Documentation

Backend API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Development

- Frontend is built with Next.js and Tailwind CSS
- Backend uses FastAPI and MongoDB
- Solana Web3.js for blockchain interactions
- TensorFlow.js for AI model training and inference

## Environment Variables

- `SOLANA_NETWORK`: Network to connect to (devnet/mainnet-beta)
- `BACKEND_URL`: Backend API URL
- `MONGODB_URI`: MongoDB connection string



## Troubleshooting

1. MongoDB Connection Issues:
   - Ensure MongoDB is running
   - Check MongoDB connection string
   - Verify network connectivity

2. Wallet Connection Issues:
   - Install Phantom wallet extension
   - Ensure wallet is unlocked
   - Check network selection

3. Token Creation Issues:
   - Ensure sufficient SOL balance
   - Check network connection
   - Verify transaction parameters



