import { WebSocket } from 'ws';

class MarketDataService {
  constructor() {
    this.subscribers = new Map();
    this.websocket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async initialize() {
    // Connect to multiple data sources
    await Promise.all([
      this.connectToPyth(),
      this.connectToSerum(),
      this.connectToOracles()
    ]);
  }

  async connectToPyth() {
    const pythConnection = new WebSocket('wss://xc-mainnet.pyth.network');
    
    pythConnection.on('message', (data) => {
      const priceData = JSON.parse(data);
      this.notifySubscribers('pyth', priceData);
    });
  }

  async connectToSerum() {
    // Implement Serum market data connection
  }

  async connectToOracles() {
    // Implement connection to other oracle services
  }

  subscribe(channel, callback) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel).add(callback);
  }

  unsubscribe(channel, callback) {
    if (this.subscribers.has(channel)) {
      this.subscribers.get(channel).delete(callback);
    }
  }

  notifySubscribers(channel, data) {
    if (this.subscribers.has(channel)) {
      this.subscribers.get(channel).forEach(callback => callback(data));
    }
  }
}

export default MarketDataService; 