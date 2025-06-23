import { io } from 'socket.io-client';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://192.168.1.17:3001';

const socket = io(API_URL, {
    transports: ['websocket'],
    forceNew: true,
});

export default socket;
