import { useEffect, useState } from 'react';
import AIStrategyService from '../services/aiStrategyService';

export default function ModelInitializer() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAI = async () => {
      try {
        const aiService = new AIStrategyService();
        await aiService.initialize();
        setIsInitialized(true);
      } catch (err) {
        console.error('Error initializing AI model:', err);
        setError(err.message);
      }
    };

    initializeAI();
  }, []);

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        Error initializing AI model: {error}
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="text-sm text-gray-600">
        Initializing AI model...
      </div>
    );
  }

  return null;
} 