import React from 'react';
import { Link } from 'react-router';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Heart } from 'lucide-react';
import FooterIMG from '../../assets/Southeast_University_Logo.png'

const Footer = () => {
    return (
        <footer className="bg-base-200 border-t border-base-300 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Brand Section */}
                    <div className="space-y-4">
                        <Link to="/" className="text-2xl font-black tracking-tight text-primary flex items-center gap-2">
                            <div className="bg-primary p-1.5 rounded-lg">
                                <img src={FooterIMG} className='w-8 h-8' alt="" />
                            </div>
                            <span className="text-xl font-black tracking-tighter text-neutral italic">
                                SEU <span className="text-primary">Matrimony</span>
                            </span>                        </Link>
                        <p className="text-base-content/70 leading-relaxed">
                            The most trusted and exclusive matchmaking platform for the students and alumni of Southeast University. Build your future with someone who shares your roots.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="btn btn-ghost btn-sm btn-circle hover:bg-primary hover:text-white transition-all">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="btn btn-ghost btn-sm btn-circle hover:bg-primary hover:text-white transition-all">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="btn btn-ghost btn-sm btn-circle hover:bg-primary hover:text-white transition-all">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-lg mb-6 text-neutral">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><Link to="/success" className="link link-hover text-base-content/70 hover:text-primary">Success Stories</Link></li>
                            <li><Link to="/guidelines" className="link link-hover text-base-content/70 hover:text-primary">Safety Guidelines</Link></li>
                            <li><Link to="/register" className="link link-hover text-base-content/70 hover:text-primary">Create Profile</Link></li>
                            <li><Link to="/login" className="link link-hover text-base-content/70 hover:text-primary">Member Login</Link></li>
                        </ul>
                    </div>

                    {/* Support & Legal */}
                    <div>
                        <h3 className="font-bold text-lg mb-6 text-neutral">Legal & Support</h3>
                        <ul className="space-y-3">
                            <li><Link to="/privacy" className="link link-hover text-base-content/70 hover:text-primary">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="link link-hover text-base-content/70 hover:text-primary">Terms of Service</Link></li>
                            <li><Link to="/support" className="link link-hover text-base-content/70 hover:text-primary">Help Center</Link></li>
                            <li><Link to="/report" className="link link-hover text-base-content/70 hover:text-primary">Report a Profile</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-bold text-lg mb-6 text-neutral">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-base-content/70">
                                <MapPin size={20} className="text-primary mt-1" />
                                <span>251/A and 252, Tejgaon Industrial Area, Dhaka-1208</span>
                            </li>
                            <li className="flex items-center gap-3 text-base-content/70">
                                <Phone size={20} className="text-primary" />
                                <span>+880 1234-567890</span>
                            </li>
                            <li className="flex items-center gap-3 text-base-content/70">
                                <Mail size={20} className="text-primary" />
                                <span>support@seu.edu.bd</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-base-300 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-base-content/60">
                    <p>© 2026 SEU MATRIMONY. All rights reserved.</p>
                    <p className="flex items-center gap-1">
                        Made with <Heart size={14} className="text-red-500 fill-red-500" /> by SEU Developers
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;