import axios from "axios";

const axiosPublic = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://server-gold-nu.vercel.app"
});

const UseAxiosPublic = () => {
    return axiosPublic
}
export default UseAxiosPublic;