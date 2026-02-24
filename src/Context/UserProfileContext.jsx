import { createContext, useContext, useState, useEffect } from 'react';
import UseAuth from '../Hooks/UseAuth';
import UseAxiosSecure from '../Hooks/UseAxiosSecure';

const UserProfileContext = createContext(null);

export const UserProfileProvider = ({ children }) => {
    const { user } = UseAuth();
    const axiosSecure = UseAxiosSecure();
    const [profileData, setProfileData] = useState({
        photoURL: '',
        displayName: '',
        email: ''
    });
    const [loading, setLoading] = useState(true);

    // Fetch profile data from backend ONLY - ignore Firebase user photoURL
    useEffect(() => {
        if (user?.email) {
            console.log('🔄 UserProfileContext - User logged in, fetching from backend ONLY');
            fetchProfileData();
        } else {
            setLoading(false);
        }
    }, [user?.email]);

    // Listen for profile update events
    useEffect(() => {
        const handleProfileUpdate = async (event) => {
            console.log('📢 UserProfileContext - Profile update event received');
            const { photoURL } = event.detail || {};
            
            if (photoURL) {
                console.log('📸 Updating profile photo in context:', photoURL.substring(0, 50) + '...');
                setProfileData(prev => ({
                    ...prev,
                    photoURL: photoURL
                }));
            } else {
                // Fetch fresh data from backend
                await fetchProfileData();
            }
        };

        window.addEventListener('profilePhotoUpdated', handleProfileUpdate);
        
        return () => {
            window.removeEventListener('profilePhotoUpdated', handleProfileUpdate);
        };
    }, [user?.email]);

    const fetchProfileData = async () => {
        if (!user?.email) return;
        
        try {
            console.log('🔄 Fetching profile data from backend database...');
            const response = await axiosSecure.get(`/user/${user.email}`);
            
            if (response.data.success) {
                const userData = response.data.user;
                console.log('✅ Profile data fetched from DATABASE (not Firebase):', {
                    photoURL: userData.photoURL?.substring(0, 50) + '...',
                    hasPhoto: !!userData.photoURL,
                    source: 'MongoDB Database'
                });
                
                // Use ONLY database photoURL, ignore Firebase user photoURL
                setProfileData({
                    photoURL: userData.photoURL || '', // Database is source of truth
                    displayName: userData.displayName || user.displayName || '',
                    email: userData.email || user.email || ''
                });
                
                console.log('📸 Profile photo set from database, Firebase photoURL ignored');
            } else {
                console.error('❌ Backend fetch failed');
                // Even on error, don't use Firebase photoURL - keep empty
                setProfileData({
                    photoURL: '', // Don't fallback to Firebase
                    displayName: user.displayName || '',
                    email: user.email || ''
                });
            }
        } catch (error) {
            console.error('❌ Error fetching profile data:', error);
            // On error, don't use Firebase photoURL - keep empty
            setProfileData({
                photoURL: '', // Don't fallback to Firebase
                displayName: user.displayName || '',
                email: user.email || ''
            });
        } finally {
            setLoading(false);
        }
    };

    const updateProfilePhoto = (newPhotoURL) => {
        console.log('📸 UserProfileContext - Updating photo:', newPhotoURL.substring(0, 50) + '...');
        setProfileData(prev => ({
            ...prev,
            photoURL: newPhotoURL
        }));
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('profilePhotoUpdated', {
            detail: { photoURL: newPhotoURL }
        }));
    };

    const value = {
        profileData,
        loading,
        updateProfilePhoto,
        refreshProfile: fetchProfileData
    };

    return (
        <UserProfileContext.Provider value={value}>
            {children}
        </UserProfileContext.Provider>
    );
};

export const useUserProfile = () => {
    const context = useContext(UserProfileContext);
    if (!context) {
        throw new Error('useUserProfile must be used within UserProfileProvider');
    }
    return context;
};
