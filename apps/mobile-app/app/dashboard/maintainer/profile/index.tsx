import React, { useState, useEffect, useRef } from 'react';
import Constants from 'expo-constants';
import { ScrollView, Animated, View, Text, StyleSheet, TouchableOpacity, Image, Switch, Easing, Modal } from 'react-native';
import { ActionSheetIOS, Alert, Platform } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function MaintainerProfile() {
    const router = useRouter();
    const { user, setUser } = useAuth();
    const [isPhotoModalVisible, setPhotoModalVisible] = useState(false);

    const handleEdit = () => {
        console.log('Edit profile');
    };

    const fetchTasks = async () => {
        if (!user) return;
        try {
            const res = await fetch(`${API_URL}/api/activities/mobile?userId=${user._id}`);
            const data = await res.json();

            const completedTasks = data.filter((task: any) => task.status === 'completed');
            const completedCount = completedTasks.length;

            const totalHours = completedTasks.reduce((sum: number, task: any) => {
                if (task.acceptedAt && task.completedAt) {
                    const start = new Date(task.acceptedAt);
                    const end = new Date(task.completedAt);
                    const durationInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                    return sum + durationInHours;
                }
                return sum;
            }, 0);            

            const hours = Math.round(totalHours);

            // Avvia l'animazione con i nuovi valori
            Animated.timing(animDone, {
                toValue: completedCount,
                duration: 1000,
                useNativeDriver: false,
                easing: Easing.out(Easing.quad),
            }).start();

            Animated.timing(animHours, {
                toValue: hours,
                duration: 1000,
                useNativeDriver: false,
                easing: Easing.out(Easing.quad),
            }).start();

            // Listener per aggiornare lo stato in tempo reale
            const id1 = animDone.addListener(({ value }) => {
                setCountDone(Math.floor(value));
            });
            const id2 = animHours.addListener(({ value }) => {
                setHoursWorked(totalHours); // può essere < 1
            });

            return () => {
                animDone.removeListener(id1);
                animHours.removeListener(id2);
            };
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [user]);

    if (!user) {
        return (
            <View style={styles.main}>
                <Text style={{ color: '#888' }}>Contenuto in arrivo...</Text>
            </View>
        );
    }

    const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://192.168.1.17:3001';

    const resolvedImage = user?.profilePicture?.replace('http://localhost:3001', API_URL);

    const [countDone, setCountDone] = useState(0);
    const animDone = useRef(new Animated.Value(0)).current;
    const [hoursWorked, setHoursWorked] = useState(0);
    const animHours = useRef(new Animated.Value(0)).current;

    const rating = 4.8;
    const maxStars = 5;
    const starAnimations = useRef(
        Array.from({ length: maxStars }, () => new Animated.Value(0))
    ).current;

    useEffect(() => {
        starAnimations.forEach((anim, i) => {
            anim.setValue(0);
            Animated.timing(anim, {
                toValue: 1,
                duration: 300,
                delay: i * 120,
                useNativeDriver: true,
                easing: Easing.out(Easing.ease),
            }).start();
        });
    }, []);

    const handleAvatarPress = () => {
        const options = ['View Photo', 'Change Photo', 'Cancel'];
        const cancelButtonIndex = 2;

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options,
                    cancelButtonIndex,
                },
                buttonIndex => {
                    if (buttonIndex === 0) {
                        setPhotoModalVisible(true); // mostra modal
                    } else if (buttonIndex === 1) {
                        handleChangeImage();
                    }
                }
            );
        } else {
            Alert.alert(
                'Profile Photo',
                'Choose an option',
                [
                    { text: 'View Photo' },
                    { text: 'Change Photo', onPress: handleChangeImage },
                    { text: 'Cancel', style: 'cancel' },
                ],
                { cancelable: true }
            );
        }
    };

    const handleChangeImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;
            const fileName = imageUri.split('/').pop() ?? 'profile.jpg';
            const fileType = fileName.split('.').pop();

            const formData = new FormData();
            formData.append('firstName', user.firstName);
            formData.append('lastName', user.lastName);
            formData.append('email', user.email);
            formData.append('userId', user._id);
            formData.append('phone', user.phone || '');
            formData.append('profilePicture', {
                uri: imageUri,
                name: fileName,
                type: `image/${fileType}`,
            } as any);

            const token = await AsyncStorage.getItem('token');

            const response = await fetch(`${API_URL}/api/user/update-profile-mobile`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });

            try {
                const data = await response.json();

                if (response.ok) {
                    setUser(prev => ({
                        ...prev!,
                        profilePicture: data.profilePicture,
                    }));
                    setPhotoModalVisible(false);
                } else {
                    console.warn("⚠️ Errore:", data.message);
                }
            } catch (e) {
                console.error("❌ Errore JSON:", e);
            }
        }
    };

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/dashboard/maintainer')}>
                    <Feather name="arrow-left" size={20} color="#374151" />
                </TouchableOpacity>

                {/* <Text style={styles.headerTitle}>Profile</Text> */}

                <TouchableOpacity onPress={handleEdit}>
                    <Feather name="edit-3" size={20} color="#374151" />
                </TouchableOpacity>
            </View>

            {/* MAIN */}
            <ScrollView showsVerticalScrollIndicator={false} style={styles.main}>
                {/* PROFILE CARD */}
                <View style={styles.profileCard}>
                    <TouchableOpacity onPress={handleAvatarPress} style={styles.avatarContainer} activeOpacity={0.8}>
                        {resolvedImage ? (
                            <Image source={{ uri: resolvedImage }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarInitial}>{user.firstName?.[0]}</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.headerText}>
                        <Text style={styles.greeting}>{user.firstName} {user.lastName}</Text>
                        <Text style={styles.role}>Maintainer</Text>
                    </View>
                    <View style={styles.ratingRow}>
                        {Array.from({ length: maxStars }).map((_, i) => {
                            const index = i + 1;
                            const starType =
                                rating >= index
                                    ? 'star'
                                    : rating >= index - 0.5
                                        ? 'star-half-full'
                                        : 'star-o';

                            return (
                                <Animated.View
                                    key={index}
                                    style={{
                                        opacity: starAnimations[i],
                                        transform: [
                                            {
                                                scale: starAnimations[i].interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [0.5, 1],
                                                }),
                                            },
                                        ],
                                    }}
                                >
                                    <FontAwesome
                                        name={starType}
                                        size={14}
                                        color="#facc15"
                                        style={{ marginRight: 2 }}
                                    />
                                </Animated.View>
                            );
                        })}
                        <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
                    </View>

                </View>


                {/* STATS */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Feather name="check-circle" style={styles.iconCardGreen} size={20} />
                        <View style={styles.textCard}>
                            <Text style={styles.statLabel}>Activities Done</Text>
                            <Text style={styles.statValue}>{countDone}</Text>
                        </View>
                    </View>
                    <View style={styles.statCard}>
                        <Feather name="clock" style={styles.iconCardBlue} size={20} />
                        <View style={styles.textCard}>
                            <Text style={styles.statLabel}>Hours Worked</Text>
                            <Text style={styles.statValue}>
                                {hoursWorked >= 1
                                    ? `${Math.round(hoursWorked)} h`
                                    : hoursWorked >= (1 / 60)
                                        ? `${Math.round(hoursWorked * 60)} min`
                                        : `${Math.round(hoursWorked * 3600)} sec`}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* CONTACT INFO */}
                <View style={styles.contactCard}>
                    <Text style={styles.contactTitle}>Contact Info</Text>
                    <View style={styles.contactItem}>
                        <Feather name="mail" style={styles.contactIcon} />
                        <Text style={styles.contactText}>{user.email}</Text>
                    </View>
                    <View style={styles.contactItem}>
                        <Feather name="phone" style={styles.contactIcon} />
                        <Text style={styles.contactText}>
                            {user.phone?.startsWith('+')
                                ? user.phone
                                : `+39 ${user.phone?.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}`
                            }
                        </Text>
                    </View>
                    <View style={styles.contactItem}>
                        <Feather name="map-pin" style={styles.contactIcon} />
                        <Text style={styles.contactText}>Taranto, Italy</Text>
                    </View>
                </View>

                <View style={styles.performanceCard}>
                    <Text style={styles.performanceTitle}>Performance</Text>

                    {[
                        { label: 'Efficiency', value: 94 },
                        { label: 'Accuracy', value: 91 },
                        { label: 'Response Time', value: 82 },
                    ].map((metric, i) => {
                        const animation = useRef(new Animated.Value(0)).current;

                        useEffect(() => {
                            Animated.timing(animation, {
                                toValue: metric.value,
                                duration: 800,
                                useNativeDriver: false,
                            }).start();
                        }, []);

                        const animatedWidth = animation.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '100%'],
                        });

                        return (
                            <View key={i} style={{ marginBottom: i < 2 ? 12 : 0 }}>
                                <View style={styles.performanceRow}>
                                    <Text style={styles.performanceLabel}>{metric.label}</Text>
                                    <Text style={styles.performanceValue}>{metric.value}%</Text>
                                </View>
                                <View style={styles.progressBarBackground}>
                                    <Animated.View style={{ width: animatedWidth, height: '100%', borderRadius: 8, overflow: 'hidden' }}>
                                        <LinearGradient
                                            colors={['rgb(45, 106, 79)', 'rgb(60, 207, 104)']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={{ height: '100%', borderRadius: 8 }}
                                        />
                                    </Animated.View>
                                </View>
                            </View>
                        );
                    })}
                </View>
                <View style={styles.achievementsCard}>
                    <Text style={styles.achievementsTitle}>Achievements</Text>
                    <View style={styles.badgesGrid}>
                        {[
                            { label: 'Irrigation Expert', icon: '💧', bg: '#e0f2fe' },
                            { label: 'Pruning Master', icon: '✂️', bg: '#ecfdf5' },
                            { label: 'Lightning Speed', icon: '⚡', bg: '#fef9c3' },
                            { label: 'Flawless Worker', icon: '🎯', bg: '#f5f3ff' },
                        ].map((badge, i) => (
                            <View key={i} style={[styles.badgeBox, { backgroundColor: badge.bg }]}>
                                <Text style={styles.badgeIcon}>{badge.icon}</Text>
                                <Text style={styles.badgeText}>{badge.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.settingsCard}>
                    {/* <Text style={styles.settingsTitle}>Settings</Text> */}

                    <TouchableOpacity style={styles.settingsRow}>
                        <Feather name="bell" size={18} style={styles.settingsIcon} />
                        <Text style={styles.settingsText}>Notifications</Text>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.settingsRow}>
                        <Feather name="shield" size={18} style={styles.settingsIcon} />
                        <Text style={styles.settingsText}>Privacy & Security</Text>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.settingsRow}>
                        <Feather name="settings" size={18} style={styles.settingsIcon} />
                        <Text style={styles.settingsText}>App Settings</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
            <Modal visible={isPhotoModalVisible} transparent={true} animationType="fade">
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={() => setPhotoModalVisible(false)}
                >
                    <View style={styles.fullscreenWrapper}>
                        <Image
                            source={{ uri: resolvedImage }}
                            style={styles.fullscreenImage}
                            resizeMode="cover"
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    main: {
        flex: 1,
        backgroundColor: 'rgb(249, 250, 251)',
        padding: 16,
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        alignItems: 'center',
        paddingVertical: 20,

        // shadow iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,

        // shadow Android
        elevation: 2,
        marginBottom: 12,
    },
    avatarImage: {
        width: 62,
        height: 62,
        borderRadius: 100,
        resizeMode: 'cover',
        backgroundColor: 'transaperent',
    },
    avatarPlaceholder: {
        width: 62,
        height: 62,
        borderRadius: 100,
        backgroundColor: '#2d6a4f',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    headerText: {
        marginTop: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    greeting: {
        fontWeight: '700',
        fontSize: 16,
        color: '#0f172a',
    },
    role: {
        fontSize: 13,
        color: '#6b7280',
        marginTop: 2,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        borderRadius: 24,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'rgb(249, 250, 251)',
    },
    ratingValue: {
        fontSize: 13,
        marginLeft: 4,
        color: '#6b7280',
    },
    statsRow: {
        display: 'flex',
        flexDirection: 'row',
        gap: 12,
        backgroundColor: 'transparent',
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',

        // shadow iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,

        // shadow Android
        elevation: 2,
        marginBottom: 12,
    },
    iconCardBlue: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(219, 234, 254, 255)',
        color: 'rgb(30, 64, 175)',
    },
    iconCardGreen: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(220, 252, 231, 255)',
        color: 'rgb(22, 101, 52)',
    },
    iconCardYellow: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgb(254, 249, 195)',
        color: 'rgb(202, 138, 4)',
    },
    textCard: {
        paddingLeft: 16,
        display: 'flex',
        flexDirection: 'column',
    },
    statLabel: {
        fontSize: 13,
        fontWeight: 300,
        color: '#374151',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    contactCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgb(232, 228, 236)',

        // shadow iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.00,
        shadowRadius: 4,

        // shadow Android
        elevation: 2,
        marginBottom: 12,
    },
    contactTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
        color: '#111827',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    contactIcon: {
        color: '#6b7280',
        fontSize: 14,
    },
    contactText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: 300,
    },
    performanceCard: {
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
    performanceTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
        color: '#111827',
    },
    performanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    performanceLabel: {
        fontSize: 14,
        color: '#374151',
        fontWeight: 300,
    },
    performanceValue: {
        fontSize: 13,
        fontWeight: '400',
        color: 'rgb(45, 106, 79)',
    },
    progressBarBackground: {
        width: '100%',
        height: 8,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 4,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    achievementsCard: {
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
    achievementsTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
        color: '#111827',
    },
    badgesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 8,
    },
    badgeBox: {
        flex: 1,
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeIcon: {
        fontSize: 20,
        marginBottom: 8,
    },
    badgeText: {
        fontSize: 13,
        fontWeight: '300',
        textAlign: 'center',
        color: '#374151',
    },
    settingsCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,

        // shadow iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,

        // shadow Android
        elevation: 2,
    },
    settingsTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
        color: '#111827',
    },
    settingsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
    },
    settingsIcon: {
        color: '#6b7280',
    },
    settingsText: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '300',
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginVertical: 4,
    },
    avatarContainer: {
        position: 'relative',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: '#4b5563',
        borderRadius: 999,
        padding: 6,
        borderWidth: 2,
        borderColor: '#fff',
        zIndex: 2,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenWrapper: {
        width: 300,
        height: 300,
        borderRadius: 150,
        overflow: 'hidden',
    },
    fullscreenImage: {
        width: '100%',
        height: '100%',
    },
});
