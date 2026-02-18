import React from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const LoveLoader = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-base-100 rounded-3xl">
            {/* Premium Heart Section */}
            <div className="relative flex items-center justify-center">

                {/* Outer Glowing Rings */}
                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0.1, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute w-32 h-32 bg-error/20 rounded-full blur-xl"
                />

                {/* Main Animated Heart */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="relative z-10"
                >
                    <Heart
                        size={80}
                        className="text-error fill-error drop-shadow-[0_0_15px_rgba(255,0,0,0.6)]"
                    />
                </motion.div>
            </div>

            {/* Premium Loading Text */}
            <div className="mt-10 flex flex-col items-center gap-3">
                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                    className="text-2xl font-light tracking-[0.3em] uppercase text-base-content/70"
                >
                    Loading
                </motion.h2>

                {/* daisyUI Progress Bar (Premium Look) */}
                <progress className="progress progress-error w-56"></progress>
            </div>
        </div>
    );
};

export default LoveLoader;