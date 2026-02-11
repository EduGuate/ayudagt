import { ScrollView, TouchableOpacity, View, ImageBackground, Linking, Modal, Pressable } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { StatusBar } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { initializeOfflineStorage, checkGuidesStored } from '@/utils/offlineStorage';
import NetInfo from '@/utils/networkUtils';
import { CustomText } from '@/components/ui/CustomText';
import { CustomView } from '@/components/ui/CustomView';
import { IconRenderer } from '@/components/ui/IconRenderer';

// ———————————————————————
// Guide data (inline so it always works, no async dependency)
// ———————————————————————
const GUIDES: Record<string, { title: string; emoji: string; color: string; steps: string[] }> = {
  fire: {
    title: 'Incendio',
    emoji: '🔥',
    color: '#F77F00',
    steps: [
      'Mantén la calma y alerta a todos en el lugar.',
      'Si el fuego es pequeño, intenta apagarlo con un extintor.',
      'Si el fuego es grande, sal inmediatamente del lugar.',
      'Gatea si hay humo — el aire es más limpio cerca del suelo.',
      'Toca las puertas antes de abrirlas. Si están calientes, busca otra salida.',
      'Llama a los Bomberos al 122 o 123.',
      'No uses el ascensor, siempre toma las escaleras.',
    ],
  },
  earthquake: {
    title: 'Terremoto',
    emoji: '🌍',
    color: '#7209B7',
    steps: [
      'Mantén la calma y no corras.',
      'Agáchate, cúbrete debajo de una mesa resistente y sujétate.',
      'Aléjate de ventanas, espejos y objetos que puedan caerse.',
      'Si estás en la calle, aléjate de edificios, árboles y cables eléctricos.',
      'Si estás en un vehículo, detente en un lugar seguro y permanece dentro.',
      'Después del temblor, revisa si hay heridos y daños.',
      'Prepárate para réplicas y mantente alerta.',
    ],
  },
  firstAid: {
    title: 'Primeros Auxilios',
    emoji: '🩹',
    color: '#F72585',
    steps: [
      'Verifica que el lugar sea seguro antes de ayudar.',
      'Llama a un adulto de confianza o al 128 (ambulancia).',
      'Si hay sangrado, presiona la herida con un trapo limpio.',
      'No muevas a la persona si sospechas una lesión en la columna.',
      'Si la persona no respira, pide ayuda inmediata.',
      'Mantén a la persona cómoda y abrigada hasta que llegue ayuda.',
      'No le des comida ni agua si está inconsciente.',
    ],
  },
  lost: {
    title: 'Me Perdí',
    emoji: '📍',
    color: '#4361EE',
    steps: [
      'Mantén la calma y quédate donde estás.',
      'Busca a un policía, guardia de seguridad o empleado de tienda.',
      'Si tienes un teléfono, llama a un familiar o al 110 (policía).',
      'No te vayas con extraños, aunque te ofrezcan ayuda.',
      'Si estás en un lugar público, busca un punto de información.',
      'Recuerda el nombre completo y teléfono de tus papás.',
      'Espera en un lugar visible y seguro.',
    ],
  },
};

const SCENARIOS = [
  { key: 'fire', label: 'Incendio', icon: 'fire', iconType: 'material-community' as const, color: '#F77F00' },
  { key: 'earthquake', label: 'Terremoto', icon: 'home-alert', iconType: 'material-community' as const, color: '#7209B7' },
  { key: 'firstAid', label: 'Primeros Auxilios', icon: 'medical-bag', iconType: 'material-community' as const, color: '#F72585' },
  { key: 'lost', label: 'Me Perdí', icon: 'map-marker-question', iconType: 'material-community' as const, color: '#4361EE' },
];

const SOS_OPTIONS = [
  { label: 'Policía', phone: '110', icon: 'police-badge', iconType: 'material-community' as const, color: '#3A86FF' },
  { label: 'Bomberos', phone: '122', icon: 'fire-extinguisher', iconType: 'fa5' as const, color: '#F8333C' },
  { label: 'Ambulancia', phone: '128', icon: 'ambulance', iconType: 'fa5' as const, color: '#B5179E' },
  { label: 'Protección Infantil', phone: '1546', icon: 'child', iconType: 'fa5' as const, color: '#4361EE' },
];

