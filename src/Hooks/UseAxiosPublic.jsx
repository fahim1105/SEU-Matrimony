import axios from "axios";

const axiosPublic = axios.create({
    baseURL: import.meta.env.VITE_BackendURL
});

const UseAxiosPublic = () => {
    return axiosPublic
}
export default UseAxiosPublic;