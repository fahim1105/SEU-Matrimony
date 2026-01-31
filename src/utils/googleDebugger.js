// Google Authentication Debugger
export const debugGoogleUser = (user, context = '') => {
    console.log(`🔍 [${context}] Google User Debug:`);
    console.log('- Email:', user?.email);
    console.log('- Display Name:', user?.displayName);
    console.log('- UID:', user?.uid);
    console.log('- Email Verified:', user?.emailVerified);
    console.log('- Photo URL:', user?.photoURL);
    console.log('- Provider ID:', user?.providerId);
    
    // Check provider data
    if (user?.providerData?.length > 0) {
        console.log('- Provider Data:');
        user.providerData.forEach((provider, index) => {
            console.log(`  Provider ${index}:`, {
                providerId: provider.providerId,
                email: provider.email,
                displayName: provider.displayName,
                photoURL: provider.photoURL,
                uid: provider.uid
            });
        });
    } else {
        console.log('- Provider Data: None');
    }
    
    // Check for Google-specific properties
    console.log('- Refresh Token:', user?.refreshToken ? 'Present' : 'Missing');
    console.log('- Access Token:', user?.accessToken ? 'Present' : 'Missing');
    
    return user;
};

export const extractEmailFromUser = (user) => {
    // Try multiple methods to extract email
    const methods = [
        () => user?.email,
        () => user?.providerData?.find(p => p.providerId === 'google.com')?.email,
        () => user?.providerData?.[0]?.email,
        () => user?.reloadUserInfo?.email
    ];
    
    for (let i = 0; i < methods.length; i++) {
        try {
            const email = methods[i]();
            if (email) {
                console.log(`✅ Email found via method ${i + 1}:`, email);
                return email;
            }
        } catch (error) {
            console.log(`❌ Method ${i + 1} failed:`, error.message);
        }
    }
    
    console.log('❌ No email found via any method');
    return null;
};