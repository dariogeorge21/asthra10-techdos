"use client";

import React from 'react';
import { FaTrophy } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function EndPage() {
    const teamMembers = [
        'Dario George', 'Tippu Sahib', 'Joshna Jojo', 'Angelina Binoy',
        'Annlia Jose', 'Gokul Shaji', 'Selin Emla', 'Daiji Kuriakose',
        'Aibin Babu', 'Stivance K'
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-4xl mx-auto"
            >
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold text-indigo-600 mb-4">
                        Greetings from TechDOS!!
                    </h1>
                    <FaTrophy className="text-yellow-400 text-6xl mx-auto mb-6" />
                    <p className="text-xl text-gray-700 mb-8">
                        Congratulations on completing the TechDOS challenge! Your journey through
                        the technical landscape has been remarkable.
                    </p>
                </div>

                {/* Team Credits Section */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
                        Meet the Development Team
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {teamMembers.map((member, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg 
                                                    text-center shadow-sm hover:shadow-md transition-shadow"
                            >
                                <p className="text-gray-700 font-medium">{member}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="text-center">
                    <Link href="/">
                        <button
                            className="bg-indigo-600 text-white px-8 py-3 rounded-full 
                                                 hover:bg-indigo-700 transition-colors duration-300
                                                 shadow-lg hover:shadow-xl"
                            aria-label="Return to home page"
                        >
                            Return to Home
                        </button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}