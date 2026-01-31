// Sync service to synchronize localStorage data with server when available
import { localStorageManager } from './localStorageManager';
import { createAxiosInstance } from './axiosInstance';
import { toast } from 'react-hot-toast';

export class SyncService {
    constructor(user) {
        this.user = user;
        this.axiosInstance = createAxiosInstance(user);
        this.isSyncing = false;
        this.syncInterval = null;
    }

    // Update user and recreate axios instance
    updateUser(user) {
        this.user = user;
        this.axiosInstance = createAxiosInstance(user);
    }

    // Start automatic sync every 30 seconds
    startAutoSync() {
        if (this.syncInterval) return;
        
        this.syncInterval = setInterval(() => {
            this.syncPendingRequests();
        }, 30000); // 30 seconds
    }

    // Stop automatic sync
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    // Check if server is available
    async isServerAvailable() {
        try {
            await this.axiosInstance.get('/health');
            return true;
        } catch (error) {
            return false;
        }
    }

    // Sync pending requests to server
    async syncPendingRequests() {
        if (this.isSyncing) return;
        
        this.isSyncing = true;
        
        try {
            const unsyncedRequests = localStorageManager.getUnsyncedRequests();
            
            if (unsyncedRequests.length === 0) {
                this.isSyncing = false;
                return;
            }

            const serverAvailable = await this.isServerAvailable();
            if (!serverAvailable) {
                console.log('Server not available, skipping sync');
                this.isSyncing = false;
                return;
            }

            console.log(`Syncing ${unsyncedRequests.length} pending requests...`);
            
            let syncedCount = 0;
            let failedCount = 0;

            for (const request of unsyncedRequests) {
                try {
                    // Try to send the request to server
                    const response = await this.axiosInstance.post('/send-request', {
                        senderEmail: request.senderEmail,
                        receiverEmail: request.receiverEmail,
                        status: request.status,
                        sentAt: request.sentAt
                    });

                    if (response.data.success) {
                        // Mark as synced
                        localStorageManager.markRequestAsSynced(request.id);
                        syncedCount++;
                        console.log(`Request ${request.id} synced successfully`);
                    } else {
                        failedCount++;
                        console.log(`Request ${request.id} sync failed:`, response.data.message);
                    }
                } catch (error) {
                    failedCount++;
                    console.log(`Request ${request.id} sync error:`, error.message);
                    
                    // If it's a duplicate request error, mark as synced anyway
                    if (error.response?.status === 400 && 
                        error.response?.data?.message?.includes('ইতিমধ্যে')) {
                        localStorageManager.markRequestAsSynced(request.id);
                        syncedCount++;
                        console.log(`Request ${request.id} already exists on server, marked as synced`);
                    }
                }
            }

            if (syncedCount > 0) {
                toast.success(`${syncedCount} টি রিকোয়েস্ট সার্ভারে সিঙ্ক হয়েছে`, {
                    duration: 3000,
                    position: 'bottom-right'
                });
            }

            if (failedCount > 0) {
                console.log(`${failedCount} requests failed to sync`);
            }

        } catch (error) {
            console.error('Sync service error:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    // Manual sync trigger
    async forcSync() {
        if (this.isSyncing) {
            toast.loading('সিঙ্ক চলছে...', { duration: 2000 });
            return;
        }

        const toastId = toast.loading('সার্ভারের সাথে সিঙ্ক করা হচ্ছে...');
        
        try {
            await this.syncPendingRequests();
            toast.success('সিঙ্ক সম্পন্ন হয়েছে', { id: toastId });
        } catch (error) {
            toast.error('সিঙ্ক করতে সমস্যা হয়েছে', { id: toastId });
        }
    }

    // Get sync status
    getSyncStatus() {
        const unsyncedRequests = localStorageManager.getUnsyncedRequests();
        return {
            isSyncing: this.isSyncing,
            pendingCount: unsyncedRequests.length,
            hasAutoSync: !!this.syncInterval
        };
    }
}

// Global sync service instance
let globalSyncService = null;

export const initializeSyncService = (user) => {
    if (!globalSyncService) {
        globalSyncService = new SyncService(user);
        globalSyncService.startAutoSync();
    } else {
        // Update existing service with new user
        globalSyncService.updateUser(user);
    }
    return globalSyncService;
};

export const getSyncService = () => globalSyncService;

export const cleanupSyncService = () => {
    if (globalSyncService) {
        globalSyncService.stopAutoSync();
        globalSyncService = null;
    }
};