import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage'; // Import useLocalStorage
import { Users, UserPlus, BookOpen, BarChart3, PlusCircle, Trash2 } from 'lucide-react'; // Added Trash2
import StudentRegistration from './StudentRegistration';
import StudentList from './StudentList';
import GradeManagement from './GradeManagement';
import AssignSubject from './AssignSubject'; // New component
import RemoveSubject from './RemoveSubject'; // New component

const TeacherDashboard = () => {
    const { user } = useAuth();
    const [allStudents, setAllStudents] = useLocalStorage('edugrade_students', []); // Use useLocalStorage
    const [activeTab, setActiveTab] = useState('overview');

    // Filter students belonging to this teacher (simulated)
    const myStudents = allStudents.filter(student => student.teacherId === user.id);

    // Function to refresh student list after registration/assignment/removal
    const refreshStudents = () => {
        // In localStorage version, simply re-fetch from localStorage
        setAllStudents(JSON.parse(localStorage.getItem('edugrade_students') || '[]'));
    };

    const tabs = [
        { id: 'overview', label: 'Resumen', icon: BarChart3 },
        { id: 'students', label: 'Estudiantes', icon: Users },
        { id: 'register', label: 'Registrar', icon: UserPlus },
        { id: 'assignSubject', label: 'Asignar Materia', icon: PlusCircle },
        { id: 'removeSubject', label: 'Eliminar Materia', icon: Trash2 }, // New tab
        { id: 'grades', label: 'Calificaciones', icon: BookOpen }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">{myStudents.length}</h3>
                                    <p className="text-gray-600">Estudiantes Registrados</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 rounded-xl">
                                    <BookOpen className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">N/A</h3> {/* Subject is now per student */}
                                    <p className="text-gray-600">Materia Principal</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 rounded-xl">
                                    <BarChart3 className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {/* This would require iterating through all student subjects and grades */}
                                        0
                                    </h3>
                                    <p className="text-gray-600">Con Calificaciones</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 'students':
                return <StudentList students={myStudents} />;
            case 'register':
                return <StudentRegistration onStudentAdded={refreshStudents} />;
            case 'assignSubject':
                return <AssignSubject students={myStudents} onSubjectAssigned={refreshStudents} />;
            case 'removeSubject':
                return <RemoveSubject students={myStudents} onSubjectRemoved={refreshStudents} />; // New component
            case 'grades':
                return <GradeManagement students={myStudents} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8">
            <motion.div 
                className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-xl"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Bienvenido, {user.name}
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Panel de Control
                        </p>
                    </div>
                    
                    <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
                        {tabs.map((tab, index) => {
                            const Icon = tab.icon;
                            return (
                                <motion.button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                                        activeTab === tab.id
                                            ? 'bg-white text-gray-900 shadow-md'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                    }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:block">{tab.label}</span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </motion.div>

            {renderTabContent()}
        </div>
    );
};

export default TeacherDashboard;