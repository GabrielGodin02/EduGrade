import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LogOut, GraduationCap, User, BookOpen } from 'lucide-react';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <motion.header 
                className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <motion.div 
                                className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl"
                                whileHover={{ scale: 1.05 }}
                            >
                                <GraduationCap className="w-8 h-8 text-white" />
                            </motion.div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                    EduGrade
                                </h1>
                                <p className="text-sm text-gray-500">Sistema de Gestión Académica</p>
                            </div>
                        </div>

                        {user && (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
                                    {user.role === 'teacher' ? (
                                        <BookOpen className="w-5 h-5 text-blue-600" />
                                    ) : (
                                        <User className="w-5 h-5 text-green-600" />
                                    )}
                                    <span className="font-medium text-gray-700">
                                        {user.name} ({user.role === 'teacher' ? 'Profesor' : 'Estudiante'})
                                    </span>
                                </div>
                                <motion.button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <LogOut className="w-5 h-5" />
                                </motion.button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.header>

            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;