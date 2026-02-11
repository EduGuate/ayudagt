import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Keyboard,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

import { CustomText } from '@/components/ui/CustomText';
import { CustomView } from '@/components/ui/CustomView';
import { IconRenderer } from '@/components/ui/IconRenderer';
import {
    sendMessageToGemini,
    translateText,
    generateImage,
    generateTTS,
    Message,
} from '@/utils/geminiApi';

// --- Quick Prompt Suggestions ---
const QUICK_PROMPTS = [
    { label: '🩹 Heridas', text: 'Primeros auxilios básicos' },
    { label: '📞 Emergencias', text: 'Números de emergencia en Guatemala' },
    { label: '🔥 Quemaduras', text: '¿Cómo tratar una quemadura?' },
];

// --- Markdown-like Text Formatter for React Native ---
const FormattedText = ({ text, isUser }: { text: string; isUser: boolean }) => {
    const lines = text.split('\n');
    const baseColor = isUser ? '#FFFFFF' : '#334155';
    const boldColor = isUser ? '#FFFFFF' : '#0F172A';
    const titleColor = isUser ? '#E0F2FE' : '#1D4ED8';
    const bulletColor = isUser ? '#93C5FD' : '#3B82F6';

    return (
        <View>
            {lines.map((line, i) => {
                const trimmed = line.trim();
                if (!trimmed) return <View key={i} style={{ height: 6 }} />;

                // ### Title
                if (trimmed.startsWith('### ')) {
                    return (
                        <CustomText key={i} style={[styles.fmtTitle, { color: titleColor }]}>
                            {formatBold(trimmed.slice(4), boldColor, baseColor)}
                        </CustomText>
                    );
                }
                // ## Title
                if (trimmed.startsWith('## ')) {
                    return (
                        <CustomText key={i} style={[styles.fmtTitle, { color: titleColor, fontSize: 17 }]}>
                            {formatBold(trimmed.slice(3), boldColor, baseColor)}
                        </CustomText>
                    );
                }
                // Numbered list (1. Text)
                const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
                if (numMatch) {
                    return (
                        <View key={i} style={styles.fmtListRow}>
                            <CustomText style={[styles.fmtListNum, { color: bulletColor }]}>{numMatch[1]}.</CustomText>
                            <CustomText style={[styles.fmtListText, { color: baseColor }]}>
                                {formatBold(numMatch[2], boldColor, baseColor)}
                            </CustomText>
                        </View>
                    );
                }
                // Bullet list (* or -)
                if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
                    return (
                        <View key={i} style={styles.fmtListRow}>
                            <CustomText style={[styles.fmtBullet, { color: bulletColor }]}>•</CustomText>
                            <CustomText style={[styles.fmtListText, { color: baseColor }]}>
                                {formatBold(trimmed.slice(2), boldColor, baseColor)}
                            </CustomText>
                        </View>
                    );
                }
                // --- separator
                if (trimmed === '---') {
                    return <View key={i} style={styles.fmtSeparator} />;
                }
                // Regular text
                return (
                    <CustomText key={i} style={{ color: baseColor, fontSize: 15, lineHeight: 22, marginBottom: 2 }}>
                        {formatBold(trimmed, boldColor, baseColor)}
                    </CustomText>
                );
            })}
        </View>
    );
};

// Helper: parse **bold** segments
function formatBold(text: string, boldColor: string, baseColor: string) {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return (
                <CustomText key={i} style={{ fontWeight: 'bold', color: boldColor }}>
                    {part.slice(2, -2)}
                </CustomText>
            );
        }
        return part;
    });
}

