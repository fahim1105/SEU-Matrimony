import { useEffect, useRef } from 'react';
import UseAuth from './UseAuth';
import { initializeSyncService, cleanupSyncService } from '../utils/syncService';

const UseSyncService = () => {
    const { user } = UseAuth();
    const syncServiceRef = useRef(null);

    useEffect(() => {
        // Initialize sync service when user is authenticated
        if (user) {
            try {
                console.log('Initializing sync service for user:', user.email);
                syncServiceRef.current = initializeSyncService(user);
                
                // Perform initial sync after a delay
                const syncTimeout = setTimeout(() => {
                    if (syncServiceRef.current) {
                        syncServiceRef.current.syncPendingRequests();
                    }
                }, 2000); // Wait 2 seconds after login

                return () => {
                    // Clear timeout
                    clearTimeout(syncTimeout);
                    
                    // Cleanup sync service
                    console.log('Cleaning up sync service');
                    cleanupSyncService();
                    syncServiceRef.current = null;
                };
            } catch (error) {
                console.error('Error initializing sync service:', error);
            }
        } else {
            // User logged out, cleanup if service exists
            if (syncServiceRef.current) {
                console.log('User logged out, cleaning up sync service');
                cleanupSyncService();
                syncServiceRef.current = null;
            }
        }
    }, [user]);

    return null; // This hook doesn't render anything
};

export default UseSyncService;