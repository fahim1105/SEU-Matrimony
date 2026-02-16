import { useEffect } from 'react';
import { useLocation } from 'react-router';
import toast from 'react-hot-toast';
import Hero from '../Hero/Hero';
import SafetyTrust from '../SafetyTrust/SafetyTrust';
import CreateBiodataCTA from '../CreateBiodataCTA/CreateBiodataCTA';
import FindMatchCTA from '../FindMatchCTA/FindMatchCTA';
import WhySEUMatrimony from '../WhySEUMatrimony/WhySEUMatrimony.JSX';
import WorkingSteps from '../WorkingSteps/WorkingSteps.JSX';

const Home = () => {
    const location = useLocation();

    // Show verification success message if coming from email verification
    useEffect(() => {
        if (location.state?.message && location.state?.fromVerification) {
            toast.success(location.state.message, {
                duration: 5000,
                icon: '🎉'
            });
            
            // Clear the state to prevent showing message on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    return (
        <div>
            {/* <SEULoader></SEULoader> */}
            <Hero></Hero>
            <WhySEUMatrimony />
            <WorkingSteps />
            <SafetyTrust />
            <CreateBiodataCTA />
            <FindMatchCTA />
        </div>
    );
};

export default Home;