const SAFETY_TIPS = [
  { icon: 'shield-alt', iconType: 'fa5' as const, color: '#4361EE', text: 'Siempre busca la ayuda de un adulto en situaciones de emergencia.' },
  { icon: 'hand-paper', iconType: 'fa5' as const, color: '#F72585', text: 'Mantén la calma y respira profundamente si estás asustado.' },
  { icon: 'id-card', iconType: 'fa5' as const, color: '#2B9EB3', text: 'Memoriza el nombre y teléfono de tus papás o encargados.' },
  { icon: 'map-marker-alt', iconType: 'fa5' as const, color: '#F77F00', text: 'Aprende la dirección de tu casa para poder pedir ayuda.' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [isConnected, setIsConnected] = useState(true);
  const [offlineGuidesReady, setOfflineGuidesReady] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [activeGuide, setActiveGuide] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('#198EA5');
    return () => { };
  }, []));

  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) => setIsConnected(s.isConnected ?? false));
    NetInfo.fetch().then((s) => setIsConnected(s.isConnected ?? false));
    return () => unsub();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (!(await checkGuidesStored())) await initializeOfflineStorage();
        setOfflineGuidesReady(true);
      } catch (e) { console.error(e); }
    })();
  }, []);

  const guide = activeGuide ? GUIDES[activeGuide] : null;

  return (
    <CustomView style={{ flex: 1, backgroundColor: '#F8FAFF' }}>
      <ExpoStatusBar style="light" backgroundColor="#198EA5" translucent={false} />

      {/* ═══════════ SOS MODAL ═══════════ */}
      <Modal visible={showSOS} transparent animationType="fade" onRequestClose={() => setShowSOS(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }} onPress={() => setShowSOS(false)}>
          <Pressable style={{ backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: insets.bottom + 20 }}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', marginBottom: 16 }} />
              <CustomText style={{ fontSize: 20, fontWeight: 'bold', color: '#1E293B' }}>🚨 ¿A quién quieres llamar?</CustomText>
            </View>
            {SOS_OPTIONS.map((opt, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.7}
                onPress={() => { setShowSOS(false); Linking.openURL(`tel:${opt.phone}`).catch(() => { }); }}
                style={{
                  flexDirection: 'row', alignItems: 'center', backgroundColor: opt.color + '10',
                  borderRadius: 16, padding: 16, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: opt.color,
                }}
              >
                <View style={{ backgroundColor: opt.color + '20', width: 46, height: 46, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 14 }}>
                  <IconRenderer icon={opt.icon} type={opt.iconType} size={22} color={opt.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <CustomText style={{ fontSize: 16, fontWeight: '700', color: '#1E293B' }}>{opt.label}</CustomText>
                  <CustomText style={{ fontSize: 14, color: '#64748B', marginTop: 2 }}>{opt.phone}</CustomText>
                </View>
                <View style={{ backgroundColor: '#22C55E', width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}>
                  <IconRenderer icon="call" type="ionicons" size={20} color="white" />
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setShowSOS(false)} style={{ alignItems: 'center', paddingVertical: 14, marginTop: 4 }}>
              <CustomText style={{ fontSize: 15, color: '#94A3B8', fontWeight: '600' }}>Cancelar</CustomText>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ═══════════ GUIDE MODAL ═══════════ */}
      <Modal visible={!!activeGuide} transparent animationType="slide" onRequestClose={() => setActiveGuide(null)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={() => setActiveGuide(null)}>
          <Pressable style={{ flex: 1, marginTop: 60, backgroundColor: 'white', borderTopLeftRadius: 28, borderTopRightRadius: 28 }}>
            {guide && (
              <>
                {/* Guide Header */}
                <LinearGradient
                  colors={[guide.color, guide.color + 'CC']}
                  style={{ borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, alignItems: 'center' }}
                >
                  <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)', marginBottom: 16 }} />
                  <CustomText style={{ fontSize: 40, marginBottom: 8 }}>{guide.emoji}</CustomText>
                  <CustomText style={{ fontSize: 22, fontWeight: 'bold', color: 'white' }}>{guide.title}</CustomText>
                  <CustomText style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                    {guide.steps.length} pasos para tu seguridad
                  </CustomText>
                </LinearGradient>

                {/* Steps */}
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
                  {guide.steps.map((step, i) => (
                    <View key={i} style={{
                      flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16,
                      backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16,
                    }}>
                      <View style={{
                        width: 32, height: 32, borderRadius: 12, backgroundColor: guide.color + '20',
                        justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2,
                      }}>
                        <CustomText style={{ fontSize: 14, fontWeight: 'bold', color: guide.color }}>{i + 1}</CustomText>
                      </View>
                      <CustomText style={{ flex: 1, fontSize: 15, lineHeight: 22, color: '#334155' }}>
                        {step}
                      </CustomText>
                    </View>
                  ))}

                  <TouchableOpacity
                    onPress={() => setActiveGuide(null)}
                    style={{
                      backgroundColor: guide.color, borderRadius: 16, paddingVertical: 16,
                      alignItems: 'center', marginTop: 8,
                    }}
                  >
                    <CustomText style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Entendido ✓</CustomText>
                  </TouchableOpacity>
                </ScrollView>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>

        {/* Hero */}
        <ImageBackground
          source={require('@/assets/images/hover-principal.jpg')}
          style={{ width: '100%', height: 220, overflow: 'hidden' }}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(25,142,165,0.9)', 'rgba(37,99,235,0.85)']}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: insets.top + 10, paddingBottom: 20 }}
          >
            <IconRenderer icon="child" type="fa5" size={36} color="white" />
            <CustomText type="title" style={{ color: 'white', fontSize: 26, marginTop: 8, fontWeight: 'bold' }}>
              Ayuda Niños GT
            </CustomText>
            <CustomText style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 4 }}>
              Saber qué hacer puede salvar vidas
            </CustomText>
          </LinearGradient>
        </ImageBackground>

        {/* Status Badges */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginTop: 12, gap: 8 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: isConnected ? '#F0FDF4' : '#FEF2F2', borderRadius: 12, padding: 10 }}>
            <IconRenderer icon={isConnected ? 'wifi' : 'cloud-offline'} type="ionicons" size={16} color={isConnected ? '#22C55E' : '#EF4444'} />
            <CustomText style={{ marginLeft: 6, fontSize: 12, fontWeight: '600', color: isConnected ? '#22C55E' : '#EF4444' }}>
              {isConnected ? 'Conectado' : 'Sin Internet'}
            </CustomText>
          </View>
          {offlineGuidesReady && (
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderRadius: 12, padding: 10 }}>
              <IconRenderer icon="checkmark-circle" type="ionicons" size={16} color="#22C55E" />
              <CustomText style={{ marginLeft: 6, fontSize: 12, fontWeight: '600', color: '#22C55E' }}>Guías Offline ✓</CustomText>
            </View>
          )}
        </View>

        {/* SOS Button */}
        <TouchableOpacity onPress={() => setShowSOS(true)} activeOpacity={0.8} style={{ marginHorizontal: 16, marginTop: 16 }}>
          <LinearGradient
            colors={['#EF4444', '#DC2626']}
            style={{
              borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center',
              shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
            }}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 14 }}>
              <CustomText style={{ fontSize: 28 }}>🚨</CustomText>
            </View>
            <View style={{ flex: 1 }}>
              <CustomText style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>PEDIR AYUDA</CustomText>
              <CustomText style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2 }}>
                Toca para elegir a quién llamar
              </CustomText>
            </View>
            <IconRenderer icon="chevron-forward" type="ionicons" size={24} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Scenario Guides */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <CustomText style={{ fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 14 }}>
            ¿Qué hacer si…?
          </CustomText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {SCENARIOS.map((s) => (
              <TouchableOpacity
                key={s.key}
                onPress={() => setActiveGuide(s.key)}
                activeOpacity={0.8}
                style={{ width: '48%', marginBottom: 12 }}
              >
                <View style={{
                  backgroundColor: 'white', borderRadius: 20, padding: 18, alignItems: 'center',
                  shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
                  borderLeftWidth: 4, borderLeftColor: s.color,
                }}>
                  <View style={{
                    backgroundColor: s.color + '18', width: 52, height: 52, borderRadius: 18,
                    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
                  }}>
                    <IconRenderer icon={s.icon} type={s.iconType} size={26} color={s.color} />
                  </View>
                  <CustomText style={{ fontSize: 14, fontWeight: '700', color: '#1E293B', textAlign: 'center' }}>
                    {s.label}
                  </CustomText>
                  <CustomText style={{ fontSize: 11, color: s.color, marginTop: 4, fontWeight: '600' }}>
                    Ver {GUIDES[s.key].steps.length} pasos →
                  </CustomText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Safety Tips */}
        <View style={{ marginHorizontal: 16, marginTop: 8, marginBottom: 16 }}>
          <CustomText style={{ fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 14 }}>
            Consejos de Seguridad
          </CustomText>
          {SAFETY_TIPS.map((tip, i) => (
            <View key={i} style={{
              flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
              borderRadius: 16, padding: 14, marginBottom: 10,
              shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
            }}>
              <View style={{
                backgroundColor: tip.color + '15', width: 40, height: 40, borderRadius: 14,
                justifyContent: 'center', alignItems: 'center', marginRight: 12,
              }}>
                <IconRenderer icon={tip.icon} type={tip.iconType} size={18} color={tip.color} />
              </View>
              <CustomText style={{ flex: 1, color: '#475569', fontSize: 14, lineHeight: 20 }}>
                {tip.text}
              </CustomText>
            </View>
          ))}
        </View>

        {/* About */}
        <View style={{
          marginHorizontal: 16, marginBottom: 20, backgroundColor: '#EFF6FF',
          borderRadius: 20, padding: 20, alignItems: 'center',
        }}>
          <IconRenderer icon="heart" type="ionicons" size={24} color="#2563EB" />
          <CustomText style={{ fontSize: 15, fontWeight: '600', color: '#2563EB', marginTop: 8 }}>
            Ayuda Niños GT
          </CustomText>
          <CustomText style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 6, lineHeight: 19 }}>
            Aplicación diseñada para ayudar a los niños en Guatemala a saber qué hacer en una emergencia.
          </CustomText>
        </View>
      </ScrollView>
    </CustomView>
  );
}
