import { createBrowserRouter } from "react-router";
import Home from '../Components/Home/Home';
import RootLayout from '../Layouts/RootLayout';
import AuthLayout from '../Layouts/AuthLayout';
import DashboardLayout from '../Layouts/DashboardLayout';
import DashboardHome from '../Pages/Dashboard/DashboardHome';
import BiodataForm from '../Pages/Biodata/BiodataForm';
import MyRequests from '../Pages/Requests/MyRequests';
import Messages from '../Pages/Messages/Messages';
import ProfileDetails from '../Pages/Profile/ProfileDetails';
import Login from '../Pages/Login/Login';
import Register from '../Pages/Register/Register';
import EmailVerification from '../Pages/EmailVerification/EmailVerification';
import AccountSettings from '../Pages/AccountSettings/AccountSettings';
import BrowseMatches from '../Pages/BrowseMatches/BrowseMatches';
import FriendsList from '../Pages/Friends/FriendsList';
import MyProfile from '../Pages/Profile/MyProfile';
import PendingBiodatas from '../Pages/Admin/PendingBiodatas';
import UserManagement from '../Pages/Admin/UserManagement';
import AdminAnalytics from '../Pages/Admin/AdminAnalytics';
import AdminSuccessStories from '../Pages/Admin/AdminSuccessStories';
import SuccessStories from '../Pages/SuccessStories/SuccessStories';
import Guidelines from '../Pages/Guidelines/Guidelines';
import PrivetRoutes from './PrivetRoutes';
import AdminRoutes from './AdminRoutes';
import ProtectedRoute from "../Components/ProtectedRoute/ProtectedRoute";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: RootLayout,
        // errorElement: <ErrorPage></ErrorPage>,
        children: [
            {
                index: true,
                Component: Home
            },
            {
                path: "/success-stories",
                Component: SuccessStories
            },
            {
                path: "/guidelines",
                Component: Guidelines
            },
            {
                path: "/browse-matches",
                element: <PrivetRoutes><ProtectedRoute><BrowseMatches /></ProtectedRoute></PrivetRoutes>
            },
            {
                path: "/my-requests",
                element: <ProtectedRoute><MyRequests /></ProtectedRoute>
            },
            {
                path: "/messages",
                element: <ProtectedRoute><Messages /></ProtectedRoute>
            },
            {
                path: "/profile/:biodataId",
                element: <PrivetRoutes><ProtectedRoute><ProfileDetails /></ProtectedRoute></PrivetRoutes>
            },
            {
                path: "/profile",
                element: <ProtectedRoute><MyProfile /></ProtectedRoute>
            },
        ]
    },
    {
        path: "/auth",
        Component: AuthLayout,
        children: [
            {
                path: "/auth/login",
                Component: Login
            },
            {
                path: "/auth/register",
                Component: Register
            },
            {
                path: "/auth/verify-email",
                Component: EmailVerification
            }
        ]
    },
    {
        path: 'dashboard',
        element: <PrivetRoutes><DashboardLayout /></PrivetRoutes>,
        children: [
            {
                index: true,
                element: <ProtectedRoute><DashboardHome /></ProtectedRoute>
            },
            {
                path: "friends",
                element: <ProtectedRoute><FriendsList /></ProtectedRoute>
            },
            {
                path: "profile",
                element: <ProtectedRoute><MyProfile /></ProtectedRoute>
            },
            {
                path: "biodata-form",
                element: <ProtectedRoute><BiodataForm /></ProtectedRoute>
            },
            {
                path: "account-settings",
                element: <ProtectedRoute><AccountSettings /></ProtectedRoute>
            },
            {
                path: "admin/user-management",
                element: <ProtectedRoute><AdminRoutes><UserManagement /></AdminRoutes></ProtectedRoute>
            },
            {
                path: "admin/analytics",
                element: <ProtectedRoute><AdminRoutes><AdminAnalytics /></AdminRoutes></ProtectedRoute>
            },
            {
                path: "admin/pending-biodatas",
                element: <ProtectedRoute><AdminRoutes><PendingBiodatas /></AdminRoutes></ProtectedRoute>
            },
            {
                path: "admin/success-stories",
                element: <ProtectedRoute><AdminRoutes><AdminSuccessStories /></AdminRoutes></ProtectedRoute>
            },
            {
                path: "requests",
                element: <ProtectedRoute><MyRequests /></ProtectedRoute>
            },
        ]
    },
]);