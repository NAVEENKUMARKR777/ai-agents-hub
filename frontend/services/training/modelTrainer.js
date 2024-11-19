import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';

export class ModelTrainer {
  constructor() {
    this.model = null;
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

  async createModel() {
    const model = tf.sequential();
    
    // Input layer
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu',
      inputShape: [20] // 20 features
    }));

    // Hidden layers
    model.add(tf.layers.dropout(0.2));
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    model.add(tf.layers.dropout(0.2));
    model.add(tf.layers.dense({ units: 16, activation: 'relu' }));

    // Output layer
    model.add(tf.layers.dense({ units: 2, activation: 'softmax' }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    this.model = model;
    return model;
  }

  async trainModel(trainingData, epochs = 100) {
    const { features, labels } = this.preprocessData(trainingData);
    
    const history = await this.model.fit(features, labels, {
      epochs,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
        }
      }
    });

    return history;
  }

  async saveModel(path) {
    // For browser environment, save to IndexedDB
    await this.model.save(`indexeddb://${path}`);
  }

  preprocessData(data) {
    // Convert data to tensors
    const features = tf.tensor2d(data.features);
    const labels = tf.tensor2d(data.labels);

    // Normalize features
    const normalizedFeatures = this.normalizeFeatures(features);

    return {
      features: normalizedFeatures,
      labels
    };
  }

  normalizeFeatures(features) {
    const mean = features.mean(0);
    const std = features.std(0);
    return features.sub(mean).div(std);
  }
} 