import { IconType } from '../components/ui/IconRenderer';

export type EmergencyGuideType = 'EARTHQUAKE' | 'FIRE' | 'THEFT' | 'LOST_PERSON';

export interface EmergencyServiceItem {
    name: string;
    phone?: string;
    scenario?: string;
    icon: string;
    color: string;
    iconType: IconType;
}

export interface EmergencyCategory {
    title: string;
    icon: string;
    iconType: IconType;
    color: string;
    items: EmergencyServiceItem[];
}

export const EMERGENCY_NUMBERS = {
    POLICE: '110',
    FIREFIGHTERS: '122',
    FIREFIGHTERS_MUNICIPAL: '123',
    AMBULANCE: '128',
    CHILD_PROTECTION: '1546',
};

export const HOME_EMERGENCY_CATEGORIES: EmergencyCategory[] = [
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

export const EXPLORE_SERVICES: EmergencyCategory[] = [
    {
        title: 'Emergencias Inmediatas',
        icon: 'alert-circle',
        iconType: 'material-community',
        color: '#F8333C',
        items: [
            {
                name: 'Policía Nacional',
                phone: '110',
                icon: 'police-badge',
                color: '#3A86FF',
                iconType: 'material-community'
            },
            {
                name: 'Bomberos Voluntarios',
                phone: '122',
                icon: 'fire-extinguisher',
                color: '#F8333C',
                iconType: 'fa5'
            },
            {
                name: 'Bomberos Municipales',
                phone: '123',
                icon: 'fire-truck',
                color: '#F9844A',
                iconType: 'material-community'
            },
            {
                name: 'Ambulancia',
                phone: '128',
                icon: 'ambulance',
                color: '#B5179E',
                iconType: 'fa5'
            },
        ]
    },
    {
        title: 'Protección Infantil',
        icon: 'child',
        iconType: 'fa5',
        color: '#4361EE',
        items: [
            {
                name: 'Procuraduría de la Niñez',
                phone: '1546',
                icon: 'child',
                color: '#4361EE',
                iconType: 'fa5'
            },
            {
                name: 'Línea de Ayuda',
                phone: '110',
                icon: 'phone-alt',
                color: '#3A86FF',
                iconType: 'fa5'
            },
            {
                name: 'SBS Guatemala',
                phone: '2414-3535',
                icon: 'home',
                color: '#4CC9F0',
                iconType: 'fa5'
            },
        ]
    },
    {
        title: 'Servicios Médicos',
        icon: 'medical-bag',
        iconType: 'material-community',
        color: '#F72585',
        items: [
            {
                name: 'Cruz Roja',
                phone: '2381-6565',
                icon: 'medical-services',
                color: '#F72585',
                iconType: 'material'
            },
            {
                name: 'Hospital Roosevelt',
                phone: '2321-7400',
                icon: 'hospital',
                color: '#7209B7',
                iconType: 'fa5'
            },
            {
                name: 'Hospital San Juan de Dios',
                phone: '2321-9191',
                icon: 'hospital-alt',
                color: '#560BAD',
                iconType: 'fa5'
            },
        ]
    },
    {
        title: 'Seguridad y Rescate',
        icon: 'shield-check',
        iconType: 'material-community',
        color: '#F77F00',
        items: [
            {
                name: 'CONRED',
                phone: '1566',
                icon: 'lifebuoy',
                color: '#F77F00',
                iconType: 'material-community'
            },
            {
                name: 'Policía de Tránsito',
                phone: '1551',
                icon: 'traffic-light',
                color: '#FCBF49',
                iconType: 'fa5'
            },
        ]
    },
    {
        title: 'Líneas de Apoyo',
        icon: 'hands-helping',
        iconType: 'fa5',
        color: '#9B5DE5',
        items: [
            {
                name: 'Contra Violencia a la Mujer',
                phone: '1572',
                icon: 'female',
                color: '#9B5DE5',
                iconType: 'fa5'
            },
            {
                name: 'Maltrato Animal',
                phone: '1557',
                icon: 'pets',
                color: '#00BBF9',
                iconType: 'material'
            },
            {
                name: 'Ministerio Público',
                phone: '1570',
                icon: 'balance-scale',
                color: '#00F5D4',
                iconType: 'fa5'
            },
            {
                name: 'Derechos Humanos',
                phone: '1555',
                icon: 'hands-helping',
                color: '#F15BB5',
                iconType: 'fa5'
            },
        ]
    },
];
