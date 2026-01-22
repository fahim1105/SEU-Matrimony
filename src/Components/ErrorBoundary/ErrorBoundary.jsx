import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error Boundary caught an error:', error, errorInfo);
        }
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-base-100 flex items-center justify-center px-4">
                    <div className="max-w-md w-full bg-base-200 p-8 rounded-3xl shadow-2xl text-center">
                        <AlertTriangle className="w-16 h-16 text-error mx-auto mb-6" />
                        
                        <h1 className="text-2xl font-bold text-neutral mb-4">
                            কিছু সমস্যা হয়েছে
                        </h1>
                        
                        <p className="text-neutral/70 mb-6">
                            দুঃখিত, একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। পেজটি পুনরায় লোড করার চেষ্টা করুন।
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-base-100 p-4 rounded-2xl mb-6 text-left">
                                <h3 className="font-semibold text-error mb-2">Error Details:</h3>
                                <pre className="text-xs text-neutral/70 overflow-auto max-h-32">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </div>
                        )}

                        <div className="space-y-3">
                            <button
                                onClick={this.handleReload}
                                className="w-full bg-primary text-base-100 py-3 rounded-2xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                পেজ রিলোড করুন
                            </button>
                            
                            <button
                                onClick={this.handleGoHome}
                                className="w-full bg-base-100 text-neutral py-3 rounded-2xl font-semibold hover:bg-base-300 transition-all border border-base-300 flex items-center justify-center gap-2"
                            >
                                <Home className="w-4 h-4" />
                                হোমে ফিরে যান
                            </button>
                        </div>

                        <p className="text-xs text-neutral/50 mt-6">
                            সমস্যা অব্যাহত থাকলে সাপোর্টের সাথে যোগাযোগ করুন
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;