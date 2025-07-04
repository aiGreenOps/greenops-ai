import { io } from 'socket.io-client';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL || 'http://172.20.10.3:3001';

const socket = io(API_URL, {
    transports: ['websocket'],
    forceNew: true,
});

export default socket;
