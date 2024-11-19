class RiskManagementService {
  constructor(config) {
    this.maxDrawdown = config.maxDrawdown;
    this.stopLoss = config.stopLoss;
    this.positionSizing = config.positionSizing;
    this.riskPerTrade = config.riskPerTrade;
  }

  // Calculate Value at Risk (VaR)
  calculateVaR(portfolio, confidence = 0.95) {
    const returns = this.calculateHistoricalReturns(portfolio);
    const sortedReturns = returns.sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sortedReturns.length);
    return sortedReturns[index];
  }

  // Monitor portfolio risk
  monitorRisk(portfolio, marketData) {
    const currentRisk = this.assessCurrentRisk(portfolio, marketData);
    const riskLimits = this.calculateRiskLimits(portfolio);
    return this.generateRiskAlerts(currentRisk, riskLimits);
  }

  // Position sizing calculations
  calculatePositionSize(capital, risk, entryPrice, stopLoss) {
    const riskAmount = capital * (risk / 100);
    const stopLossDistance = Math.abs(entryPrice - stopLoss);
    return (riskAmount / stopLossDistance);
  }

  // Risk-adjusted returns
  calculateSharpeRatio(returns, riskFreeRate) {
    const excessReturns = returns.map(r => r - riskFreeRate);
    const avgExcessReturn = this.average(excessReturns);
    const stdDev = this.standardDeviation(excessReturns);
    return avgExcessReturn / stdDev;
  }
}

export default RiskManagementService; 