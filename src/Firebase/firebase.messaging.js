import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';

// Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_apiKey,
    authDomain: import.meta.env.VITE_authDomain,
    projectId: import.meta.env.VITE_projectId,
    storageBucket: import.meta.env.VITE_storageBucket,
    messagingSenderId: import.meta.env.VITE_messagingSenderId,
    appId: import.meta.env.VITE_appId,
};

// Initialize Firebase app for messaging
const app = initializeApp(firebaseConfig, 'messaging-app');

// Initialize Firebase Cloud Messaging
let messaging = null;

try {
    messaging = getMessaging(app);
    console.log('✅ Firebase Messaging initialized');
} catch (error) {
    console.error('❌ Firebase Messaging initialization failed:', error);
}

// VAPID key - You need to generate this from Firebase Console
// Go to: Project Settings → Cloud Messaging → Web Push certificates → Generate key pair
const VAPID_KEY = import.meta.env.VITE_VAPID_KEY || 'YOUR_VAPID_KEY_HERE';

/**
 * Request notification permission and get FCM token
 * @returns {Promise<string|null>} FCM token or null if permission denied
 */
export const requestNotificationPermission = async () => {
    try {
        if (!messaging) {
            console.error('❌ Messaging not initialized');
            return null;
        }

        // Check if browser supports notifications
        if (!('Notification' in window)) {
            console.log('❌ This browser does not support notifications');
            return null;
        }

        console.log('🔔 Requesting notification permission...');
        
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
            console.log('✅ Notification permission granted');
            
            try {
                // Get FCM token
                const token = await getToken(messaging, {
                    vapidKey: VAPID_KEY
                });
                
                if (token) {
                    console.log('📱 FCM Token obtained:', token.substring(0, 20) + '...');
                    return token;
                } else {
                    console.log('❌ No registration token available');
                    return null;
                }
            } catch (tokenError) {
                console.error('❌ Error getting FCM token:', tokenError);
                return null;
            }
        } else if (permission === 'denied') {
            console.log('❌ Notification permission denied');
            return null;
        } else {
            console.log('⚠️ Notification permission dismissed');
            return null;
        }
    } catch (error) {
        console.error('❌ Error requesting notification permission:', error);
        return null;
    }
};

/**
 * Listen for foreground messages
 * @returns {Promise} Promise that resolves with message payload
 */
export const onMessageListener = () => {
    if (!messaging) {
        return Promise.reject('Messaging not initialized');
    }

    return new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            console.log('📨 Foreground message received:', payload);
            resolve(payload);
        });
    });
};

/**
 * Check if notifications are supported
 * @returns {boolean}
 */
export const isNotificationSupported = () => {
    return 'Notification' in window && 'serviceWorker' in navigator;
};

/**
 * Get current notification permission status
 * @returns {string} 'granted', 'denied', or 'default'
 */
export const getNotificationPermission = () => {
    if (!('Notification' in window)) {
        return 'unsupported';
    }
    return Notification.permission;
};

export { messaging };
