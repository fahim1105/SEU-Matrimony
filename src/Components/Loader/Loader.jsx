import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-base-100 z-50">
            {/* Background Soft Glow */}
            <div className="absolute w-64 h-64 bg-rose-100 rounded-full blur-[100px] opacity-60 animate-pulse" />

            <div className="relative">
                {/* Main Heart Animation - Two halves joining */}
                <div className="flex items-center justify-center relative h-40 w-40">

                    {/* Left Half Heart */}
                    <motion.div
                        initial={{ x: -50, opacity: 0, rotate: -20 }}
                        animate={{ x: 0, opacity: 1, rotate: 0 }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "circOut"
                        }}
                        className="text-rose-500 drop-shadow-2xl"
                    >
                        <svg width="80" height="120" viewBox="0 0 120 200">
                            <path
                                fill="currentColor"
                                d="M120,180 C120,180 20,140 20,80 C20,30 70,20 100,50 C110,60 120,80 120,80"
                            />
                        </svg>
                    </motion.div>

                    {/* Right Half Heart */}
                    <motion.div
                        initial={{ x: 50, opacity: 0, rotate: 20 }}
                        animate={{ x: 0, opacity: 1, rotate: 0 }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "circOut"
                        }}
                        className="text-green-600 drop-shadow-2xl -ml-[4px]" // SEU Green Touch
                    >
                        <svg width="80" height="120" viewBox="0 0 120 200">
                            <path
                                fill="currentColor"
                                d="M0,80 C0,80 10,60 20,50 C50,20 100,30 100,80 C100,140 0,180 0,180"
                            />
                        </svg>
                    </motion.div>

                    {/* Golden Ring Orbit */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-[1.5px] border-amber-300/40 rounded-full scale-150"
                    />
                </div>

                {/* Floating Sparkles */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-amber-400 rounded-full"
                        style={{
                            width: Math.random() * 6 + 2,
                            height: Math.random() * 6 + 2,
                            top: '50%',
                            left: '50%'
                        }}
                        animate={{
                            x: [0, (i % 2 === 0 ? 80 : -80) * Math.random()],
                            y: [0, (i % 2 === 0 ? -80 : 80) * Math.random()],
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3
                        }}
                    />
                ))}
            </div>

            {/* Luxury Typography */}
            <div className="mt-12 text-center overflow-hidden">
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-2xl font-serif font-light tracking-[0.2em] text-gray-800"
                >
                    SOUTHEAST <span className="text-rose-500 font-semibold">UNIVERSITY</span>
                </motion.h1>

                <motion.div
                    className="flex items-center justify-center gap-2 mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="h-[1px] w-8 bg-amber-300" />
                    <span className="text-[10px] uppercase tracking-[0.5em] text-amber-600 font-medium">
                        Matrimony
                    </span>
                    <div className="h-[1px] w-8 bg-amber-300" />
                </motion.div>
            </div>

            {/* Elegant Progress Indicator */}
            <div className="absolute bottom-12 w-40 h-[2px] bg-gray-100 overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-green-600 via-rose-500 to-amber-500"
                    animate={{ x: [-160, 160] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
        </div>
    );
};

export default Loader;