import { TokenService } from './tokenService';
import DefiService from './defiService';
import MarketDataService from './marketDataService';
import AIStrategyService from './aiStrategyService';
import RiskManagementService from './riskManagementService';
import BacktestingService from './backtestingService';
import MarketAnalysisService from './marketAnalysis';
import ModelTrainer from './training/modelTrainer';

class AgentExecutionService {
  constructor(connection, wallet) {
    this.connection = connection;
    this.wallet = wallet;
    this.tokenService = new TokenService(connection, wallet);
    this.defiService = new DefiService(connection, wallet);
    this.marketData = new MarketDataService();
    this.aiStrategy = new AIStrategyService();
    this.riskManagement = new RiskManagementService({
      maxDrawdown: 0.1,
      stopLoss: 0.05,
      positionSizing: 0.02,
      riskPerTrade: 0.01
    });
    this.marketAnalysis = new MarketAnalysisService();
    this.modelTrainer = new ModelTrainer();
  }

  async initialize() {
    await Promise.all([
      this.marketData.initialize(),
      this.aiStrategy.initialize()
    ]);
  }

  async executeTokenLauncherAgent(agent) {
    const { parameters } = agent;
    
    try {
      if (parameters.autoLaunch) {
        // Create token with agent parameters
        const newToken = await this.tokenService.createToken(
          parameters.decimals,
          parameters.initialSupply,
          `AI_${agent.name}`,
          `AI${agent.name.substring(0, 3).toUpperCase()}`
        );
        
        return {
          success: true,
          action: 'token_launch',
          data: newToken
        };
      }
    } catch (error) {
      console.error('Token launcher agent execution error:', error);
      return {
        success: false,
        action: 'token_launch',
        error: error.message
      };
    }
  }

  async executePaymentManagerAgent(agent) {
    const { parameters } = agent;
    
    try {
      if (parameters.autoTransfer && parameters.recipientList.length > 0) {
        const results = [];
        
        // Process each recipient
        for (const recipient of parameters.recipientList) {
          if (recipient.amount <= parameters.maxAmount) {
            // Execute transfer
            const signature = await this.tokenService.transferToken(
              recipient.tokenMint,
              recipient.address,
              recipient.amount
            );
            
            results.push({
              recipient: recipient.address,
              amount: recipient.amount,
              signature
            });
          }
        }
        
        return {
          success: true,
          action: 'payment_transfer',
          data: results
        };
      }
    } catch (error) {
      console.error('Payment manager agent execution error:', error);
      return {
        success: false,
        action: 'payment_transfer',
        error: error.message
      };
    }
  }

  async executeYieldOptimizerAgent(agent) {
    const { parameters } = agent;
    
    try {
      if (parameters.autoCompound) {
        // Simulate yield optimization strategy
        const strategy = await this.calculateYieldStrategy(parameters);
        
        if (strategy.expectedAPY >= parameters.minAPY) {
          // Execute the strategy
          return {
            success: true,
            action: 'yield_optimization',
            data: {
              strategy: strategy.name,
              expectedAPY: strategy.expectedAPY,
              recommendation: strategy.recommendation
            }
          };
        }
      }
    } catch (error) {
      console.error('Yield optimizer agent execution error:', error);
      return {
        success: false,
        action: 'yield_optimization',
        error: error.message
      };
    }
  }

  // Helper method to calculate yield strategy
  async calculateYieldStrategy(parameters) {
    // This would integrate with actual DeFi protocols
    // For now, returning simulated data
    const strategies = {
      low_risk: {
        name: 'Conservative Yield',
        expectedAPY: 5,
        recommendation: 'Stable LP pools'
      },
      medium_risk: {
        name: 'Balanced Yield',
        expectedAPY: 10,
        recommendation: 'Mixed LP and staking'
      },
      high_risk: {
        name: 'Aggressive Yield',
        expectedAPY: 20,
        recommendation: 'Leveraged farming'
      }
    };

    return strategies[parameters.riskLevel] || strategies.medium_risk;
  }

  async executeAgent(agent) {
    switch (agent.type) {
      case 'token_launcher':
        return await this.executeTokenLauncherAgent(agent);
      case 'payment_manager':
        return await this.executePaymentManagerAgent(agent);
      case 'yield_optimizer':
        return await this.executeYieldOptimizerAgent(agent);
      default:
        throw new Error(`Unknown agent type: ${agent.type}`);
    }
  }

  async trainAgentModel(agent) {
    try {
      // Get historical data
      const historicalData = await this.marketData.getHistoricalData(agent.parameters.symbol);
      
      // Train model
      await this.modelTrainer.createModel();
      const trainingResult = await this.modelTrainer.trainModel(historicalData);
      
      // Save model
      await this.modelTrainer.saveModel(`./models/${agent._id}`);
      
      return trainingResult;
    } catch (error) {
      console.error('Error training agent model:', error);
      throw error;
    }
  }

  async executeStrategy(agent, marketData) {
    const analysis = await this.marketAnalysis.analyzeMarket(marketData);
    const riskAssessment = await this.aiStrategy.assessRisk(marketData, agent.parameters);
    
    if (riskAssessment.riskScore > agent.parameters.maxRisk) {
      return { action: 'HOLD', reason: 'Risk too high' };
    }

    const position = await this.calculateOptimalPosition(
      analysis,
      riskAssessment,
      agent.parameters
    );

    if (position.size > 0) {
      return this.executePosition(position, agent);
    }

    return { action: 'HOLD', reason: 'No favorable conditions' };
  }

  async executePosition(position, agent) {
    try {
      if (position.type === 'BUY') {
        return await this.defiService.swapTokens(
          position.baseToken,
          position.targetToken,
          position.size
        );
      } else {
        return await this.defiService.swapTokens(
          position.targetToken,
          position.baseToken,
          position.size
        );
      }
    } catch (error) {
      console.error('Error executing position:', error);
      throw error;
    }
  }
}

export default AgentExecutionService; 