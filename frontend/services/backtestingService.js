class BacktestingService {
  constructor(strategy, marketData, config) {
    this.strategy = strategy;
    this.marketData = marketData;
    this.config = config;
    this.results = [];
  }

  async runBacktest(startDate, endDate) {
    const timeframe = this.marketData.slice(
      this.findDateIndex(startDate),
      this.findDateIndex(endDate)
    );

    let portfolio = this.initializePortfolio();
    
    for (const [index, data] of timeframe.entries()) {
      const signal = await this.strategy.generateSignal(data);
      if (signal) {
        const trade = await this.executeTrade(signal, portfolio, data);
        portfolio = this.updatePortfolio(portfolio, trade);
        this.results.push(this.recordTradeResult(trade, portfolio, data));
      }
    }

    return this.analyzeResults();
  }

  analyzeResults() {
    return {
      totalReturn: this.calculateTotalReturn(),
      sharpeRatio: this.calculateSharpeRatio(),
      maxDrawdown: this.calculateMaxDrawdown(),
      winRate: this.calculateWinRate(),
      trades: this.results
    };
  }

  async runMonteCarlo(iterations) {
    const simulations = [];
    for (let i = 0; i < iterations; i++) {
      const result = await this.runBacktest(
        this.config.startDate,
        this.config.endDate
      );
      simulations.push(result);
    }
    return this.analyzeSimulations(simulations);
  }
}

export default BacktestingService; 