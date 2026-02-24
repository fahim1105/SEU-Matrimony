import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    sendEmailVerification as firebaseSendEmailVerification,
    reload
} from 'firebase/auth';
import { auth } from '../Firebase/firebase.init';
import { AuthContext } from './AuthContext';
import { useEffect, useState } from 'react';
import { debugGoogleUser, extractEmailFromUser } from '../utils/googleDebugger';

const GoogleProvider = new GoogleAuthProvider();
// Enhanced Google provider configuration for better email access
GoogleProvider.setCustomParameters({
    prompt: 'select_account',
    hd: 'seu.edu.bd'
});
GoogleProvider.addScope('email');
GoogleProvider.addScope('profile');
GoogleProvider.addScope('openid');
GoogleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
GoogleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

// Debug helper function
const debugUserObject = (user, context = '') => {
    console.log(`🔍 [${context}] User Debug Info:`);
    console.log('- Email:', user?.email);
    console.log('- Display Name:', user?.displayName);
    console.log('- UID:', user?.uid);
    console.log('- Email Verified:', user?.emailVerified);
    console.log('- Provider Data:', user?.providerData);
    console.log('- Metadata:', user?.metadata);
    console.log('- Photo URL:', user?.photoURL);
    console.log('- Provider ID:', user?.providerId);
    console.log('- Refresh Token:', user?.refreshToken ? 'Present' : 'Missing');
    console.log('- Access Token:', user?.accessToken ? 'Present' : 'Missing');
    
    // Check each provider data entry
    if (user?.providerData?.length > 0) {
        user.providerData.forEach((provider, index) => {
            console.log(`- Provider ${index}:`, {
                providerId: provider.providerId,
                email: provider.email,
                displayName: provider.displayName,
                photoURL: provider.photoURL,
                uid: provider.uid
            });
        });
    }
};

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Define auth functions outside try-catch to ensure they're always available
    const registerUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const signinUser = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signInGoogle = async () => {
        setLoading(true);

        try {
            console.log('🚀 Starting Google sign-in...');
            
            // Clear any existing auth state
            if (auth.currentUser) {
                console.log('🔄 Clearing existing auth state');
                await signOut(auth);
            }

            // Configure Google provider with enhanced settings
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account',
                hd: 'seu.edu.bd'
            });
            provider.addScope('email');
            provider.addScope('profile');
            provider.addScope('openid');

            console.log('🔄 Attempting Google popup sign-in...');
            const result = await signInWithPopup(auth, provider);
            
            if (!result || !result.user) {
                throw new Error('Google sign-in failed - no user returned');
            }

            const user = result.user;
            console.log('✅ Google sign-in successful');
            
            // Debug user object
            debugGoogleUser(user, 'After signInWithPopup');
            
            // Enhanced email retrieval with debugging
            let userEmail = extractEmailFromUser(user);

            // If still no email, try additional methods
            if (!userEmail) {
                console.log('🔄 Trying additional email retrieval methods...');
                
                // Method: Get credential and use Google API
                try {
                    const credential = GoogleAuthProvider.credentialFromResult(result);
                    if (credential && credential.accessToken) {
                        console.log('🔑 Access token found, fetching user info from Google API');
                        const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${credential.accessToken}`);
                        const userInfo = await response.json();
                        console.log('📧 Google API response:', userInfo);
                        
                        if (userInfo.email) {
                            userEmail = userInfo.email;
                            console.log('✅ Email retrieved from Google API:', userEmail);
                        }
                    }
                } catch (apiError) {
                    console.error('Google API fallback failed:', apiError);
                }
            }

            // Method: Wait for auth state change
            if (!userEmail) {
                console.log('🔄 Waiting for auth state change to get email...');
                try {
                    userEmail = await new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            unsubscribe();
                            reject(new Error('Timeout waiting for email'));
                        }, 3000);
                        
                        const unsubscribe = auth.onAuthStateChanged((authUser) => {
                            if (authUser && authUser.email) {
                                clearTimeout(timeout);
                                unsubscribe();
                                console.log('📧 Email found via auth state change:', authUser.email);
                                resolve(authUser.email);
                            }
                        });
                    });
                } catch (waitError) {
                    console.error('Auth state wait failed:', waitError);
                }
            }

            // Final validation
            if (!userEmail) {
                await signOut(auth);
                throw new Error('Google একাউন্ট থেকে ইমেইল পাওয়া যায়নি। আবার চেষ্টা করুন।');
            }

            if (!userEmail.endsWith('@seu.edu.bd')) {
                await signOut(auth);
                throw new Error('শুধুমাত্র SEU ইমেইল (@seu.edu.bd) দিয়ে রেজিস্ট্রেশন করুন');
            }

            console.log('✅ SEU email validated:', userEmail);
            
            // Create enhanced user object with email
            const enhancedUser = {
                ...user,
                email: userEmail
            };
            
            // Return result with enhanced user
            return {
                ...result,
                user: enhancedUser
            };

        } catch (error) {
            console.error('❌ Google sign-in error:', error);
            
            // Handle specific error cases
            if (error.code === 'auth/popup-blocked') {
                throw new Error('পপআপ ব্লক করা হয়েছে। ব্রাউজার সেটিংস থেকে পপআপ অনুমতি দিন।');
            } else if (error.code === 'auth/popup-closed-by-user') {
                throw new Error('Google সাইন-ইন বাতিল করা হয়েছে।');
            } else if (error.code === 'auth/cancelled-popup-request') {
                throw new Error('একাধিক লগইন চেষ্টা। আবার চেষ্টা করুন।');
            } else if (error.message) {
                throw error;
            } else {
                throw new Error('Google সাইন-ইনে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
            }
        } finally {
            setLoading(false);
        }
    };

    const updateUserProfile = (profile) => {
        if (auth.currentUser) {
            return updateProfile(auth.currentUser, profile);
        }
        return Promise.reject(new Error('No user is currently signed in'));
    };

    const sendEmailVerification = () => {
        if (auth.currentUser) {
            return firebaseSendEmailVerification(auth.currentUser);
        }
        return Promise.reject(new Error('No user is currently signed in'));
    };

    const reloadUser = async () => {
        if (auth.currentUser && typeof auth.currentUser.reload === 'function') {
            try {
                console.log('🔄 Reloading Firebase user...');
                console.log('📷 Before reload - photoURL:', auth.currentUser.photoURL?.substring(0, 50) + '...');
                
                await reload(auth.currentUser);
                
                console.log('📷 After reload - photoURL:', auth.currentUser.photoURL?.substring(0, 50) + '...');
                console.log('✅ Creating new user object for state update');
                
                // Create a completely new object to ensure React detects the change
                const updatedUser = {
                    uid: auth.currentUser.uid,
                    email: auth.currentUser.email,
                    displayName: auth.currentUser.displayName,
                    photoURL: auth.currentUser.photoURL,
                    emailVerified: auth.currentUser.emailVerified,
                    metadata: auth.currentUser.metadata,
                    providerData: auth.currentUser.providerData,
                    // Copy all other properties
                    ...auth.currentUser
                };
                
                setUser(updatedUser);
                console.log('✅ User state updated with new photoURL');
            } catch (error) {
                console.error('Error reloading user:', error);
            }
        } else {
            console.warn('Cannot reload user: currentUser is null or reload function not available');
        }
    };

    const logout = async () => {
        setLoading(true);

        // Get current user email before logout
        const currentUserEmail = user?.email;

        // Clean up localStorage data
        try {
            // Use dynamic import instead of require for ES modules
            const { localStorageManager } = await import('../utils/localStorageManager');
            if (currentUserEmail) {
                // Clear user-specific data
                localStorageManager.clearUserData(currentUserEmail);
                console.log('User-specific localStorage data cleared on logout');
            } else {
                // If no user email, clear all data
                localStorageManager.clearAll();
                console.log('All localStorage data cleared on logout');
            }
            // Clear cached email
            localStorage.removeItem('lastAuthenticatedEmail');
        } catch (error) {
            console.error('Error clearing localStorage on logout:', error);
            // Fallback: clear cached email directly
            try {
                localStorage.removeItem('lastAuthenticatedEmail');
            } catch (fallbackError) {
                console.error('Fallback localStorage clear failed:', fallbackError);
            }
        }

        // Clean up sync service
        try {
            // Use dynamic import instead of require for ES modules
            const { cleanupSyncService } = await import('../utils/syncService');
            cleanupSyncService();
            console.log('Sync service cleaned up on logout');
        } catch (error) {
            console.error('Error cleaning up sync service on logout:', error);
        }

        return signOut(auth);
    };

    // Observe User State
    useEffect(() => {
        try {
            const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                console.log('🔐 Auth state changed');
                if (currentUser) {
                    debugUserObject(currentUser, 'Auth State Change');
                    
                    // Enhanced user state validation for Google users
                    if (!currentUser.email && currentUser.providerData?.length > 0) {
                        console.log('🔄 User email missing, trying to get from providerData');
                        const googleProvider = currentUser.providerData.find(p => p.providerId === 'google.com');
                        if (googleProvider?.email) {
                            console.log('📧 Found email in providerData:', googleProvider.email);
                            // Create enhanced user object with email from providerData
                            const enhancedUser = {
                                ...currentUser,
                                email: googleProvider.email,
                                displayName: googleProvider.displayName || currentUser.displayName,
                                photoURL: googleProvider.photoURL || currentUser.photoURL
                            };
                            setUser(enhancedUser);
                            setLoading(false);
                            return;
                        }
                    }
                    
                    // Check if user has SEU email
                    if (currentUser.email && !currentUser.email.endsWith('@seu.edu.bd')) {
                        console.log('❌ Non-SEU email detected in auth state:', currentUser.email);
                        // Sign out non-SEU user
                        signOut(auth).then(() => {
                            console.log('🚪 Non-SEU user signed out');
                            setUser(null);
                            setLoading(false);
                        });
                        return;
                    }
                    
                    // Enhanced user object preparation with token methods
                    try {
                        // Ensure getIdToken method is available
                        if (typeof currentUser.getIdToken !== 'function') {
                            console.log('⚠️ getIdToken method not available, attempting to restore...');
                            
                            // Try to reload the user to get fresh methods
                            try {
                                await currentUser.reload();
                                console.log('🔄 User reloaded successfully');
                            } catch (reloadError) {
                                console.warn('User reload failed:', reloadError);
                            }
                            
                            // If still no getIdToken, create a wrapper
                            if (typeof currentUser.getIdToken !== 'function') {
                                console.log('🔧 Creating getIdToken wrapper for user object');
                                currentUser.getIdToken = async (forceRefresh = false) => {
                                    try {
                                        // Try to get token from Firebase auth directly
                                        const freshUser = auth.currentUser;
                                        if (freshUser && typeof freshUser.getIdToken === 'function') {
                                            return await freshUser.getIdToken(forceRefresh);
                                        }
                                        throw new Error('getIdToken method not available');
                                    } catch (error) {
                                        console.error('getIdToken wrapper error:', error);
                                        throw error;
                                    }
                                };
                            }
                        }
                        
                        // Test the getIdToken method
                        try {
                            const testToken = await currentUser.getIdToken();
                            if (testToken) {
                                console.log('✅ getIdToken method working correctly');
                            }
                        } catch (tokenError) {
                            console.warn('⚠️ getIdToken test failed:', tokenError);
                        }
                        
                    } catch (enhancementError) {
                        console.error('User enhancement error:', enhancementError);
                    }
                } else {
                    console.log('❌ User logged out');
                }
                setUser(currentUser);
                setLoading(false);
            });

            return () => {
                unsubscribe();
            };
        } catch (error) {
            console.error('Auth state observer error:', error);
            setUser(null);
            setLoading(false);
        }
    }, []);

    const authInfo = {
        user,
        loading,
        registerUser,
        signinUser,
        signInGoogle,
        logout,
        updateUserProfile,
        sendEmailVerification,
        reloadUser
    };

    // Safety check - ensure all functions are defined
    Object.keys(authInfo).forEach(key => {
        if (typeof authInfo[key] === 'undefined') {
            console.error(`AuthProvider: ${key} is undefined`);
        }
    });

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;