import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Check } from 'lucide-react';
import { getSyncService } from '../../utils/syncService';
import { localStorageManager } from '../../utils/localStorageManager';

const SyncStatus = () => {
    const [syncStatus, setSyncStatus] = useState({
        isSyncing: false,
        pendingCount: 0,
        hasAutoSync: false
    });
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        // Update online status
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Update sync status periodically
        const updateSyncStatus = () => {
            const syncService = getSyncService();
            if (syncService) {
                setSyncStatus(syncService.getSyncStatus());
            } else {
                const unsyncedRequests = localStorageManager.getUnsyncedRequests();
                setSyncStatus({
                    isSyncing: false,
                    pendingCount: unsyncedRequests.length,
                    hasAutoSync: false
                });
            }
        };

        updateSyncStatus();
        const interval = setInterval(updateSyncStatus, 5000); // Update every 5 seconds

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, []);

    const handleManualSync = () => {
        const syncService = getSyncService();
        if (syncService) {
            syncService.forcSync();
        }
    };

    // Don't show if everything is synced and online
    if (isOnline && syncStatus.pendingCount === 0 && !syncStatus.isSyncing) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className={`
                flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border
                ${isOnline 
                    ? 'bg-base-100 border-base-300 text-base-content' 
                    : 'bg-warning/10 border-warning/30 text-warning'
                }
            `}>
                {/* Connection Status Icon */}
                {isOnline ? (
                    <Wifi className="w-4 h-4 text-success" />
                ) : (
                    <WifiOff className="w-4 h-4 text-error" />
                )}

                {/* Sync Status */}
                {syncStatus.isSyncing ? (
                    <>
                        <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-sm font-medium">সিঙ্ক হচ্ছে...</span>
                    </>
                ) : syncStatus.pendingCount > 0 ? (
                    <>
                        <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">
                            {syncStatus.pendingCount} টি রিকোয়েস্ট সিঙ্ক হয়নি
                        </span>
                        {isOnline && (
                            <button
                                onClick={handleManualSync}
                                className="ml-2 px-2 py-1 text-xs bg-primary text-base-100 rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                সিঙ্ক করুন
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        <Check className="w-4 h-4 text-success" />
                        <span className="text-sm font-medium">সব সিঙ্ক হয়েছে</span>
                    </>
                )}

                {/* Offline Indicator */}
                {!isOnline && (
                    <span className="text-xs bg-error/20 text-error px-2 py-1 rounded-full">
                        অফলাইন
                    </span>
                )}
            </div>
        </div>
    );
};

export default SyncStatus;