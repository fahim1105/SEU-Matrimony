import Hero from '../Hero/Hero';
import SafetyTrust from '../SafetyTrust/SafetyTrust';
import CreateBiodataCTA from '../CreateBiodataCTA/CreateBiodataCTA';
import FindMatchCTA from '../FindMatchCTA/FindMatchCTA';
import WhySEUMatrimony from '../WhySEUMatrimony/WhySEUMatrimony.JSX';
import WorkingSteps from '../WorkingSteps/WorkingSteps.JSX';

const Home = () => {
    return (
        <div>
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