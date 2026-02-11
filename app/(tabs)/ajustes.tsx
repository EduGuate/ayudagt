import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Linking,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

import { CustomText } from '@/components/ui/CustomText';
import { CustomView } from '@/components/ui/CustomView';
import { IconRenderer } from '@/components/ui/IconRenderer';
import { saveApiKey, getApiKey, removeApiKey } from '@/utils/geminiApi';

export default function AjustesScreen() {
    const insets = useSafeAreaInsets();
    const [apiKey, setApiKey] = useState('');
    const [savedKey, setSavedKey] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        loadKey();
    }, []);

    const loadKey = async () => {
        const key = await getApiKey();
        if (key) {
            setSavedKey(key);
            setApiKey(key);
        }
    };

    const handleSave = async () => {
        if (!apiKey.trim()) {
            Alert.alert('Error', 'Ingresa una API Key válida.');
            return;
        }
        setIsSaving(true);
        try {
            await saveApiKey(apiKey.trim());
            setSavedKey(apiKey.trim());
            Alert.alert('✅ Guardado', 'Tu API Key fue guardada correctamente. El asistente IA ya está listo.');
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar la API Key.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemove = async () => {
        Alert.alert(
            'Eliminar API Key',
            '¿Estás seguro? El asistente IA dejará de funcionar.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        await removeApiKey();
                        setApiKey('');
                        setSavedKey(null);
                    },
                },
            ]
        );
    };

    const maskKey = (key: string) => {
        if (key.length <= 8) return '••••••••';
        return key.substring(0, 4) + '••••••••••••' + key.substring(key.length - 4);
    };

    return (
        <CustomView style={styles.container}>
            <ExpoStatusBar style="light" backgroundColor="#2563EB" translucent={false} />

            {/* Header */}
            <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
                <LinearGradient colors={['#2563EB', '#3B82F6']} style={styles.header}>
                    <View style={styles.headerIcon}>
                        <IconRenderer icon="settings" type="ionicons" size={22} color="white" />
                    </View>
                    <View>
                        <CustomText type="subtitle" style={styles.headerTitle}>Ajustes</CustomText>
                        <CustomText style={styles.headerSub}>Configuración de la app</CustomText>
                    </View>
                </LinearGradient>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
            >
                {/* API Key Status Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.statusDot, { backgroundColor: savedKey ? '#22C55E' : '#EF4444' }]} />
                        <CustomText style={styles.cardTitle}>
                            Asistente IA — {savedKey ? 'Activo' : 'Inactivo'}
                        </CustomText>
                    </View>

                    <CustomText style={styles.cardDesc}>
                        {savedKey
                            ? `Tu clave está configurada: ${showKey ? savedKey : maskKey(savedKey)}`
                            : 'Necesitas una API Key de Google para usar el asistente de IA.'}
                    </CustomText>

                    {savedKey && (
                        <TouchableOpacity onPress={() => setShowKey(!showKey)} style={styles.toggleBtn}>
                            <IconRenderer icon={showKey ? 'eye-off' : 'eye'} type="ionicons" size={16} color="#2563EB" />
                            <CustomText style={styles.toggleText}>{showKey ? 'Ocultar' : 'Mostrar'}</CustomText>
                        </TouchableOpacity>
                    )}

                    {/* Input */}
                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="AIzaSy..."
                            placeholderTextColor="#94A3B8"
                            value={apiKey}
                            onChangeText={setApiKey}
                            autoCapitalize="none"
                            autoCorrect={false}
                            secureTextEntry={!showKey}
                        />
                    </View>

                    {/* Buttons */}
                    <View style={styles.btnRow}>
                        <TouchableOpacity
                            style={[styles.saveBtn, (!apiKey.trim() || isSaving) && styles.saveBtnDisabled]}
                            onPress={handleSave}
                            disabled={!apiKey.trim() || isSaving}
                        >
                            {isSaving ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <>
                                    <IconRenderer icon="save" type="ionicons" size={18} color="white" />
                                    <CustomText style={styles.saveBtnText}>Guardar</CustomText>
                                </>
                            )}
                        </TouchableOpacity>

                        {savedKey && (
                            <TouchableOpacity style={styles.removeBtn} onPress={handleRemove}>
                                <IconRenderer icon="trash" type="ionicons" size={18} color="#EF4444" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* How to Get API Key */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <IconRenderer icon="key" type="ionicons" size={20} color="#F59E0B" />
                        <CustomText style={[styles.cardTitle, { marginLeft: 8 }]}>
                            ¿Cómo obtener tu API Key?
                        </CustomText>
                    </View>

                    <CustomText style={styles.cardDesc}>
                        Sigue estos pasos para obtener tu clave gratuita de Google AI:
                    </CustomText>

                    <View style={styles.stepRow}>
                        <View style={styles.stepNum}><CustomText style={styles.stepNumText}>1</CustomText></View>
                        <CustomText style={styles.stepText}>
                            Abre Google AI Studio en tu navegador
                        </CustomText>
                    </View>

                    <TouchableOpacity
                        style={styles.linkBtn}
                        onPress={() => Linking.openURL('https://aistudio.google.com/apikey')}
                    >
                        <IconRenderer icon="open-outline" type="ionicons" size={16} color="white" />
                        <CustomText style={styles.linkBtnText}>aistudio.google.com/apikey</CustomText>
                    </TouchableOpacity>

                    <View style={styles.stepRow}>
                        <View style={styles.stepNum}><CustomText style={styles.stepNumText}>2</CustomText></View>
                        <CustomText style={styles.stepText}>
                            Inicia sesión con tu cuenta de Google
                        </CustomText>
                    </View>

                    <View style={styles.stepRow}>
                        <View style={styles.stepNum}><CustomText style={styles.stepNumText}>3</CustomText></View>
                        <CustomText style={styles.stepText}>
                            Haz clic en "Create API Key" (Crear clave de API)
                        </CustomText>
                    </View>

                    <View style={styles.stepRow}>
                        <View style={styles.stepNum}><CustomText style={styles.stepNumText}>4</CustomText></View>
                        <CustomText style={styles.stepText}>
                            Copia la clave generada (empieza con AIza...)
                        </CustomText>
                    </View>

                    <View style={styles.stepRow}>
                        <View style={styles.stepNum}><CustomText style={styles.stepNumText}>5</CustomText></View>
                        <CustomText style={styles.stepText}>
                            Pégala en el campo de arriba y presiona Guardar
                        </CustomText>
                    </View>

                    <View style={styles.infoBox}>
                        <IconRenderer icon="information-circle" type="ionicons" size={18} color="#2563EB" />
                        <CustomText style={styles.infoText}>
                            La API Key es gratuita y se guarda solo en tu dispositivo. Nunca se comparte.
                        </CustomText>
                    </View>
                </View>

                {/* About */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <IconRenderer icon="heart" type="ionicons" size={20} color="#EF4444" />
                        <CustomText style={[styles.cardTitle, { marginLeft: 8 }]}>Acerca de</CustomText>
                    </View>
                    <CustomText style={styles.cardDesc}>
                        Ayuda Niños GT v1.0{'\n'}
                        Aplicación de asistencia para emergencias en Guatemala.{'\n'}
                        Desarrollado con ❤️ para los niños de Guatemala.
                    </CustomText>
                </View>
            </ScrollView>
        </CustomView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    headerWrapper: { backgroundColor: '#2563EB' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    headerIcon: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 10,
        borderRadius: 16,
        marginRight: 12,
    },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    headerSub: { color: '#BFDBFE', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.5 },

    // Cards
    card: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
    cardDesc: { fontSize: 14, color: '#64748B', lineHeight: 21, marginBottom: 12 },

    // Input
    inputRow: { marginBottom: 12 },
    input: {
        backgroundColor: '#F1F5F9',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        color: '#334155',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    // Toggle
    toggleBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    toggleText: { fontSize: 13, color: '#2563EB', fontWeight: '600', marginLeft: 6 },

    // Buttons
    btnRow: { flexDirection: 'row', gap: 10 },
    saveBtn: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#2563EB',
        borderRadius: 14,
        paddingVertical: 14,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    saveBtnDisabled: { backgroundColor: '#94A3B8' },
    saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
    removeBtn: {
        backgroundColor: '#FEE2E2',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Steps
    stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    stepNum: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 10,
    },
    stepNumText: { fontSize: 13, fontWeight: 'bold', color: '#2563EB' },
    stepText: { flex: 1, fontSize: 14, color: '#475569', lineHeight: 20 },

    // Link button
    linkBtn: {
        flexDirection: 'row',
        backgroundColor: '#2563EB',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
    },
    linkBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },

    // Info box
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        padding: 12,
        marginTop: 6,
        alignItems: 'flex-start',
        gap: 8,
    },
    infoText: { flex: 1, fontSize: 13, color: '#2563EB', lineHeight: 19 },
});
