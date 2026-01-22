import React from 'react';

import { Navigate, useLocation } from 'react-router';
import UseAuth from '../Hooks/UseAuth';
import Loader from '../Components/Loader/Loader';

const PrivetRoutes = ({ children }) => {
    const { user, loading } = UseAuth();
    const location = useLocation()
    // console.log(location)

    if (loading) {
        return <Loader />;
    }

    if (!user) {
        return <Navigate state={location.pathname} to="/auth/login" replace />;
    }

    return children;
};

export default PrivetRoutes;
