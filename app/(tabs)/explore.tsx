import { Image, StyleSheet, ScrollView, TouchableOpacity, View, Text, ImageBackground, Linking, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

import { FontAwesome5, MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Definición de servicios de emergencia y apoyo en Guatemala
const SERVICES: CategoryType[] = [
  {
    category: 'Emergencias Inmediatas',
    icon: 'alert-circle',
    iconType: 'material-community' as 'material-community',
    services: [
      { 
        name: 'Policía Nacional', 
        phone: '110', 
        icon: 'police-badge', 
        color: '#3A86FF', 
        iconType: 'material-community' as 'material-community' 
      },
      { 
        name: 'Bomberos Voluntarios', 
        phone: '122', 
        icon: 'fire-extinguisher', 
        color: '#F8333C', 
        iconType: 'fa5' as 'fa5' 
      },
      { 
        name: 'Bomberos Municipales', 
        phone: '123', 
        icon: 'fire-truck', 
        color: '#F9844A', 
        iconType: 'material-community' as 'material-community' 
      },
      { 
        name: 'Ambulancia', 
        phone: '128', 
        icon: 'ambulance', 
        color: '#B5179E', 
        iconType: 'fa5' as 'fa5' 
      },
    ]
  },
  {
    category: 'Protección Infantil',
    icon: 'child',
    iconType: 'fa5' as 'fa5',
    services: [
      { 
        name: 'Procuraduría de la Niñez', 
        phone: '1546', 
        icon: 'child', 
        color: '#4361EE', 
        iconType: 'fa5' as 'fa5' 
      },
      { 
        name: 'Línea de Ayuda', 
        phone: '110', 
        icon: 'phone-alt', 
        color: '#3A86FF', 
        iconType: 'fa5' as 'fa5' 
      },
      { 
        name: 'SBS Guatemala', 
        phone: '2414-3535', 
        icon: 'home', 
        color: '#4CC9F0', 
        iconType: 'fa5' as 'fa5' 
      },
    ]
  },
  {
    category: 'Servicios Médicos',
    icon: 'medical-bag',
    iconType: 'material-community' as 'material-community',
    services: [
      { 
        name: 'Cruz Roja', 
        phone: '2381-6565', 
        icon: 'medical-services', 
        color: '#F72585', 
        iconType: 'material' as 'material' 
      },
      { 
        name: 'Hospital Roosevelt', 
        phone: '2321-7400', 
        icon: 'hospital', 
        color: '#7209B7', 
        iconType: 'fa5' as 'fa5' 
      },
      { 
        name: 'Hospital San Juan de Dios', 
        phone: '2321-9191', 
        icon: 'hospital-alt', 
        color: '#560BAD', 
        iconType: 'fa5' as 'fa5' 
      },
    ]
  },
  {
    category: 'Seguridad y Rescate',
    icon: 'shield-check',
    iconType: 'material-community' as 'material-community',
    services: [
      { 
        name: 'CONRED', 
        phone: '1566', 
        icon: 'lifebuoy', 
        color: '#F77F00', 
        iconType: 'material-community' as 'material-community' 
      },
      { 
        name: 'Policía de Tránsito', 
        phone: '1551', 
        icon: 'traffic-light', 
        color: '#FCBF49', 
        iconType: 'fa5' as 'fa5' 
      },
    ]
  },
  {
    category: 'Líneas de Apoyo',
    icon: 'hands-helping',
    iconType: 'fa5' as 'fa5',
    services: [
      { 
        name: 'Contra Violencia a la Mujer', 
        phone: '1572', 
        icon: 'female', 
        color: '#9B5DE5', 
        iconType: 'fa5' as 'fa5' 
      },
      { 
        name: 'Maltrato Animal', 
        phone: '1557', 
        icon: 'pets', 
        color: '#00BBF9', 
        iconType: 'material' as 'material' 
      },
      { 
        name: 'Ministerio Público', 
        phone: '1570', 
        icon: 'balance-scale', 
        color: '#00F5D4', 
        iconType: 'fa5' as 'fa5' 
      },
      { 
        name: 'Derechos Humanos', 
        phone: '1555', 
        icon: 'hands-helping', 
        color: '#F15BB5', 
        iconType: 'fa5' as 'fa5' 
      },
    ]
  },
];

// Definición de tipos para los servicios
type ServiceType = {
  name: string;
  phone: string;
  icon: string;
  color: string;
  iconType: 'fa5' | 'material' | 'ionicons' | 'material-community';
};

type CategoryType = {
  category: string;
  icon: string;
  iconType: 'fa5' | 'material' | 'ionicons' | 'material-community';
  services: ServiceType[];
};

// Función para manejar llamadas de emergencia
const handleServiceCall = (serviceName: string, phoneNumber: string) => {
  // Mostrar alerta o confirmación antes de llamar
  const phoneUrl = `tel:${phoneNumber}`;
  Linking.canOpenURL(phoneUrl).then((supported: boolean) => {
    if (supported) {
      Linking.openURL(phoneUrl);
    } else {
      Alert.alert('Error', 'No se puede realizar la llamada en este dispositivo');
    }
  }).catch((err: Error) => {
    console.error('Error al intentar llamar:', err);
    Alert.alert('Error', 'No se puede realizar la llamada en este momento');
  });
};

// Renderizar icono según el tipo
const renderIcon = (service: ServiceType, size = 32) => {
  // Ajuste de tamaño para íconos específicos que necesitan corrección
  let adjustedSize = size;
  
  // Íconos que necesitan ajuste de tamaño
  if (service.icon === 'hand-holding-heart') {
    adjustedSize = size - 4; // Reducir tamaño para este ícono específico
  }
  
  switch (service.iconType) {
    case 'fa5':
      return <FontAwesome5 name={service.icon as any} size={adjustedSize} color="white" />;
    case 'material':
      return <MaterialIcons name={service.icon as any} size={adjustedSize} color="white" />;
    case 'ionicons':
      return <Ionicons name={service.icon as any} size={adjustedSize} color="white" />;
    case 'material-community':
      return <MaterialCommunityIcons name={service.icon as any} size={adjustedSize} color="white" />;
    default:
      return <FontAwesome5 name="phone-alt" size={adjustedSize} color="white" />;
  }
};

export default function MasServiciosScreen() {
  const insets = useSafeAreaInsets();
  
  const renderCategoryIcon = (category: CategoryType) => {
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

  // Definición de tipos para los componentes personalizados
  type CustomViewProps = {
    style?: any;
    children: React.ReactNode;
  };

  type CustomTextProps = {
    style?: any;
    children: React.ReactNode;
    type?: 'default' | 'title' | 'subtitle';
  };

  // Componente personalizado para reemplazar ThemedView con estilos específicos
  const CustomView = ({ style, children }: CustomViewProps) => {
    return (
      <View style={style}>
        {children}
      </View>
    );
  };

  // Componente personalizado para reemplazar ThemedText con estilos específicos
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

  return (
    <>
      <ExpoStatusBar style="light" backgroundColor="#198EA5" translucent={false} />
      <ScrollView 
        style={[styles.container, {paddingTop: insets.top, paddingBottom: insets.bottom + 20}]} 
        contentContainerStyle={{paddingBottom: insets.bottom + 20}}
      >
        <View style={{width: '100%', overflow: 'hidden'}}>
          <ImageBackground
            source={require('@/assets/images/hero-image.jpg')}
            style={[styles.header, {
              paddingTop: insets.top,
              width: '100%',
              marginHorizontal: 0
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
                    <FontAwesome5 name="hands-helping" size={24} color="white" /> Servicios de Emergencia
                  </CustomText>
                  <CustomText style={styles.headerSubtitle}>
                    Directorio de ayuda en Guatemala
                  </CustomText>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>
        
        <CustomView style={styles.emergencyBanner}>
          <View style={styles.emergencyIconContainer}>
            <FontAwesome5 name="exclamation-triangle" size={24} color="white" />
          </View>
          <CustomText style={styles.emergencyText}>
            En caso de emergencia, mantén la calma y busca ayuda de un adulto
          </CustomText>
        </CustomView>
        
        {SERVICES.map((category, index) => (
          <CustomView key={index} style={styles.categoryContainer}>
            <CustomView style={styles.categoryTitleContainer}>
              <View style={styles.categoryIconContainer}>
                {renderCategoryIcon(category)}
              </View>
              <CustomText type="subtitle" style={styles.categoryTitle}>
                {category.category}
              </CustomText>
            </CustomView>
            
            <CustomView style={styles.servicesGrid}>
              {category.services.map((service, serviceIndex) => (
                <TouchableOpacity
                  key={serviceIndex}
                  style={styles.serviceButton}
                  onPress={() => handleServiceCall(service.name, service.phone)}
                  activeOpacity={0.8}
                >
                  <LinearGradient 
                    colors={[service.color, adjustColor(service.color, -20)]} 
                    style={styles.serviceGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.iconContainer}>
                      {renderIcon(service)}
                    </View>
                    <CustomText style={styles.serviceText}>{service.name}</CustomText>
                    <View style={styles.phoneContainer}>
                      <Ionicons name="call" size={12} color="white" style={{marginRight: 5}} />
                      <CustomText style={styles.phoneText}>{service.phone}</CustomText>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </CustomView>
          </CustomView>
        ))}
        
        <CustomView style={styles.footer}>

          <CustomText style={styles.footerTitle}>Información Importante</CustomText>
          
          <CustomView style={styles.footerBubble}>
            <MaterialIcons name="info" size={20} color="#F8333C" style={styles.footerIcon} />
            <CustomText style={styles.footerText}>
              Todos los números son gratuitos desde cualquier teléfono.
            </CustomText>
          </CustomView>
          
          <CustomView style={styles.footerBubble}>
            <MaterialCommunityIcons name="shield-check" size={20} color="#F8333C" style={styles.footerIcon} />
            <CustomText style={styles.footerText}>
              Estos servicios están disponibles las 24 horas del día.
            </CustomText>
          </CustomView>
        </CustomView>
      </ScrollView>
    </>
  );
}

// Función para ajustar el color (oscurecer o aclarar)
function adjustColor(color: string, amount: number): string {
  // Convertir a RGB
  let hex = color.replace('#', '');
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Ajustar
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));

  // Convertir a hex
  const rHex = Math.round(r).toString(16).padStart(2, '0');
  const gHex = Math.round(g).toString(16).padStart(2, '0');
  const bHex = Math.round(b).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
    backgroundColor: 'transparent',
  },
  serviceGradient: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  iconContainer: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
    padding: 0,
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
  footer: {
    margin: 0,
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#FFE8E0',
    borderRadius: 20,
  },
  footerLogo: {
    width: 50, 
    height: 50, 
    marginBottom: 10,
    opacity: 0.8,
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