// ====================
// MAIN COMPONENT
// ====================
export default function AsistenteScreen() {
    const insets = useSafeAreaInsets();
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'model',
            text: '¡Hola! Soy tu asistente de Ayuda Niños GT. 🇬🇹\n\n¿En qué puedo ayudarte hoy? Estoy aquí para darte información sobre emergencias, salud y seguridad.',
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [processingAction, setProcessingAction] = useState<string | null>(null);
    const flatListRef = useRef<FlatList>(null);
    const soundRef = useRef<Audio.Sound | null>(null);

    useEffect(() => {
        return () => {
            // Cleanup sound on unmount
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    const scrollToEnd = () => {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
    };

    // --- SEND MESSAGE ---
    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || inputText.trim();
        if (!textToSend || isLoading) return;

        const userMessage: Message = { role: 'user', text: textToSend };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);
        Keyboard.dismiss();
        scrollToEnd();

        try {
            const response = await sendMessageToGemini(textToSend, messages);
            setMessages(prev => [...prev, { role: 'model', text: response }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', text: 'Lo siento, hubo un error de conexión.' }]);
        } finally {
            setIsLoading(false);
            scrollToEnd();
        }
    };

    // --- TTS ---
    const handleTTS = async (text: string) => {
        setProcessingAction('tts');
        try {
            const base64Audio = await generateTTS(text);
            if (base64Audio) {
                // Write to temp file and play
                const fileUri = FileSystem.cacheDirectory + 'tts_output.wav';
                await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                if (soundRef.current) {
                    await soundRef.current.unloadAsync();
                }
                const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
                soundRef.current = sound;
                await sound.playAsync();
            }
        } catch (error) {
            console.error('TTS playback error:', error);
        } finally {
            setProcessingAction(null);
        }
    };

    // --- TRANSLATE ---
    const handleTranslate = async (text: string) => {
        setProcessingAction('translate');
        try {
            const translation = await translateText(text, "K'iche'");
            setMessages(prev => [
                ...prev,
                { role: 'model', text: `### Traducción a K'iche':\n${translation}`, isSystem: true },
            ]);
            scrollToEnd();
        } catch (error) {
            console.error(error);
        } finally {
            setProcessingAction(null);
        }
    };

    // --- IMAGE GENERATION ---
    const handleGenerateImage = async (context: string) => {
        setProcessingAction('image');
        try {
            const imageUri = await generateImage(context);
            if (imageUri) {
                setMessages(prev => [
                    ...prev,
                    { role: 'model', text: '### Ayuda Visual:\nAquí tienes una imagen para guiarte:', image: imageUri },
                ]);
                scrollToEnd();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setProcessingAction(null);
        }
    };

    // --- RENDER MESSAGE ---
    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        const isUser = item.role === 'user';
        return (
            <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowBot]}>
                {/* Avatar */}
                {!isUser && (
                    <View style={styles.avatarBot}>
                        <IconRenderer icon="brain" type="material-community" size={16} color="white" />
                    </View>
                )}

                <View style={{ flex: 1, maxWidth: '88%' }}>
                    {/* Bubble */}
                    <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
                        <FormattedText text={item.text} isUser={isUser} />

                        {/* Embedded image */}
                        {item.image && (
                            <View style={styles.imageContainer}>
                                <Image source={{ uri: item.image }} style={styles.generatedImage} resizeMode="contain" />
                            </View>
                        )}
                    </View>

                    {/* Action Buttons (only for bot responses, not initial message) */}
                    {!isUser && !item.isSystem && index > 0 && (
                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: '#EFF6FF' }]}
                                onPress={() => handleTTS(item.text)}
                                disabled={!!processingAction}
                            >
                                <IconRenderer icon="volume-high" type="ionicons" size={14} color="#2563EB" />
                                <CustomText style={[styles.actionLabel, { color: '#2563EB' }]}>Escuchar</CustomText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: '#EEF2FF' }]}
                                onPress={() => handleTranslate(item.text)}
                                disabled={!!processingAction}
                            >
                                <IconRenderer icon="language" type="ionicons" size={14} color="#4F46E5" />
                                <CustomText style={[styles.actionLabel, { color: '#4F46E5' }]}>K'iche'</CustomText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: '#F0FDFA' }]}
                                onPress={() => handleGenerateImage(item.text)}
                                disabled={!!processingAction}
                            >
                                <IconRenderer icon="image" type="ionicons" size={14} color="#0D9488" />
                                <CustomText style={[styles.actionLabel, { color: '#0D9488' }]}>Ver Guía</CustomText>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {isUser && (
                    <View style={styles.avatarUser}>
                        <IconRenderer icon="person" type="ionicons" size={16} color="white" />
                    </View>
                )}
            </View>
        );
    };

    return (
        <CustomView style={styles.container}>
            <ExpoStatusBar style="light" backgroundColor="#2563EB" translucent={false} />

            {/* Header */}
            <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
                <LinearGradient colors={['#2563EB', '#3B82F6']} style={styles.header}>
                    <View style={styles.headerIcon}>
                        <IconRenderer icon="shield-checkmark" type="ionicons" size={22} color="white" />
                    </View>
                    <View>
                        <CustomText type="subtitle" style={styles.headerTitle}>Asistente GT ✨</CustomText>
                        <CustomText style={styles.headerSub}>Tecnología Inteligente</CustomText>
                    </View>
                </LinearGradient>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex1}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                {/* Messages */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(_, i) => i.toString()}
                    contentContainerStyle={styles.chatContent}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    ListFooterComponent={
                        <>
                            {/* Loading indicator */}
                            {isLoading && (
                                <View style={styles.loadingRow}>
                                    <View style={styles.avatarBot}>
                                        <IconRenderer icon="brain" type="material-community" size={16} color="white" />
                                    </View>
                                    <View style={styles.loadingBubble}>
                                        <ActivityIndicator size="small" color="#2563EB" />
                                        <CustomText style={styles.loadingText}>Consultando...</CustomText>
                                    </View>
                                </View>
                            )}
                            {/* Processing extra action */}
                            {processingAction && (
                                <View style={styles.processingBanner}>
                                    <ActivityIndicator size="small" color="#2563EB" />
                                    <CustomText style={styles.processingText}>
                                        Generando {processingAction === 'tts' ? 'Audio' : processingAction === 'image' ? 'Imagen' : 'Traducción'} ✨
                                    </CustomText>
                                </View>
                            )}
                        </>
                    }
                />

                {/* Footer / Input */}
                <View style={[styles.footer, { paddingBottom: insets.bottom + 84 }]}>
                    {/* Quick Prompts */}
                    {!isLoading && messages.length < 3 && (
                        <View style={styles.quickRow}>
                            {QUICK_PROMPTS.map((qp, i) => (
                                <TouchableOpacity key={i} style={styles.quickBtn} onPress={() => handleSend(qp.text)}>
                                    <CustomText style={styles.quickLabel}>{qp.label}</CustomText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            placeholder="Escribe tu duda aquí..."
                            placeholderTextColor="#94A3B8"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            editable={!isLoading}
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]}
                            onPress={() => handleSend()}
                            disabled={!inputText.trim() || isLoading}
                        >
                            <IconRenderer icon="send" type="ionicons" size={18} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </CustomView>
    );
}

// ====================
// STYLES
// ====================
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    flex1: { flex: 1 },

    // Header
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

    // Chat
    chatContent: { padding: 16, paddingBottom: 8 },

    // Message rows
    messageRow: { flexDirection: 'row', marginBottom: 18, alignItems: 'flex-end' },
    messageRowUser: { justifyContent: 'flex-end' },
    messageRowBot: { justifyContent: 'flex-start' },

    // Avatars
    avatarBot: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#2563EB',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 8, marginBottom: 4,
    },
    avatarUser: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#2563EB',
        justifyContent: 'center', alignItems: 'center',
        marginLeft: 8, marginBottom: 4,
    },

    // Bubbles
    bubble: { padding: 14, borderRadius: 20, maxWidth: '100%' },
    bubbleUser: {
        backgroundColor: '#2563EB',
        borderBottomRightRadius: 4,
        shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15, shadowRadius: 4, elevation: 2,
    },
    bubbleBot: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 4,
        borderWidth: 1, borderColor: '#F1F5F9',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
    },

    // Formatted text styles
    fmtTitle: { fontSize: 15, fontWeight: 'bold', marginTop: 8, marginBottom: 6 },
    fmtListRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
    fmtListNum: { fontWeight: 'bold', marginRight: 6, minWidth: 20, textAlign: 'right', fontSize: 15 },
    fmtBullet: { marginRight: 6, fontSize: 10, marginTop: 5 },
    fmtListText: { flex: 1, fontSize: 15, lineHeight: 22 },
    fmtSeparator: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 10 },

    // Action buttons
    actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, marginLeft: 4 },
    actionBtn: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 12, paddingVertical: 7,
        borderRadius: 10,
    },
    actionLabel: { fontSize: 11, fontWeight: '600', marginLeft: 5 },

    // Image
    imageContainer: { marginTop: 10, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' },
    generatedImage: { width: '100%', height: 200, backgroundColor: 'white' },

    // Loading
    loadingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    loadingBubble: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 12,
        borderRadius: 20, borderBottomLeftRadius: 4,
        borderWidth: 1, borderColor: '#F1F5F9',
    },
    loadingText: { marginLeft: 10, fontSize: 12, color: '#94A3B8', fontWeight: '500' },

    // Processing banner
    processingBanner: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: 20, alignSelf: 'center', marginTop: 8,
        borderWidth: 1, borderColor: '#DBEAFE',
    },
    processingText: { fontSize: 10, color: '#2563EB', fontWeight: 'bold', marginLeft: 8, textTransform: 'uppercase', letterSpacing: 1 },

    // Footer
    footer: { padding: 12, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    quickRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
    quickBtn: {
        backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#DBEAFE',
        paddingHorizontal: 14, paddingVertical: 9, borderRadius: 14,
    },
    quickLabel: { fontSize: 11, fontWeight: '600', color: '#2563EB' },

    inputRow: { flexDirection: 'row', alignItems: 'center' },
    input: {
        flex: 1, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
        borderRadius: 24, paddingHorizontal: 18, paddingVertical: 12,
        fontSize: 15, color: '#334155', maxHeight: 100,
    },
    sendBtn: {
        backgroundColor: '#2563EB', width: 44, height: 44, borderRadius: 22,
        justifyContent: 'center', alignItems: 'center', marginLeft: 10,
        shadowColor: '#2563EB', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3, shadowRadius: 4, elevation: 3,
    },
    sendBtnDisabled: { backgroundColor: '#CBD5E1', shadowOpacity: 0 },
});
