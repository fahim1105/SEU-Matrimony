// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_apiKey,
    authDomain: import.meta.env.VITE_authDomain,
    projectId: import.meta.env.VITE_projectId,
    storageBucket: import.meta.env.VITE_storageBucket,
    messagingSenderId: import.meta.env.VITE_messagingSenderId,
    appId: import.meta.env.VITE_appId,
};

// Validate Firebase configuration
const validateFirebaseConfig = () => {
    const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);
    
    if (missingKeys.length > 0) {
        console.error('Missing Firebase configuration keys:', missingKeys);
        throw new Error(`Missing Firebase configuration: ${missingKeys.join(', ')}`);
    }
    
    console.log('✅ Firebase configuration validated successfully');
};

// Validate configuration before initializing
validateFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Set auth language to Bengali
auth.languageCode = 'bn';

// Add error handling for auth initialization
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('🔐 User authenticated:', user.email);
    } else {
        console.log('🔓 User signed out');
    }
}, (error) => {
    console.error('❌ Auth state change error:', error);
});

console.log('🚀 Firebase initialized successfully');
console.log('📧 Auth domain:', firebaseConfig.authDomain);
console.log('🆔 Project ID:', firebaseConfig.projectId);