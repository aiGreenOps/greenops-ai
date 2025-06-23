import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, Modal, StyleSheet
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Platform, ActionSheetIOS, Alert } from 'react-native';


const LOCATIONS = ['North', 'South', 'East', 'West'];

export default function LocationSelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (val: string) => void;
}) {
    const [visible, setVisible] = useState(false);

    const openSelector = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: [...LOCATIONS.map(loc => `${loc} Garden`), 'Cancel'],
                    cancelButtonIndex: LOCATIONS.length,
                },
                (buttonIndex) => {
                    if (buttonIndex < LOCATIONS.length) {
                        onChange(LOCATIONS[buttonIndex]);
                    }
                }
            );
        } else {
            setVisible(true); // fallback Android modal
        }
    };


    return (
        <View>
            <Text style={styles.label}>Location</Text>
            <TouchableOpacity
                style={styles.select}
                onPress={openSelector}
            >
                <Feather name="map-pin" size={16} color="#6b7280" style={styles.icon} />
                <Text style={value ? styles.selected : styles.placeholder}>
                    {value ? `${value} Garden` : 'Select location'}
                </Text>
                <Feather name="chevron-down" size={18} color="#374151" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 6,
    },
    select: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 10,
        backgroundColor: '#fff',
        padding: 12,
        gap: 8,
    },
    icon: {
        fontSize: 16,
    },
    placeholder: {
        flex: 1,
        color: '#9ca3af',
        fontSize: 14,
    },
    selected: {
        flex: 1,
        color: '#111827',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
    },
    modalBox: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 20,
        maxHeight: '60%',
    },
    option: {
        paddingVertical: 14,
    },
    optionText: {
        fontSize: 16,
        color: '#111827',
    },
    cancel: {
        textAlign: 'center',
        marginTop: 16,
        color: '#2563eb',
        fontWeight: '600',
    },
});
