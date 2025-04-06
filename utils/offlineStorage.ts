// Mock implementation for AsyncStorage to avoid native module errors
// This provides a simplified version that works in all environments

// In-memory storage for our mock implementation
const memoryStorage: Record<string, string> = {};

// Mock AsyncStorage implementation
const AsyncStorage = {
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      memoryStorage[key] = value;
      // Also try to use localStorage if available (for web)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },
  
  getItem: async (key: string): Promise<string | null> => {
    try {
      // Try localStorage first if available
      if (typeof localStorage !== 'undefined') {
        const value = localStorage.getItem(key);
        if (value) return Promise.resolve(value);
      }
      
      // Fall back to memory storage
      return Promise.resolve(memoryStorage[key] || null);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    try {
      delete memoryStorage[key];
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },
  
  clear: async (): Promise<void> => {
    try {
      Object.keys(memoryStorage).forEach(key => {
        delete memoryStorage[key];
      });
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
};

// Keys for storing different types of emergency guides
const STORAGE_KEYS = {
  EARTHQUAKE: 'emergency_guide_earthquake',
  FIRE: 'emergency_guide_fire',
  THEFT: 'emergency_guide_theft',
  LOST_PERSON: 'emergency_guide_lost_person',
};

// Emergency guide content
const EMERGENCY_GUIDES = {
  EARTHQUAKE: {
    title: 'Qué hacer durante un terremoto',
    steps: [
      'Mantén la calma y no corras',
      'Agáchate, cúbrete debajo de una mesa o escritorio resistente y sujétate',
      'Aléjate de ventanas, espejos y objetos que puedan caerse',
      'Si estás en la calle, aléjate de edificios, árboles y cables eléctricos',
      'Si estás en un vehículo, detente en un lugar seguro y permanece dentro'
    ],
    imageUrl: require('@/assets/images/partial-react-logo.png'), // Replace with actual image
  },
  FIRE: {
    title: 'Qué hacer en caso de incendio',
    steps: [
      'Mantén la calma y alerta a todos en el lugar',
      'Si el fuego es pequeño, intenta apagarlo con un extintor',
      'Si el fuego es grande, sal inmediatamente del lugar',
      'Gatea si hay humo, el aire es más limpio cerca del suelo',
      'Toca las puertas antes de abrirlas, si están calientes, busca otra salida',
      'Llama a los bomberos al 122 o 123'
    ],
    imageUrl: require('@/assets/images/partial-react-logo.png'), // Replace with actual image
  },
  THEFT: {
    title: 'Qué hacer en caso de robo',
    steps: [
      'Mantén la calma y no te resistas',
      'Observa las características del ladrón sin ser obvio',
      'No persigas al ladrón',
      'Busca ayuda de un adulto de confianza',
      'Llama a la policía al 110 o 120'
    ],
    imageUrl: require('@/assets/images/partial-react-logo.png'), // Replace with actual image
  },
  LOST_PERSON: {
    title: 'Qué hacer si estás perdido',
    steps: [
      'Mantén la calma y quédate donde estás',
      'Busca a un policía, guardia de seguridad o empleado de tienda',
      'Si tienes un teléfono, llama a un familiar o a la policía',
      'No te vayas con extraños',
      'Si estás en un lugar público, busca un punto de información'
    ],
    imageUrl: require('@/assets/images/partial-react-logo.png'), // Replace with actual image
  },
};

// Initialize offline storage with emergency guides
export const initializeOfflineStorage = async (): Promise<void> => {
  try {
    // Store each emergency guide
    await AsyncStorage.setItem(
      STORAGE_KEYS.EARTHQUAKE, 
      JSON.stringify(EMERGENCY_GUIDES.EARTHQUAKE)
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.FIRE, 
      JSON.stringify(EMERGENCY_GUIDES.FIRE)
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.THEFT, 
      JSON.stringify(EMERGENCY_GUIDES.THEFT)
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.LOST_PERSON, 
      JSON.stringify(EMERGENCY_GUIDES.LOST_PERSON)
    );
    
    console.log('Offline emergency guides stored successfully');
  } catch (error) {
    console.error('Error storing offline emergency guides:', error);
  }
};

// Get a specific emergency guide
export const getEmergencyGuide = async (type: keyof typeof STORAGE_KEYS): Promise<any> => {
  try {
    const guide = await AsyncStorage.getItem(STORAGE_KEYS[type]);
    return guide ? JSON.parse(guide) : null;
  } catch (error) {
    console.error(`Error retrieving ${type} guide:`, error);
    // Fallback to hardcoded guides if storage fails
    return EMERGENCY_GUIDES[type];
  }
};

// Check if emergency guides are stored
export const checkGuidesStored = async (): Promise<boolean> => {
  try {
    const earthquake = await AsyncStorage.getItem(STORAGE_KEYS.EARTHQUAKE);
    return !!earthquake;
  } catch (error) {
    console.error('Error checking guides:', error);
    return false;
  }
};

// Emergency phone numbers that work without internet
export const EMERGENCY_NUMBERS = {
  POLICE: '110',
  FIREFIGHTERS: '122',
  AMBULANCE: '128',
  CHILD_PROTECTION: '1546',
  FIREFIGHTERS_MUNICIPAL: '123',
};
