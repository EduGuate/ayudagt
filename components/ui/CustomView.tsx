import React from 'react';
import { View, ViewStyle } from 'react-native';

interface CustomViewProps {
    style?: ViewStyle | ViewStyle[];
    children: React.ReactNode;
}

export const CustomView: React.FC<CustomViewProps> = ({ style, children }) => {
    return (
        <View style={style}>
            {children}
        </View>
    );
};
