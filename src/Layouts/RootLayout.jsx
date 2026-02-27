import { Outlet } from 'react-router';
import Navbar from '../Components/Navbar/Navbar';
import Footer from '../Components/Footer/Footer';
import SyncStatus from '../Components/SyncStatus/SyncStatus';
import UseSyncService from '../Hooks/UseSyncService';
import FeedbackButton from '../Components/FeedbackButton/FeedbackButton';
import { NotificationProvider } from '../Context/NotificationContext';

const RootLayout = () => {
    // Initialize sync service for root layout users with error handling
    try {
        UseSyncService();
    } catch (error) {
        console.error('Error initializing sync service in root layout:', error);
    }

    return (
        <NotificationProvider>
            <div >
                <section className='lg:mb-5'>
                    <Navbar></Navbar>
                </section>
                <main>
                    <Outlet></Outlet>
                </main>
                <section>
                    <Footer></Footer>
                </section>
                
                {/* Sync Status Indicator */}
                <SyncStatus />
                
                {/* Feedback Button */}
                <FeedbackButton />
            </div>
        </NotificationProvider>
    );
};

export default RootLayout;