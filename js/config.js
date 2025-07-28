// Configuration file for EverTest website
// This file contains public configuration that can be safely committed to version control
// For sensitive values, use environment variables or server-side configuration

const config = {
    // Analytics Configuration
    // Note: These are example/demo IDs - replace with your actual values
    analytics: {
        // Heap Analytics - for user behavior tracking
        heapId: '3967502602', // Replace with your Heap Analytics ID
        
        // Google Analytics - for web analytics  
        googleAnalyticsId: 'UA-73550261-1' // Replace with your Google Analytics ID
    },
    
    // Form Processing Configuration
    form: {
        // Contact form endpoint - replace with your actual form processing service
        submitUrl: 'https://flipmail.co/api/Hha8XXK4ufs9gYozC4IM'
    },
    
    // Website Configuration
    site: {
        name: 'EverTest',
        url: 'https://evertestsite.github.io',
        email: 'info@evertest.io',
        address: {
            street: 'Mézeskalács tér 18.',
            city: 'Budapest',
            postalCode: '1071',
            country: 'HU'
        }
    },
    
    // Features Configuration
    features: {
        cookieConsent: true,
        analytics: true,
        serviceWorker: true
    }
};

// Make config available globally
window.EverTestConfig = config;