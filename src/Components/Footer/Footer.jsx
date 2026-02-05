import React from 'react';
import { Link } from 'react-router';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FooterIMG from '../../assets/Southeast_University_Logo.png'

const Footer = () => {
    const { t } = useTranslation();
    
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
                            </span>
                        </Link>
                        <p className="text-base-content/70 leading-relaxed">
                            {t('footer.brandDescription')}
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
                        <h3 className="font-bold text-lg mb-6 text-neutral">{t('footer.quickLinks')}</h3>
                        <ul className="space-y-3">
                            <li><Link to="/success" className="link link-hover text-base-content/70 hover:text-primary">{t('nav.stories')}</Link></li>
                            <li><Link to="/guidelines" className="link link-hover text-base-content/70 hover:text-primary">{t('nav.guidelines')}</Link></li>
                            <li><Link to="/register" className="link link-hover text-base-content/70 hover:text-primary">{t('footer.createProfile')}</Link></li>
                            <li><Link to="/login" className="link link-hover text-base-content/70 hover:text-primary">{t('footer.memberLogin')}</Link></li>
                        </ul>
                    </div>

                    {/* Support & Legal */}
                    <div>
                        <h3 className="font-bold text-lg mb-6 text-neutral">{t('footer.legalSupport')}</h3>
                        <ul className="space-y-3">
                            <li><Link to="/privacy" className="link link-hover text-base-content/70 hover:text-primary">{t('footer.privacyPolicy')}</Link></li>
                            <li><Link to="/terms" className="link link-hover text-base-content/70 hover:text-primary">{t('footer.termsOfService')}</Link></li>
                            <li><Link to="/support" className="link link-hover text-base-content/70 hover:text-primary">{t('footer.helpCenter')}</Link></li>
                            <li><Link to="/report" className="link link-hover text-base-content/70 hover:text-primary">{t('footer.reportProfile')}</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-bold text-lg mb-6 text-neutral">{t('footer.contactUs')}</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-base-content/70">
                                <MapPin size={20} className="text-primary mt-1" />
                                <span>{t('footer.address')}</span>
                            </li>
                            <li className="flex items-center gap-3 text-base-content/70">
                                <Phone size={20} className="text-primary" />
                                <span>{t('footer.phone')}</span>
                            </li>
                            <li className="flex items-center gap-3 text-base-content/70">
                                <Mail size={20} className="text-primary" />
                                <span>{t('footer.email')}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-base-300 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-base-content/60">
                    <p>{t('footer.copyright')}</p>
                    <p className="flex items-center gap-1">
                        {t('footer.madeWithLove').split('love')[0]}
                        <Heart size={14} className="text-red-500 fill-red-500" />
                        {t('footer.madeWithLove').split('love')[1]}
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;