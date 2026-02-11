import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';

interface CustomTextProps {
    style?: TextStyle | TextStyle[];
    children: React.ReactNode;
    type?: 'default' | 'title' | 'subtitle';
}

export const CustomText: React.FC<CustomTextProps> = ({ style, children, type = 'default' }) => {
    let combinedStyle: TextStyle[] = [];

    if (type === 'title') {
        combinedStyle.push(styles.title);
    } else if (type === 'subtitle') {
        combinedStyle.push(styles.subtitle);
    } else {
        combinedStyle.push(styles.default);
    }

    if (Array.isArray(style)) {
        combinedStyle = [...combinedStyle, ...style];
    } else if (style) {
        combinedStyle.push(style);
    }

    return (
        <Text style={combinedStyle}>
            {children}
        </Text>
    );
};

const styles = StyleSheet.create({
    default: {
        fontSize: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '600',
    },
});
