import Constants from 'expo-constants';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import LocationSelect from '../../../components/LocationPicker'; // aggiorna il path se diverso
import { useState } from 'react';
import PrioritySelect from '../../../components/PrioritySelect';
import * as ImagePicker from 'expo-image-picker';
import { Image, Alert, Platform, ActionSheetIOS, TouchableWithoutFeedback } from 'react-native';
import { useAuth } from '../../../../contexts/AuthContext';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://172.20.10.3:3001';

export default function ReportAdd() {
    const [location, setLocation] = useState('');
    const [priority, setPriority] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const { user, logout } = useAuth();

    const handleAddPhoto = () => {
        const openCamera = async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Camera access is required.');
                return;
            }
            const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 });
            if (!result.canceled) {
                setImages(prev => [...prev, result.assets[0].uri]);
            }
        };

        const openGallery = async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Gallery access is required.');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.7 });
            if (!result.canceled) {
                setImages(prev => [...prev, result.assets[0].uri]);
            }
        };

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Camera', 'Gallery', 'Cancel'],
                    cancelButtonIndex: 2,
                },
                i => {
                    if (i === 0) openCamera();
                    else if (i === 1) openGallery();
                }
            );
        } else {
            Alert.alert('Add Photo', 'Choose source', [
                { text: 'Camera', onPress: openCamera },
                { text: 'Gallery', onPress: openGallery },
                { text: 'Cancel', style: 'cancel' },
            ]);
        }
    };

    const handleRemovePhoto = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!title || !description || !location || !priority) {
            Alert.alert('Missing fields', 'Please fill in all required fields.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('location', location);
            formData.append('priority', priority);
            const userId = user?._id || user?.userId;
            formData.append('userId', userId!);


            images.forEach((uri, index) => {
                const filename = uri.split('/').pop() || `photo${index}.jpg`;
                const type = `image/${filename.split('.').pop()}`;
                formData.append('photos', {
                    uri,
                    name: filename,
                    type,
                } as any);
            });

            const res = await fetch(`${API_URL}/api/report-mobile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            if (res.ok) {
                Alert.alert('Success', 'Report sent successfully.');
                router.replace('/dashboard/maintainer');
            } else {
                if (!res.ok) {
                    const text = await res.text(); // 👈 debug!
                    console.warn('Errore backend:', text); // logga per capire
                    Alert.alert('Errore', 'Server error or invalid response');
                    return;
                }
                const err = await res.json();
                Alert.alert('Error', err.message || 'Failed to submit report');
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Something went wrong');
        }
    };

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/dashboard/maintainer')}>
                    <Feather name="arrow-left" size={20} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New report</Text>
            </View>

            <View style={styles.main}>
                <ScrollView style={styles.inputList} showsVerticalScrollIndicator={false}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Report title</Text>
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            style={styles.input}
                            placeholder="e.g. Irrigator water leak"
                            placeholderTextColor="#9ca3af"
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Detailed description</Text>
                        <TextInput
                            value={description}
                            onChangeText={setDescription}
                            style={styles.textarea}
                            placeholder="Describe the issue in detail..."
                            placeholderTextColor="#9ca3af"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* ✅ Campo posizione */}
                    <View style={styles.inputGroup}>
                        <LocationSelect value={location} onChange={setLocation} />
                    </View>

                    <PrioritySelect value={priority} onChange={setPriority} />

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Photos (optional)</Text>

                        <View style={styles.photoGrid}>
                            {images.length < 4 && (
                                <TouchableOpacity style={styles.addPhoto} onPress={handleAddPhoto}>
                                    <Feather name="camera" size={20} color="#9ca3af" />
                                    <Text style={styles.addText}>Add</Text>
                                </TouchableOpacity>
                            )}

                            {images.map((uri, index) => (
                                <View key={index} style={styles.photoThumbWrapper}>
                                    <Image source={{ uri }} style={styles.photoThumb} />
                                    <TouchableWithoutFeedback onPress={() => handleRemovePhoto(index)}>
                                        <View style={styles.removeButton}>
                                            <Feather name="x" size={10} color="#fff" />
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>
                            ))}
                        </View>

                        <Text style={styles.photoNote}>
                            Maximum 4 photos. Tap to take or choose from gallery.
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.acceptButton} onPress={handleSubmit}>
                        <Text style={styles.acceptButtonText}>Send report</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        height: 52.8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgb(232, 228, 236)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginLeft: 16,
    },
    main: {
        flex: 1,
        backgroundColor: 'rgb(249, 250, 251)',
        padding: 16,
    },
    inputList: {
        flex: 1,
    },
    inputGroup: {
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
    input: {
        borderWidth: 1,
        borderColor: 'rgb(232, 228, 236)',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        fontSize: 14,
        color: '#111827',
    },
    textarea: {
        borderWidth: 1,
        borderColor: 'rgb(232, 228, 236)',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        fontSize: 14,
        color: '#111827',
        minHeight: 100,
    },
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    addPhoto: {
        width: 80,
        height: 80,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'dashed',
    },
    addText: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
    },
    photoThumbWrapper: {
        position: 'relative',
    },
    photoThumb: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    removeButton: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#ef4444',
        width: 15,
        height: 15,
        borderRadius: 10,
        fontSize: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoNote: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 8,
    },
    acceptButton: {
        backgroundColor: 'rgb(45, 106, 79)',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    acceptButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});