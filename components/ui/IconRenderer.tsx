import React from 'react';
import { Ionicons, FontAwesome5, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

export type IconType = 'fa5' | 'material' | 'ionicons' | 'material-community';

interface IconRendererProps {
    icon: string;
    type: IconType;
    size?: number;
    color?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({
    icon,
    type,
    size = 32,
    color = 'white'
}) => {
    // Size adjustment for specific icons if needed
    let adjustedSize = size;
    if (icon === 'hand-holding-heart') {
        adjustedSize = size - 4;
    }

    switch (type) {
        case 'fa5':
            return <FontAwesome5 name={icon as any} size={adjustedSize} color={color} />;
        case 'material':
            return <MaterialIcons name={icon as any} size={adjustedSize} color={color} />;
        case 'ionicons':
            return <Ionicons name={icon as any} size={adjustedSize} color={color} />;
        case 'material-community':
            return <MaterialCommunityIcons name={icon as any} size={adjustedSize} color={color} />;
        default:
            return <FontAwesome5 name="question" size={adjustedSize} color={color} />;
    }
};
