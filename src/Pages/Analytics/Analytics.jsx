import UseRole from '../../../Hooks/UseRole';
import AdminAnalytics from './AdminAnalytics';
import Loader from '../../../Components/Loader/Loader';
import ModeratorApplications from '../ModeratorDashboard/ModeratorApplications/ModeratorApplications';
import UserOverview from './UserOverview';
// import MyApplications from '../UserDashboard/MyApplications/MyApplications';

const Analytics = () => {
    const { role, roleLoading } = UseRole();

    if (roleLoading) {
        return <Loader></Loader>
    }

    if (role === 'admin') {
        return <AdminAnalytics></AdminAnalytics>
    }
    else {
        // return <MyApplications></MyApplications>
        return <UserOverview></UserOverview>
    }

};

export default Analytics;