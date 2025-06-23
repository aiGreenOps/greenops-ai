import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PRIORITIES = [
    { value: 'low', label: 'Low', color: '#22c55e' },
    { value: 'medium', label: 'Medium', color: '#eab308' },
    { value: 'high', label: 'High', color: '#f97316' },
    { value: 'urgent', label: 'Urgent', color: '#ef4444' },
];

export default function PrioritySelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (val: string) => void;
}) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.row}>
                {PRIORITIES.map((item) => {
                    const isSelected = item.value === value;
                    return (
                        <TouchableOpacity
                            key={item.value}
                            style={[
                                styles.box,
                                {
                                    borderColor: item.color,
                                    backgroundColor: isSelected ? `${item.color}20` : '#fff',
                                },
                            ]}
                            onPress={() => onChange(item.value)}
                            activeOpacity={0.9}
                        >
                            <Text style={[styles.text, { color: item.color }]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,

        // shadow iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,

        // shadow Android
        elevation: 2,
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 6,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    box: {
        width: 80,
        height: 40,
        borderWidth: 1,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 12,
        fontWeight: '500',
    },
});
