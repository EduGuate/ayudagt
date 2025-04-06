import { Image, StyleSheet, ScrollView, TouchableOpacity, Platform, View, Text, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { StatusBar } from 'react-native';
import { Ionicons, FontAwesome5, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { initializeOfflineStorage, getEmergencyGuide, checkGuidesStored } from '@/utils/offlineStorage';
import NetInfo from '@/utils/networkUtils';

// Define the emergency guide types
type EmergencyGuideType = 'EARTHQUAKE' | 'FIRE' | 'THEFT' | 'LOST_PERSON';

// Define icon types for type safety
type IconType = 'fa5' | 'material' | 'ionicons' | 'material-community';

// Define the structure for emergency service items
type EmergencyServiceItem = {
  name: string;
  phone?: string;
  scenario?: string;
  icon: string;
  color: string;
  iconType: IconType;
};

// Define the structure for emergency categories
type EmergencyCategory = {
  title: string;
  icon: string;
  iconType: IconType;
  color: string;
  items: EmergencyServiceItem[];
};

// Define STORAGE_KEYS locally to match what getEmergencyGuide expects
const STORAGE_KEYS = {
  EARTHQUAKE: 'EARTHQUAKE',
  FIRE: 'FIRE',
  THEFT: 'THEFT',
  LOST_PERSON: 'LOST_PERSON',
};

const EMERGENCY_NUMBERS = {
  POLICE: '110',
  FIREFIGHTERS: '122',
  FIREFIGHTERS_MUNICIPAL: '123',
  AMBULANCE: '128',
  CHILD_PROTECTION: '1546',
};

// Emergency categories for the home screen
const EMERGENCY_CATEGORIES: EmergencyCategory[] = [
  {
    title: 'Emergencias',
    icon: 'alert-circle',
    iconType: 'material-community',
    color: '#F8333C',
    items: [
      { 
        name: 'Policía', 
        phone: '110', 
        icon: 'police-badge', 
        color: '#3A86FF', 
        iconType: 'material-community'
      },
      { 
        name: 'Bomberos', 
        phone: '122', 
        icon: 'fire-extinguisher', 
        color: '#F8333C', 
        iconType: 'fa5'
      },
      { 
        name: 'Ambulancia', 
        phone: '128', 
        icon: 'ambulance', 
        color: '#B5179E', 
        iconType: 'fa5'
      },
      { 
        name: 'Protección Infantil', 
        phone: '1546', 
        icon: 'child', 
        color: '#4361EE', 
        iconType: 'fa5'
      },
    ]
  },
  {
    title: 'Guías de Emergencia',
    icon: 'book-open-page-variant',
    iconType: 'material-community',
    color: '#4CC9F0',
    items: [
      { 
        name: 'Incendio', 
        scenario: 'fire', 
        icon: 'fire', 
        color: '#F77F00', 
        iconType: 'material-community'
      },
      { 
        name: 'Terremoto', 
        scenario: 'earthquake', 
        icon: 'home-alert', 
        color: '#7209B7', 
        iconType: 'material-community'
      },
      { 
        name: 'Primeros Auxilios', 
        scenario: 'firstAid', 
        icon: 'medical-bag', 
        color: '#F72585', 
        iconType: 'material-community'
      },
      { 
        name: 'Perdido', 
        scenario: 'lost', 
        icon: 'map-marker-question', 
        color: '#4361EE', 
        iconType: 'material-community'
      },
    ]
  }
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isConnected, setIsConnected] = useState(true);
  const [offlineGuidesReady, setOfflineGuidesReady] = useState(false);
  
  // Forzar configuración del StatusBar al enfocar esta pantalla
  useFocusEffect(
    useCallback(() => {
      // Usar la API nativa de StatusBar
      StatusBar.setBarStyle('light-content');
      StatusBar.setBackgroundColor('#198EA5');
      return () => {
        // Limpieza si es necesario
      };
    }, [])
  );

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected !== null ? state.isConnected : false);
    });
    
    // Check initial connection state
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected !== null ? state.isConnected : false);
    });
    
    // For demo purposes: simulate network changes every 30 seconds
    // This is just for testing - remove in production
    const intervalId = setInterval(() => {
      // Toggle network state for demonstration
      NetInfo.simulateNetworkChange(!isConnected);
    }, 30000);
    
    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [isConnected]);
  
  // Initialize offline storage for emergency guides
  useEffect(() => {
    const prepareOfflineContent = async () => {
      try {
        // Check if guides are already stored
        const guidesStored = await checkGuidesStored();
        
        if (!guidesStored) {
          // Initialize offline storage with emergency guides
          await initializeOfflineStorage();
        }
        
        setOfflineGuidesReady(true);
      } catch (error) {
        console.error('Error preparing offline content:', error);
      }
    };
    
    prepareOfflineContent();
  }, []);
  
  // Handle emergency scenario selection
  const handleScenarioPress = async (scenarioType: string) => {
    try {
      // Map the lowercase scenario types to the uppercase keys expected by getEmergencyGuide
      const scenarioMap: Record<string, EmergencyGuideType> = {
        'fire': 'FIRE',
        'earthquake': 'EARTHQUAKE',
        'theft': 'THEFT',
        'lost': 'LOST_PERSON',
        'firstAid': 'THEFT', // Temporarily map to THEFT until we have a firstAid guide
      };
      
      const mappedType = scenarioMap[scenarioType];
      if (!mappedType) {
        console.error(`Unknown scenario type: ${scenarioType}`);
        return;
      }
      
      const guide = await getEmergencyGuide(mappedType);
      
      if (guide) {
        Alert.alert(
          guide.title,
          guide.steps.join('\n\n'),
          [{ text: 'Entendido', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Información no disponible',
          'No se pudo cargar la guía de emergencia. Por favor, intenta más tarde.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error loading emergency guide:', error);
      Alert.alert(
        'Error',
        'Ocurrió un error al cargar la información.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };
  
  // Handle emergency call buttons
  const handleEmergencyCall = (serviceType: string, phoneNumber: string) => {
    Alert.alert(
      `Llamar a ${serviceType}`,
      `¿Estás seguro que quieres llamar al ${phoneNumber}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Llamar', 
          style: 'destructive',
          onPress: () => {
            // In a real app, this would use Linking to make a phone call
            Alert.alert('Simulando llamada', `Llamando al ${phoneNumber}...`);
          }
        }
      ]
    );
  };

  // Render icon based on type
  type IconItem = {
    icon: string;
    iconType: IconType;
    color?: string;
  };

  const renderIcon = (item: IconItem, size = 32) => {
    switch (item.iconType) {
      case 'fa5':
        return <FontAwesome5 name={item.icon as any} size={size} color="white" />;
      case 'material':
        return <MaterialIcons name={item.icon as any} size={size} color="white" />;
      case 'ionicons':
        return <Ionicons name={item.icon as any} size={size} color="white" />;
      case 'material-community':
        return <MaterialCommunityIcons name={item.icon as any} size={size} color="white" />;
      default:
        return <FontAwesome5 name="question" size={size} color="white" />;
    }
  };

  // Render category icon
  const renderCategoryIcon = (category: IconItem) => {
    switch (category.iconType) {
      case 'fa5':
        return <FontAwesome5 name={category.icon as any} size={20} color="#2B9EB3" />;
      case 'material':
        return <MaterialIcons name={category.icon as any} size={20} color="#2B9EB3" />;
      case 'ionicons':
        return <Ionicons name={category.icon as any} size={20} color="#2B9EB3" />;
      case 'material-community':
        return <MaterialCommunityIcons name={category.icon as any} size={20} color="#2B9EB3" />;
      default:
        return null;
    }
  };

  // Custom components for consistent styling
  type CustomViewProps = {
    style?: any;
    children: React.ReactNode;
  };

  type CustomTextProps = {
    style?: any;
    children: React.ReactNode;
    type?: 'default' | 'title' | 'subtitle';
  };

  const CustomView = ({ style, children }: CustomViewProps) => {
    return (
      <View style={style}>
        {children}
      </View>
    );
  };

  const CustomText = ({ style, children, type = 'default' }: CustomTextProps) => {
    let textStyle = style;
    if (type === 'title') {
      textStyle = {...style, fontSize: 28, fontWeight: 'bold'};
    } else if (type === 'subtitle') {
      textStyle = {...style, fontSize: 20, fontWeight: '600'};
    }
    return (
      <Text style={textStyle}>
        {children}
      </Text>
    );
  };

  // Function to adjust color for gradient
  const adjustColor = (color: string, amount: number) => {
    const clamp = (val: number) => Math.min(255, Math.max(0, val));
    
    // Remove the leading # if it exists
    const hex = color.replace('#', '');
    
    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Adjust each color component
    const rNew = clamp(r + amount);
    const gNew = clamp(g + amount);
    const bNew = clamp(b + amount);
    
    // Convert back to hex
    const rHex = rNew.toString(16).padStart(2, '0');
    const gHex = gNew.toString(16).padStart(2, '0');
    const bHex = bNew.toString(16).padStart(2, '0');
    
    return `#${rHex}${gHex}${bHex}`;
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F8FAFF', // Use a direct color value instead of Colors.background
    },
    header: {
      width: '100%',
      height: 200,
      marginBottom: 10,
      overflow: 'hidden',
    },
    headerBackgroundImage: {
      width: '100%',
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    heroOverlay: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 20,
      paddingBottom: 30,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    heroContainer: {
      width: '90%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTextContainer: {
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 28,
      color: 'white',
      marginBottom: 8,
      textAlign: 'center',
      fontWeight: 'bold',
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 4,
    },
    headerSubtitle: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.9)',
      textAlign: 'center',
    },
    offlineContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFEED6',
      padding: 10,
      marginHorizontal: 15,
      marginTop: 10,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    offlineText: {
      fontSize: 16,
      marginLeft: 10,
      fontWeight: 'bold',
      color: '#FF6B6B',
    },
    offlineReadyContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      padding: 8,
      marginHorizontal: 15,
      marginTop: 5,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    offlineReadyText: {
      color: '#4CAF50',
      fontSize: 12,
      marginLeft: 5,
      fontWeight: '500',
    },
    emergencyBanner: {
      flexDirection: 'row',
      marginHorizontal: 15,
      marginVertical: 10,
      backgroundColor: '#FF5757',
      borderRadius: 15,
      padding: 15,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    emergencyIconContainer: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    emergencyText: {
      flex: 1,
      fontSize: 15,
      color: 'white',
      fontWeight: '600',
    },
    categoryContainer: {
      marginHorizontal: 15,
      marginTop: 15,
      marginBottom: 10,
      borderRadius: 20,
      padding: 20,
      backgroundColor: 'white',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 4,
    },
    categoryTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    categoryIconContainer: {
      backgroundColor: 'rgba(43, 158, 179, 0.1)',
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    categoryTitle: {
      fontSize: 20,
      color: '#2B9EB3',
      fontWeight: '600',
    },
    servicesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    serviceButton: {
      width: '48%',
      marginBottom: 15,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 3,
    },
    serviceGradient: {
      padding: 15,
      alignItems: 'center',
      borderRadius: 16,
    },
    iconContainer: {
      backgroundColor: 'rgba(255,255,255,0.25)',
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    serviceText: {
      color: 'white',
      marginTop: 5,
      marginBottom: 5,
      fontWeight: '600',
      textAlign: 'center',
      fontSize: 15,
    },
    phoneContainer: {
      backgroundColor: 'rgba(255,255,255,0.3)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      marginTop: 5,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    phoneText: {
      color: 'white',
      fontSize: 14,
      fontWeight: 'bold',
    },
    aboutText: {
      fontSize: 16,
      lineHeight: 24,
      color: '#333333',
      textAlign: 'center',
    },
    footer: {
      margin: 20,
      padding: 20,
      backgroundColor: '#FFE8E0',
      borderRadius: 20,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#FFCBB8',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    footerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#F8333C',
      marginBottom: 12,
    },
    footerBubble: {
      backgroundColor: 'white',
      borderRadius: 15,
      padding: 12,
      marginVertical: 6,
      width: '100%',
      borderWidth: 1,
      borderColor: '#FFCBB8',
      flexDirection: 'row',
      alignItems: 'center',
    },
    footerIcon: {
      marginRight: 10,
    },
    footerText: {
      flex: 1,
      color: '#555',
      fontSize: 14,
    },
  });

  return (
    <>
      {/* 
        Configuración de la barra de estado del dispositivo:
        - style="light": íconos blancos para mejor contraste
        - backgroundColor="#198EA5": color institucional de la app
        - translucent={false}: evita que el contenido se dibuje debajo de la barra
      */}
      <ExpoStatusBar style="light" backgroundColor="#198EA5" translucent={false} />

      {/*
        Contenedor principal desplazable con:
        - Estilos base del contenedor (styles.container)
        - Padding inferior dinámico que:
          * Considera el área segura del dispositivo (insets.bottom)
          * Añade 20px extra para evitar que el último elemento quede pegado al borde
      */}
      <ScrollView 
        style={[styles.container, {paddingTop: insets.top, paddingBottom: insets.bottom + 20}]} 
        contentContainerStyle={{paddingBottom: insets.bottom + 20}}
      >
        {/* Hero Header with Image Background */}
        {/* 
          Header hero con imagen de fondo:
          - Imagen principal (@/assets/images/hover-principal.jpg)
          - Estilo del header con padding superior dinámico (insets.top)
          - resizeMode="cover" asegura que la imagen cubra todo el espacio
        */}
        <ImageBackground
          source={require('@/assets/images/hover-principal.jpg')}
          style={[styles.header, styles.headerBackgroundImage, { 
            paddingTop: insets.top,
            marginTop: 0 // Aseguramos que no haya margen superior adicional
          }]}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(131, 141, 143, 0.85)', 'rgba(43, 158, 179, 0.9)']}
            style={styles.heroOverlay}
          >
            <View style={styles.heroContainer}>
              <View style={styles.headerTextContainer}>
                <CustomText type="title" style={styles.headerTitle}>
                  <FontAwesome5 name="child" size={24} color="white" /> Ayuda Niños GT
                </CustomText>
                <CustomText style={styles.headerSubtitle}>
                  Asistencia rápida para emergencias
                </CustomText>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
        
        {/* Offline Mode Indicator */}
        {!isConnected && (
          <CustomView style={styles.offlineContainer}>
            <Ionicons name="cloud-offline" size={20} color="#FF6B6B" />
            <CustomText style={styles.offlineText}>
              Modo Sin Internet
            </CustomText>
          </CustomView>
        )}
        
        {/* Offline Guides Ready Indicator */}
        {offlineGuidesReady && (
          <CustomView style={styles.offlineReadyContainer}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <CustomText style={styles.offlineReadyText}>
              Guías de emergencia disponibles sin internet
            </CustomText>
          </CustomView>
        )}
        
        {/* Emergency Banner */}
        <CustomView style={styles.emergencyBanner}>
          <View style={styles.emergencyIconContainer}>
            <FontAwesome5 name="exclamation-triangle" size={24} color="white" />
          </View>
          <CustomText style={styles.emergencyText}>
            En caso de emergencia, mantén la calma y busca ayuda de un adulto
          </CustomText>
        </CustomView>
        
        {/* Emergency Categories */}
        {EMERGENCY_CATEGORIES.map((category, index) => (
          <CustomView key={index} style={styles.categoryContainer}>
            <CustomView style={styles.categoryTitleContainer}>
              <View style={styles.categoryIconContainer}>
                {renderCategoryIcon(category)}
              </View>
              <CustomText type="subtitle" style={styles.categoryTitle}>
                {category.title}
              </CustomText>
            </CustomView>
            
            <CustomView style={styles.servicesGrid}>
              {category.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.serviceButton}
                  onPress={() => item.scenario 
                    ? handleScenarioPress(item.scenario) 
                    : handleEmergencyCall(item.name, item.phone || '')}
                  activeOpacity={0.8}
                >
                  <LinearGradient 
                    colors={[item.color, adjustColor(item.color, -20)]} 
                    style={styles.serviceGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.iconContainer}>
                      {renderIcon(item)}
                    </View>
                    <CustomText style={styles.serviceText}>{item.name}</CustomText>
                    {item.phone && (
                      <View style={styles.phoneContainer}>
                        <Ionicons name="call" size={12} color="white" style={{marginRight: 5}} />
                        <CustomText style={styles.phoneText}>{item.phone.toString()}</CustomText>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </CustomView>
          </CustomView>
        ))}
        
        {/* About Section */}
        <CustomView style={styles.categoryContainer}>
          <CustomView style={styles.categoryTitleContainer}>
            <View style={styles.categoryIconContainer}>
              <FontAwesome5 name="info-circle" size={20} color="#2B9EB3" />
            </View>
            <CustomText type="subtitle" style={styles.categoryTitle}>
              ¿Qué es Ayuda Niños GT?
            </CustomText>
          </CustomView>
          
          <CustomText style={styles.aboutText}>
            Ayuda Niños GT es una aplicación diseñada para ayudar a los niños en Guatemala a buscar ayuda rápidamente en situaciones de emergencia.
          </CustomText>
          
          <CustomText style={[styles.aboutText, { marginTop: 10 }]}>
            Con una interfaz amigable y fácil de usar, los niños pueden contactar a servicios de emergencia o a sus familiares con solo unos toques.
          </CustomText>
        </CustomView>
        
        {/* Footer with Safety Tips */}
        <CustomView style={styles.footer}>
          <CustomText style={styles.footerTitle}>Consejos de Seguridad</CustomText>
          
          <CustomView style={styles.footerBubble}>
            <FontAwesome5 name="shield-alt" size={20} color="#4361EE" style={styles.footerIcon} />
            <CustomText style={styles.footerText}>
              Siempre busca la ayuda de un adulto en situaciones de emergencia.
            </CustomText>
          </CustomView>
          
          <CustomView style={styles.footerBubble}>
            <FontAwesome5 name="hand-paper" size={20} color="#F72585" style={styles.footerIcon} />
            <CustomText style={styles.footerText}>
              Mantén la calma y respira profundamente si estás asustado.
            </CustomText>
          </CustomView>
        </CustomView>
      </ScrollView>
    </>
  );
}
