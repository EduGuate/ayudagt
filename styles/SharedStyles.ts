import { StyleSheet } from 'react-native';

/**
 * Shared styles used across multiple screens (Home, Explore)
 * Eliminates duplication and ensures visual consistency.
 */
export const SharedStyles = StyleSheet.create({
    // Layout
    container: {
        flex: 1,
        backgroundColor: '#F8FAFF',
    },

    // Hero Header
    header: {
        width: '100%',
        height: 200,
        marginBottom: 10,
        overflow: 'hidden',
    },
    heroOverlay: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 30,
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
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
    },

    // Emergency Banner
    emergencyBanner: {
        flexDirection: 'row',
        marginHorizontal: 15,
        marginVertical: 10,
        backgroundColor: '#FF5757',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
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

    // Category Cards
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

    // Services Grid
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
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 4,
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

    // Footer
    footer: {
        marginHorizontal: 15,
        marginTop: 15,
        marginBottom: 20,
        padding: 20,
        backgroundColor: '#FFE8E0',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#FFCBB8',
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
    footerText: {
        flex: 1,
        color: '#555',
        fontSize: 14,
    },

    // Offline indicators
    offlineContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFEED6',
        padding: 10,
        marginHorizontal: 15,
        marginTop: 10,
        borderRadius: 10,
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
    },
    offlineReadyText: {
        color: '#4CAF50',
        fontSize: 12,
        marginLeft: 5,
        fontWeight: '500',
    },
});
