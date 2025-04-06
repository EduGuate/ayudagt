// Mock implementation for NetInfo to avoid native module errors
// This provides a simplified version that works in all environments

type NetInfoState = {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  type: string;
  details: any;
};

type NetInfoSubscription = () => void;

// Default state assumes connected
const defaultState: NetInfoState = {
  isConnected: true,
  isInternetReachable: true,
  type: 'wifi',
  details: null
};

// Store the current state
let currentState = { ...defaultState };

// Store listeners
const listeners: ((state: NetInfoState) => void)[] = [];

// Simulate network changes (in a real app, this would be triggered by actual network changes)
const simulateNetworkChange = (isConnected: boolean) => {
  currentState = {
    ...currentState,
    isConnected,
    isInternetReachable: isConnected,
  };
  
  // Notify all listeners
  listeners.forEach(listener => listener(currentState));
};

// Public API that mimics @react-native-community/netinfo
export default {
  addEventListener: (listener: (state: NetInfoState) => void): NetInfoSubscription => {
    listeners.push(listener);
    
    // Initial callback with current state
    setTimeout(() => {
      listener(currentState);
    }, 0);
    
    // Return unsubscribe function
    return () => {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
  },
  
  fetch: async (): Promise<NetInfoState> => {
    // In a real implementation, this would actually check the network status
    // For our mock, we'll just return the current state
    return Promise.resolve(currentState);
  },
  
  // For testing purposes, expose a method to simulate network changes
  // This wouldn't exist in the real NetInfo API
  simulateNetworkChange,
};
