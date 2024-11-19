import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import { Matrix } from 'ml-matrix';

class AIStrategyService {
  constructor() {
    this.model = null;
    this.initialized = false;
    this.initTF();
  }

  async initTF() {
    try {
      // Try to use WebGL backend first
      await tf.setBackend('webgl');
      console.log('Using WebGL backend');
    } catch (e) {
      // Fallback to CPU
      await tf.setBackend('cpu');
      console.log('Using CPU backend');
    }
    await tf.ready();
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Create a simple model if no pre-trained model is available
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [10], units: 64, activation: 'relu' }),
          tf.layers.dropout(0.2),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dropout(0.2),
          tf.layers.dense({ units: 16, activation: 'relu' }),
          tf.layers.dense({ units: 2, activation: 'softmax' })
        ]
      });

      this.model.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
      });

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing AI model:', error);
      throw error;
    }
  }

  async assessRisk(marketData, portfolioData) {
    if (!this.initialized) await this.initialize();

    try {
      const features = this.preprocessData(marketData, portfolioData);
      const prediction = this.model.predict(features);
      return {
        riskScore: prediction.dataSync()[0],
        confidence: prediction.dataSync()[1]
      };
    } catch (error) {
      console.error('Error assessing risk:', error);
      return {
        riskScore: 0.5,
        confidence: 0
      };
    }
  }

  preprocessData(marketData, portfolioData) {
    // Convert market and portfolio data to tensor
    const features = tf.tensor2d([
      marketData.price || 0,
      marketData.volume || 0,
      marketData.volatility || 0,
      portfolioData.balance || 0,
      portfolioData.exposure || 0,
      // Add more features as needed
    ].map(v => Number(v) || 0), [1, 10]);

    return features;
  }

  // Portfolio optimization using Modern Portfolio Theory
  async optimizePortfolio(assets, returns, constraints) {
    try {
      const returnMatrix = new Matrix(returns);
      const covMatrix = this.calculateCovariance(returns);
      
      // Simple portfolio optimization
      const weights = this.calculateOptimalWeights(returnMatrix, covMatrix, constraints);
      return weights;
    } catch (error) {
      console.error('Error optimizing portfolio:', error);
      return Array(assets.length).fill(1 / assets.length); // Equal weights fallback
    }
  }

  calculateCovariance(returns) {
    const matrix = new Matrix(returns);
    return matrix.transpose().mmul(matrix).div(returns.length - 1);
  }

  calculateOptimalWeights(returns, covariance, constraints) {
    // Implement optimization logic
    // For now, return equal weights
    return Array(returns.rows).fill(1 / returns.rows);
  }
}

export default AIStrategyService; 