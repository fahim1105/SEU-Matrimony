import React from 'react';
import { Link } from 'react-router';

const FindMatchCTA = () => (
    <section className="py-28 text-center bg-base-100 relative overflow-hidden">
        <div className="container mx-auto px-4 space-y-10">
            {/* User Avatars Group */}
            <div className="avatar-group justify-center -space-x-6">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="avatar border-white ring ring-primary ring-offset-base-100 ring-offset-2">
                        <div className="w-16">
                            <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="user" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-black italic">Ready to Find Your <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Perfect Match?</span></h2>
                <p className="text-xl text-base-content/60 max-w-2xl mx-auto">Join the most trusted platform for SEUians. Your soulmate is just a few clicks away.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/auth/register" className="btn btn-primary btn-lg rounded-full px-12 shadow-xl shadow-primary/20">Get Started Today</Link>
            </div>
        </div>
    </section>
);

export default FindMatchCTA;