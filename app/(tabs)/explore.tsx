import React, { useState, useMemo } from 'react';
import { ScrollView, TouchableOpacity, View, Linking, Alert, TextInput } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CustomText } from '@/components/ui/CustomText';
import { CustomView } from '@/components/ui/CustomView';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { adjustColor } from '@/utils/colorUtils';
import { EXPLORE_SERVICES } from '@/constants/EmergencyData';

export default function MasServiciosScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filteredServices = useMemo(() => {
    if (!search.trim()) return EXPLORE_SERVICES;
    const q = search.toLowerCase();
    return EXPLORE_SERVICES
      .map(cat => ({
        ...cat,
        items: cat.items.filter(
          svc => svc.name.toLowerCase().includes(q) || (svc.phone && svc.phone.includes(q))
        ),
      }))
      .filter(cat => cat.items.length > 0);
  }, [search]);

  const handleCall = (name: string, phone: string) => {
    const url = `tel:${phone}`;
    Linking.canOpenURL(url)
      .then(ok => ok ? Linking.openURL(url) : Alert.alert('Error', 'No se puede llamar desde este dispositivo'))
      .catch(() => Alert.alert('Error', 'No se puede llamar en este momento'));
  };

  const totalServices = EXPLORE_SERVICES.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <CustomView style={{ flex: 1, backgroundColor: '#F8FAFF' }}>
      <ExpoStatusBar style="light" backgroundColor="#198EA5" translucent={false} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>

        {/* ═══ HEADER ═══ */}
        <View style={{ paddingTop: insets.top, backgroundColor: '#198EA5' }}>
          <LinearGradient
            colors={['#198EA5', '#2B9EB3']}
            style={{
              paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24,
              borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 16, marginRight: 12,
              }}>
                <IconRenderer icon="call" type="ionicons" size={22} color="white" />
              </View>
              <View>
                <CustomText type="subtitle" style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                  Directorio de Ayuda
                </CustomText>
                <CustomText style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                  {totalServices} servicios en Guatemala
                </CustomText>
              </View>
            </View>

            {/* Search Bar */}
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16,
              flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, height: 46,
            }}>
              <IconRenderer icon="search" type="ionicons" size={18} color="rgba(255,255,255,0.6)" />
              <TextInput
                style={{ flex: 1, color: 'white', fontSize: 15, marginLeft: 10 }}
                placeholder="Buscar servicio o número..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={search}
                onChangeText={setSearch}
                autoCapitalize="none"
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <IconRenderer icon="close-circle" type="ionicons" size={18} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* ═══ Quick call strip ═══ */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginTop: 14, gap: 8 }}>
          {[
            { label: 'Policía', phone: '110', color: '#3A86FF', icon: 'police-badge', iconType: 'material-community' as const },
            { label: 'Bomberos', phone: '122', color: '#F8333C', icon: 'fire-extinguisher', iconType: 'fa5' as const },
            { label: 'Ambulancia', phone: '128', color: '#B5179E', icon: 'ambulance', iconType: 'fa5' as const },
          ].map((q, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => handleCall(q.label, q.phone)}
              activeOpacity={0.8}
              style={{ flex: 1 }}
            >
              <LinearGradient
                colors={[q.color, adjustColor(q.color, -20)]}
                style={{
                  borderRadius: 14, paddingVertical: 12, alignItems: 'center',
                  shadowColor: q.color, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 3,
                }}
              >
                <IconRenderer icon={q.icon} type={q.iconType} size={20} color="white" />
                <CustomText style={{ color: 'white', fontSize: 11, fontWeight: '700', marginTop: 4 }}>{q.label}</CustomText>
                <CustomText style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '600' }}>{q.phone}</CustomText>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* ═══ SERVICE CATEGORIES ═══ */}
        {filteredServices.map((cat, i) => (
          <View key={i} style={{
            marginHorizontal: 16, marginTop: 16, backgroundColor: 'white',
            borderRadius: 20, padding: 18,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <View style={{
                backgroundColor: cat.color + '15', width: 36, height: 36, borderRadius: 12,
                justifyContent: 'center', alignItems: 'center', marginRight: 10,
              }}>
                <IconRenderer icon={cat.icon} type={cat.iconType} size={18} color={cat.color} />
              </View>
              <CustomText style={{ fontSize: 17, fontWeight: '700', color: '#1E293B' }}>{cat.title}</CustomText>
              <View style={{ marginLeft: 'auto', backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                <CustomText style={{ fontSize: 11, fontWeight: '600', color: '#94A3B8' }}>{cat.items.length}</CustomText>
              </View>
            </View>

            {cat.items.map((svc, j) => (
              <TouchableOpacity
                key={j}
                onPress={() => handleCall(svc.name, svc.phone || '')}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: 12, borderTopWidth: j > 0 ? 1 : 0, borderTopColor: '#F8FAFC',
                }}
              >
                <View style={{
                  backgroundColor: svc.color + '15', width: 42, height: 42, borderRadius: 14,
                  justifyContent: 'center', alignItems: 'center', marginRight: 12,
                }}>
                  <IconRenderer icon={svc.icon} type={svc.iconType} size={20} color={svc.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <CustomText style={{ fontSize: 15, fontWeight: '600', color: '#1E293B' }}>{svc.name}</CustomText>
                  {svc.phone && (
                    <CustomText style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>{svc.phone}</CustomText>
                  )}
                </View>
                <View style={{
                  backgroundColor: '#22C55E', width: 36, height: 36, borderRadius: 12,
                  justifyContent: 'center', alignItems: 'center',
                }}>
                  <IconRenderer icon="call" type="ionicons" size={18} color="white" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* No results */}
        {filteredServices.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <IconRenderer icon="search" type="ionicons" size={40} color="#CBD5E1" />
            <CustomText style={{ fontSize: 15, color: '#94A3B8', marginTop: 12 }}>
              No se encontraron servicios
            </CustomText>
          </View>
        )}

        {/* Footer info */}
        <View style={{
          marginHorizontal: 16, marginTop: 16, marginBottom: 16,
          backgroundColor: '#EFF6FF', borderRadius: 16, padding: 16,
          flexDirection: 'row', alignItems: 'center',
        }}>
          <IconRenderer icon="information-circle" type="ionicons" size={20} color="#2563EB" />
          <CustomText style={{ flex: 1, marginLeft: 10, fontSize: 13, color: '#2563EB', lineHeight: 18 }}>
            Todos los números son gratuitos y están disponibles las 24 horas.
          </CustomText>
        </View>
      </ScrollView>
    </CustomView>
  );
}