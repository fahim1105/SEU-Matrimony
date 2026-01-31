// Local storage manager for offline functionality
const LOCAL_STORAGE_KEYS = {
    REQUESTS: 'seu_matrimony_requests',
    USER_STATUS: 'seu_matrimony_user_status',
    REQUEST_STATUS: 'seu_matrimony_request_status'
};

export const localStorageManager = {
    // Request management
    saveRequest: (requestData) => {
        try {
            const existingRequests = localStorageManager.getRequests();
            const newRequest = {
                ...requestData,
                id: `local_${Date.now()}`,
                timestamp: new Date().toISOString(),
                synced: false
            };
            
            existingRequests.push(newRequest);
            localStorage.setItem(LOCAL_STORAGE_KEYS.REQUESTS, JSON.stringify(existingRequests));
            return newRequest;
        } catch (error) {
            console.error('Error saving request to localStorage:', error);
            return null;
        }
    },

    getRequests: () => {
        try {
            const requests = localStorage.getItem(LOCAL_STORAGE_KEYS.REQUESTS);
            return requests ? JSON.parse(requests) : [];
        } catch (error) {
            console.error('Error getting requests from localStorage:', error);
            return [];
        }
    },

    removeRequest: (requestId) => {
        try {
            const existingRequests = localStorageManager.getRequests();
            const filteredRequests = existingRequests.filter(req => req.id !== requestId);
            localStorage.setItem(LOCAL_STORAGE_KEYS.REQUESTS, JSON.stringify(filteredRequests));
            return true;
        } catch (error) {
            console.error('Error removing request from localStorage:', error);
            return false;
        }
    },

    // Request status management
    saveRequestStatus: (senderEmail, receiverEmail, status) => {
        try {
            const key = `${senderEmail}_${receiverEmail}`;
            const statusData = {
                hasRequest: true,
                status: status,
                timestamp: new Date().toISOString(),
                synced: false
            };
            
            const existingStatuses = localStorageManager.getRequestStatuses();
            existingStatuses[key] = statusData;
            
            localStorage.setItem(LOCAL_STORAGE_KEYS.REQUEST_STATUS, JSON.stringify(existingStatuses));
            return statusData;
        } catch (error) {
            console.error('Error saving request status to localStorage:', error);
            return null;
        }
    },

    getRequestStatus: (senderEmail, receiverEmail) => {
        try {
            const key = `${senderEmail}_${receiverEmail}`;
            const statuses = localStorageManager.getRequestStatuses();
            return statuses[key] || { hasRequest: false, status: null };
        } catch (error) {
            console.error('Error getting request status from localStorage:', error);
            return { hasRequest: false, status: null };
        }
    },

    getRequestStatuses: () => {
        try {
            const statuses = localStorage.getItem(LOCAL_STORAGE_KEYS.REQUEST_STATUS);
            return statuses ? JSON.parse(statuses) : {};
        } catch (error) {
            console.error('Error getting request statuses from localStorage:', error);
            return {};
        }
    },

    removeRequestStatus: (senderEmail, receiverEmail) => {
        try {
            const key = `${senderEmail}_${receiverEmail}`;
            const existingStatuses = localStorageManager.getRequestStatuses();
            delete existingStatuses[key];
            localStorage.setItem(LOCAL_STORAGE_KEYS.REQUEST_STATUS, JSON.stringify(existingStatuses));
            return true;
        } catch (error) {
            console.error('Error removing request status from localStorage:', error);
            return false;
        }
    },

    // User status management
    saveUserStatus: (email, status) => {
        try {
            const userStatuses = localStorageManager.getUserStatuses();
            userStatuses[email] = {
                ...status,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(LOCAL_STORAGE_KEYS.USER_STATUS, JSON.stringify(userStatuses));
            return true;
        } catch (error) {
            console.error('Error saving user status to localStorage:', error);
            return false;
        }
    },

    getUserStatus: (email) => {
        try {
            const statuses = localStorageManager.getUserStatuses();
            return statuses[email] || null;
        } catch (error) {
            console.error('Error getting user status from localStorage:', error);
            return null;
        }
    },

    getUserStatuses: () => {
        try {
            const statuses = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_STATUS);
            return statuses ? JSON.parse(statuses) : {};
        } catch (error) {
            console.error('Error getting user statuses from localStorage:', error);
            return {};
        }
    },

    // Sync management
    markRequestAsSynced: (requestId) => {
        try {
            const requests = localStorageManager.getRequests();
            const updatedRequests = requests.map(req => 
                req.id === requestId ? { ...req, synced: true } : req
            );
            localStorage.setItem(LOCAL_STORAGE_KEYS.REQUESTS, JSON.stringify(updatedRequests));
            return true;
        } catch (error) {
            console.error('Error marking request as synced:', error);
            return false;
        }
    },

    getUnsyncedRequests: () => {
        try {
            const requests = localStorageManager.getRequests();
            return requests.filter(req => !req.synced);
        } catch (error) {
            console.error('Error getting unsynced requests:', error);
            return [];
        }
    },

    // Clear all data
    clearAll: () => {
        try {
            Object.values(LOCAL_STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    },

    // Clear user-specific data (for logout)
    clearUserData: (userEmail) => {
        try {
            // Clear user status for this specific user
            const userStatuses = localStorageManager.getUserStatuses();
            delete userStatuses[userEmail];
            localStorage.setItem(LOCAL_STORAGE_KEYS.USER_STATUS, JSON.stringify(userStatuses));

            // Clear request statuses involving this user
            const requestStatuses = localStorageManager.getRequestStatuses();
            Object.keys(requestStatuses).forEach(key => {
                if (key.includes(userEmail)) {
                    delete requestStatuses[key];
                }
            });
            localStorage.setItem(LOCAL_STORAGE_KEYS.REQUEST_STATUS, JSON.stringify(requestStatuses));

            // Clear requests from this user
            const requests = localStorageManager.getRequests();
            const filteredRequests = requests.filter(req => req.senderEmail !== userEmail);
            localStorage.setItem(LOCAL_STORAGE_KEYS.REQUESTS, JSON.stringify(filteredRequests));

            return true;
        } catch (error) {
            console.error('Error clearing user data from localStorage:', error);
            return false;
        }
    }
};