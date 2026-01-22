import React from 'react';
import { Outlet } from 'react-router';
import Navbar from '../Components/Navbar/Navbar';
import Footer from '../Components/Footer/Footer';


const RootLayout = () => {
    return (
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
        </div>
    );
};

export default RootLayout;