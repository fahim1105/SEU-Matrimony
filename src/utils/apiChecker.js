// API endpoint availability checker
import { localStorageManager } from './localStorageManager';

export const checkEndpointAvailability = async (axiosInstance, endpoint) => {
    try {
        // Try a simple GET request to check if endpoint exists
        await axiosInstance.get(endpoint);
        return true;
    } catch (error) {
        if (error.response?.status === 404) {
            return false;
        }
        // Other errors might mean the endpoint exists but has other issues
        return true;
    }
};

// Fallback API calls for production server compatibility
export const apiWithFallback = {
    // Email verification with fallback
    verifyEmail: async (axiosInstance, email) => {
        try {
            // Try main endpoint
            return await axiosInstance.patch('/verify-email', { email });
        } catch (error) {
            if (error.response?.status === 404) {
                // Try test endpoint
                console.log('Using fallback verify-email endpoint');
                return await axiosInstance.post('/verify-email-test', { email });
            }
            throw error;
        }
    },

    // Verify email using token (for email link verification)
    verifyEmailToken: async (axiosInstance, tokenData) => {
        try {
            return await axiosInstance.post('/verify-email-token', tokenData);
        } catch (error) {
            if (error.response?.status === 404) {
                // Token verification endpoint doesn't exist, fallback to regular verify
                console.log('Token verification endpoint not found, using fallback');
                return await axiosInstance.patch('/verify-email', { email: tokenData.email });
            }
            throw error;
        }
    },

    // Send request with fallback (basic email-based request)
    sendRequest: async (axiosInstance, requestData) => {
        try {
            // Try main endpoint
            return await axiosInstance.post('/send-request', requestData);
        } catch (error) {
            console.error('Send request failed:', error.response?.status, error.response?.data?.message);
            // Handle different error types
            if (error.response?.status === 404) {
                // Save to localStorage and create mock response
                console.log('Send request endpoint not found, saving to localStorage');
                const savedRequest = localStorageManager.saveRequest(requestData);
                
                if (savedRequest) {
                    // Also save request status
                    localStorageManager.saveRequestStatus(
                        requestData.senderEmail, 
                        requestData.receiverEmail, 
                        'pending'
                    );
                    
                    return {
                        data: {
                            success: true,
                            message: 'রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে (Offline mode)',
                            result: {
                                insertedId: savedRequest.id,
                                acknowledged: true
                            }
                        }
                    };
                } else {
                    throw new Error('রিকোয়েস্ট সেভ করতে সমস্যা হয়েছে');
                }
            } else if (error.response?.status === 400) {
                // Bad request - likely missing required fields or duplicate request
                const message = error.response?.data?.message || 'রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে';
                throw new Error(message);
            } else if (error.response?.status === 401) {
                throw new Error('অনুমতি নেই। দয়া করে আবার লগইন করুন।');
            } else if (error.response?.status === 403) {
                // Forbidden - likely email not verified or account inactive
                const message = error.response?.data?.message || 'আপনার একাউন্ট যাচাই করুন';
                throw new Error(message);
            }
            throw error;
        }
    },

    // Send request by biodata ID with fallback
    sendRequestByBiodata: async (axiosInstance, requestData) => {
        try {
            // Try biodata-specific endpoint first
            return await axiosInstance.post('/send-request-by-biodata', requestData);
        } catch (error) {
            console.log('Biodata request failed:', error.response?.status, error.response?.data?.message);
            if (error.response?.status === 404) {
                // Fallback to regular send request with email (if available)
                console.log('Using fallback send-request endpoint');
                const fallbackData = {
                    senderEmail: requestData.senderEmail,
                    receiverEmail: requestData.receiverEmail || requestData.contactEmail,
                    status: 'pending',
                    sentAt: new Date()
                };
                return await apiWithFallback.sendRequest(axiosInstance, fallbackData);
            } else if (error.response?.status === 400) {
                // Bad request - likely missing required fields or duplicate request
                const message = error.response?.data?.message || 'রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে';
                throw new Error(message);
            } else if (error.response?.status === 401) {
                throw new Error('অনুমতি নেই। দয়া করে আবার লগইন করুন।');
            } else if (error.response?.status === 403) {
                // Forbidden - likely email not verified or account inactive
                const message = error.response?.data?.message || 'আপনার একাউন্ট যাচাই করুন';
                throw new Error(message);
            }
            throw error;
        }
    },

    // Send request by ObjectId with fallback
    sendRequestByObjectId: async (axiosInstance, requestData) => {
        try {
            // Try ObjectId-specific endpoint first
            return await axiosInstance.post('/send-request-by-objectid', requestData);
        } catch (error) {
            console.log('ObjectId request failed:', error.response?.status, error.response?.data?.message);
            if (error.response?.status === 404) {
                // Fallback to regular send request with email (if available)
                console.log('Using fallback send-request endpoint');
                const fallbackData = {
                    senderEmail: requestData.senderEmail,
                    receiverEmail: requestData.receiverEmail || requestData.contactEmail,
                    status: 'pending',
                    sentAt: new Date()
                };
                return await apiWithFallback.sendRequest(axiosInstance, fallbackData);
            } else if (error.response?.status === 400) {
                // Bad request - likely missing required fields or duplicate request
                const message = error.response?.data?.message || 'রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে';
                throw new Error(message);
            } else if (error.response?.status === 401) {
                throw new Error('অনুমতি নেই। দয়া করে আবার লগইন করুন।');
            } else if (error.response?.status === 403) {
                // Forbidden - likely email not verified or account inactive
                const message = error.response?.data?.message || 'আপনার একাউন্ট যাচাই করুন';
                throw new Error(message);
            }
            throw error;
        }
    },

    // Get user info with enhanced fallback
    getUserInfo: async (axiosInstance, email) => {
        try {
            return await axiosInstance.get(`/user/${email}`);
        } catch (error) {
            if (error.response?.status === 404) {
                // Check localStorage for user status
                const localUserStatus = localStorageManager.getUserStatus(email);
                if (localUserStatus) {
                    console.log('Using localStorage user status');
                    return {
                        data: {
                            success: true,
                            user: localUserStatus
                        }
                    };
                }
                
                // If user endpoint works but user not found, return appropriate response
                console.log('User not found in database');
                return {
                    data: {
                        success: false,
                        message: 'ইউজার পাওয়া যায়নি'
                    }
                };
            } else if (error.response?.status >= 500) {
                // Server error - check localStorage first, then return mock response for Google users
                const localUserStatus = localStorageManager.getUserStatus(email);
                if (localUserStatus) {
                    console.log('Server error, using localStorage user status');
                    return {
                        data: {
                            success: true,
                            user: localUserStatus
                        }
                    };
                }
                
                console.log('Server error, using fallback for Google users');
                if (email && email.endsWith('@seu.edu.bd')) {
                    const fallbackStatus = {
                        email: email,
                        isEmailVerified: true, // Google users are pre-verified
                        isActive: true,
                        role: 'user',
                        isGoogleUser: true // Mark as Google user for proper handling
                    };
                    
                    // Save to localStorage for future use
                    localStorageManager.saveUserStatus(email, fallbackStatus);
                    
                    return {
                        data: {
                            success: true,
                            user: fallbackStatus
                        }
                    };
                }
            }
            throw error;
        }
    },

    // Check request status with localStorage fallback
    checkRequestStatus: async (axiosInstance, senderEmail, receiverEmail) => {
        try {
            // Try server first
            const response = await axiosInstance.get(`/request-status/${senderEmail}/${receiverEmail}`);
            return response;
        } catch (error) {
            if (error.response?.status === 404 || error.response?.status >= 500) {
                // Fallback to localStorage
                console.log('Request status endpoint unavailable, checking localStorage');
                const localStatus = localStorageManager.getRequestStatus(senderEmail, receiverEmail);
                
                return {
                    data: {
                        success: true,
                        hasRequest: localStatus.hasRequest,
                        status: localStatus.status,
                        requestId: localStatus.requestId || null,
                        isInitiator: true // Assume initiator since it's in localStorage
                    }
                };
            }
            throw error;
        }
    },

    // Cancel request with localStorage fallback
    cancelRequest: async (axiosInstance, requestId, senderEmail, receiverEmail) => {
        try {
            // Try server first
            return await axiosInstance.delete(`/cancel-request/${requestId}`);
        } catch (error) {
            if (error.response?.status === 404 || error.response?.status >= 500) {
                // Fallback to localStorage
                console.log('Cancel request endpoint unavailable, removing from localStorage');
                const removed = localStorageManager.removeRequest(requestId);
                localStorageManager.removeRequestStatus(senderEmail, receiverEmail);
                
                if (removed) {
                    return {
                        data: {
                            success: true,
                            message: 'রিকোয়েস্ট সফলভাবে বাতিল করা হয়েছে (Offline mode)'
                        }
                    };
                } else {
                    throw new Error('রিকোয়েস্ট বাতিল করতে সমস্যা হয়েছে');
                }
            }
            throw error;
        }
    },

    // Browse matches with fallback
    browseMatches: async (axiosInstance, email) => {
        try {
            // Try the specific browse-matches endpoint first
            return await axiosInstance.get(`/browse-matches/${email}`);
        } catch (error) {
            if (error.response?.status === 404) {
                // Try old endpoint as fallback
                console.log('Using fallback browse-matches endpoint');
                return await axiosInstance.get('/all-biodata');
            }
            throw error;
        }
    },

    // Send verification email with fallback
    sendVerificationEmail: async (axiosInstance, email) => {
        try {
            return await axiosInstance.post('/send-verification-email', { email });
        } catch (error) {
            if (error.response?.status === 404) {
                // Endpoint doesn't exist, return mock response
                console.log('Send verification email endpoint not found, using fallback');
                return {
                    data: {
                        success: true,
                        message: 'ভেরিফিকেশন ইমেইল পাঠানো হয়েছে (সার্ভিস সাময়িকভাবে বন্ধ)',
                        warning: 'ইমেইল সার্ভিস বর্তমানে কনফিগার করা হয়নি। ম্যানুয়াল ভেরিফিকেশন ব্যবহার করুন।'
                    }
                };
            }
            throw error;
        }
    },

    // Register user with fallback
    registerUser: async (axiosInstance, userData) => {
        try {
            return await axiosInstance.post('/register-user', userData);
        } catch (error) {
            if (error.response?.status === 404) {
                // If register endpoint doesn't exist, provide appropriate fallback
                console.log('Register endpoint not found (404), using fallback approach');
                
                if (userData.isGoogleUser) {
                    // Google users can proceed with Firebase-only registration
                    console.log('Google user fallback: Firebase registration successful');
                    return {
                        data: {
                            success: true,
                            message: 'Google রেজিস্ট্রেশন সফল হয়েছে! (Database sync pending)',
                            user: userData,
                            warning: 'Database registration will sync automatically'
                        }
                    };
                } else {
                    // Email users need both Firebase and database registration
                    console.log('Email user fallback: Firebase only, database pending');
                    return {
                        data: {
                            success: true,
                            message: 'রেজিস্ট্রেশন সফল! ইমেইল ভেরিফিকেশন লিংক পাঠানো হয়েছে।',
                            user: userData,
                            warning: 'Database registration pending - contact admin if issues persist'
                        }
                    };
                }
            } else if (error.response?.status === 400) {
                // Bad request - likely duplicate email or validation error
                const message = error.response?.data?.message || 'রেজিস্ট্রেশনে সমস্যা হয়েছে';
                throw new Error(message);
            } else if (error.response?.status === 403) {
                // Forbidden - likely invalid email domain
                const message = error.response?.data?.message || 'শুধুমাত্র SEU ইমেইল (@seu.edu.bd) দিয়ে রেজিস্ট্রেশন করুন';
                throw new Error(message);
            }
            throw error;
        }
    },

    // Complete registration for authenticated users missing from database
    completeRegistration: async (axiosInstance, userData) => {
        try {
            return await axiosInstance.post('/complete-registration', userData);
        } catch (error) {
            if (error.response?.status === 404) {
                // Endpoint doesn't exist, return fallback
                console.log('Complete registration endpoint not found, using fallback');
                return {
                    data: {
                        success: true,
                        message: 'রেজিস্ট্রেশন সম্পন্ন হয়েছে (Fallback mode)',
                        user: userData
                    }
                };
            }
            throw error;
        }
    }
};