const API_BASE_URL = 'http://localhost:8000/api';

export const saveToken = async (tokenData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokenData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving token:', error);
    throw error;
  }
};

export const getUserTokens = async (walletAddress) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tokens/${walletAddress}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting user tokens:', error);
    throw error;
  }
}; 