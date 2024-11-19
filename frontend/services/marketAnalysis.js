import { TechnicalAnalysis, RSI, MACD, BollingerBands } from 'trading-signals';
import Decimal from 'decimal.js';

export class MarketAnalysisService {
  constructor() {
    this.indicators = {
      rsi: new RSI(14),
      macd: new MACD(),
      bb: new BollingerBands(20)
    };
  }

  async analyzeMarket(priceData) {
    const analysis = {
      technicalIndicators: await this.calculateIndicators(priceData),
      patterns: this.detectPatterns(priceData),
      sentiment: await this.analyzeSentiment(priceData),
      volatility: this.calculateVolatility(priceData)
    };

    return this.generateSignals(analysis);
  }

  async calculateIndicators(prices) {
    prices.forEach(price => {
      this.indicators.rsi.update(new Decimal(price));
      this.indicators.macd.update(new Decimal(price));
      this.indicators.bb.update(new Decimal(price));
    });

    return {
      rsi: this.indicators.rsi.getResult(),
      macd: this.indicators.macd.getResult(),
      bollingerBands: this.indicators.bb.getResult()
    };
  }

  detectPatterns(priceData) {
    return {
      supportLevels: this.findSupportLevels(priceData),
      resistanceLevels: this.findResistanceLevels(priceData),
      trends: this.identifyTrends(priceData)
    };
  }

  async analyzeSentiment(data) {
    // Implement sentiment analysis using AI model
    const features = this.extractSentimentFeatures(data);
    const prediction = await this.aiStrategy.model.predict(features);
    return this.interpretSentiment(prediction);
  }

  calculateVolatility(prices, period = 14) {
    const returns = this.calculateReturns(prices);
    return this.standardDeviation(returns) * Math.sqrt(period);
  }

  generateSignals(analysis) {
    const signals = [];

    // RSI signals
    if (analysis.technicalIndicators.rsi < 30) {
      signals.push({ type: 'BUY', strength: 'STRONG', indicator: 'RSI' });
    } else if (analysis.technicalIndicators.rsi > 70) {
      signals.push({ type: 'SELL', strength: 'STRONG', indicator: 'RSI' });
    }

    // MACD signals
    const macd = analysis.technicalIndicators.macd;
    if (macd.MACD > macd.signal) {
      signals.push({ type: 'BUY', strength: 'MEDIUM', indicator: 'MACD' });
    } else if (macd.MACD < macd.signal) {
      signals.push({ type: 'SELL', strength: 'MEDIUM', indicator: 'MACD' });
    }

    // Bollinger Bands signals
    const bb = analysis.technicalIndicators.bollingerBands;
    const currentPrice = prices[prices.length - 1];
    if (currentPrice < bb.lower) {
      signals.push({ type: 'BUY', strength: 'MEDIUM', indicator: 'BB' });
    } else if (currentPrice > bb.upper) {
      signals.push({ type: 'SELL', strength: 'MEDIUM', indicator: 'BB' });
    }

    return this.aggregateSignals(signals);
  }

  aggregateSignals(signals) {
    const buySignals = signals.filter(s => s.type === 'BUY');
    const sellSignals = signals.filter(s => s.type === 'SELL');

    const buyStrength = this.calculateSignalStrength(buySignals);
    const sellStrength = this.calculateSignalStrength(sellSignals);

    if (buyStrength > sellStrength) {
      return { type: 'BUY', confidence: buyStrength / (buyStrength + sellStrength) };
    } else {
      return { type: 'SELL', confidence: sellStrength / (buyStrength + sellStrength) };
    }
  }

  calculateSignalStrength(signals) {
    return signals.reduce((acc, signal) => {
      const weight = signal.strength === 'STRONG' ? 1 : 0.5;
      return acc + weight;
    }, 0);
  }
} 