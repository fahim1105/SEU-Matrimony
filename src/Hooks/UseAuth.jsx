import { useContext } from 'react'; // Change 'use' to 'useContext'
import { AuthContext } from '../Context/AuthContext';

const UseAuth = () => {
    const authInfo = useContext(AuthContext); // Use useContext
    return authInfo;
};

export default UseAuth;