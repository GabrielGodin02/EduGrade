import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage'; // Import useLocalStorage
import { BookOpen, BarChart3, Award, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { calculateAverage, calculateFinalGrade, getGradeStatus } from '../utils/gradeCalculations';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [students] = useLocalStorage('edugrade_students', []); // Use useLocalStorage
    const [teachers] = useLocalStorage('edugrade_teachers', []); // Use useLocalStorage
    const [expandedSubject, setExpandedSubject] = useState(null);
    const [expandedYear, setExpandedYear] = useState(null);

    const studentData = students.find(s => s.id === user.id);
    const teacher = teachers.find(t => t.id === studentData?.teacherId); // Find teacher by ID

    // Ensure studentSubjects is always an array
    const studentSubjects = studentData?.subjects || [];

    const toggleSubject = (subjectName) => {
        setExpandedSubject(expandedSubject === subjectName ? null : subjectName);
        setExpandedYear(null); // Colapsar años al cambiar de materia
    };

    const toggleYear = (year) => {
        setExpandedYear(expandedYear === year ? null : year);
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
                            Hola, {user.name}
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Bienvenido a tu panel de notas
                        </p>
                    </div>
                </div>
            </motion.div>

            {studentSubjects.length === 0 ? (
                <motion.div 
                    className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-12 text-center shadow-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-12 h-12 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Aún no tienes materias asignadas</h3>
                    <p className="text-gray-500">Tu profesor debe asignarte materias para que puedas ver tus notas aquí.</p>
                </motion.div>
            ) : (
                <motion.div 
                    className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Mis Materias y Notas</h2>
                    
                    <div className="space-y-4">
                        {studentSubjects.map((subject) => (
                            <motion.div 
                                key={subject.name} // Use subject.name as key for localStorage version
                                className="border border-gray-200 rounded-2xl overflow-hidden"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <button 
                                    onClick={() => toggleSubject(subject.name)}
                                    className="flex items-center justify-between w-full p-5 bg-gray-50 hover:bg-gray-100 transition-colors duration-300"
                                >
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="w-6 h-6 text-blue-600" />
                                        <span className="text-lg font-semibold text-gray-900">{subject.name}</span>
                                    </div>
                                    {expandedSubject === subject.name ? (
                                        <ChevronUp className="w-5 h-5 text-gray-600" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-600" />
                                    )}
                                </button>

                                <AnimatePresence>
                                    {expandedSubject === subject.name && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="p-5 bg-white border-t border-gray-200"
                                        >
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Años Disponibles:</h3>
                                            <div className="space-y-3">
                                                {Object.keys(subject.years || {}).length === 0 ? ( // Check if years exist
                                                    <p className="text-gray-500">No hay años registrados para esta materia.</p>
                                                ) : (
                                                    Object.keys(subject.years).map((year) => (
                                                        <motion.div 
                                                            key={year}
                                                            className="border border-gray-100 rounded-xl overflow-hidden"
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                        >
                                                            <button 
                                                                onClick={() => toggleYear(year)}
                                                                className="flex items-center justify-between w-full p-4 bg-blue-50 hover:bg-blue-100 transition-colors duration-300"
                                                            >
                                                                <span className="font-medium text-blue-800">Año {year}</span>
                                                                {expandedYear === year ? (
                                                                    <ChevronUp className="w-4 h-4 text-blue-600" />
                                                                ) : (
                                                                    <ChevronDown className="w-4 h-4 text-blue-600" />
                                                                )}
                                                            </button>

                                                            <AnimatePresence>
                                                                {expandedYear === year && (
                                                                    <motion.div
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: 'auto', opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        transition={{ duration: 0.3 }}
                                                                        className="p-4 bg-white border-t border-gray-100"
                                                                    >
                                                                        <h4 className="text-md font-semibold text-gray-700 mb-3">Períodos:</h4>
                                                                        <div className="space-y-3">
                                                                            {Object.keys(subject.years[year] || {}).length === 0 ? ( // Check if periods exist
                                                                                <p className="text-gray-500 text-sm">No hay períodos registrados para este año.</p>
                                                                            ) : (
                                                                                Object.keys(subject.years[year]).map((period) => {
                                                                                    const grades = subject.years[year][period];
                                                                                    const taskAvg = calculateAverage(grades.tasks);
                                                                                    const examAvg = calculateAverage(grades.exams);
                                                                                    const presentationAvg = calculateAverage(grades.presentations);
                                                                                    const finalGrade = calculateFinalGrade(taskAvg, examAvg, presentationAvg);
                                                                                    const gradeStatus = getGradeStatus(finalGrade);

                                                                                    return (
                                                                                        <div key={period} className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                                                                                            <div className="flex items-center justify-between mb-3">
                                                                                                <h5 className="font-semibold text-gray-800">{period}</h5>
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${gradeStatus.bg} ${gradeStatus.color}`}>
                                                                                                        {gradeStatus.status}
                                                                                                    </span>
                                                                                                    <span className="text-xl font-bold text-gray-900">{finalGrade}</span>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="overflow-x-auto">
                                                                                                <table className="w-full text-sm">
                                                                                                    <thead>
                                                                                                        <tr className="border-b border-gray-200">
                                                                                                            <th className="text-left py-2 px-2 font-medium text-gray-600">Categoría</th>
                                                                                                            <th className="text-center py-2 px-2 font-medium text-gray-600">N1</th>
                                                                                                            <th className="text-center py-2 px-2 font-medium text-gray-600">N2</th>
                                                                                                            <th className="text-center py-2 px-2 font-medium text-gray-600">N3</th>
                                                                                                            <th className="text-center py-2 px-2 font-medium text-gray-600">N4</th>
                                                                                                            <th className="text-center py-2 px-2 font-medium text-gray-600">Prom.</th>
                                                                                                        </tr>
                                                                                                    </thead>
                                                                                                    <tbody>
                                                                                                        <tr>
                                                                                                            <td className="py-2 px-2">Tareas</td>
                                                                                                            <td className="text-center py-2 px-2">{grades.tasks[0] || '-'}</td>
                                                                                                            <td className="text-center py-2 px-2">{grades.tasks[1] || '-'}</td>
                                                                                                            <td className="text-center py-2 px-2">{grades.tasks[2] || '-'}</td>
                                                                                                            <td className="text-center py-2 px-2">{grades.tasks[3] || '-'}</td>
                                                                                                            <td className="text-center py-2 px-2 font-semibold">{taskAvg}</td>
                                                                                                        </tr>
                                                                                                        <tr>
                                                                                                            <td className="py-2 px-2">Evaluaciones</td>
                                                                                                            <td className="text-center py-2 px-2">{grades.exams[0] || '-'}</td>
                                                                                                            <td className="text-center py-2 px-2">{grades.exams[1] || '-'}</td>
                                                                                                            <td className="text-center py-2 px-2">{grades.exams[2] || '-'}</td>
                                                                                                            <td className="text-center py-2 px-2">-</td>
                                                                                                            <td className="text-center py-2 px-2 font-semibold">{examAvg}</td>
                                                                                                        </tr>
                                                                                                        <tr>
                                                                                                            <td className="py-2 px-2">Exposiciones</td>
                                                                                                            <td className="text-center py-2 px-2">{grades.presentations[0] || '-'}</td>
                                                                                                            <td className="text-center py-2 px-2">{grades.presentations[1] || '-'}</td>
                                                                                                            <td className="text-center py-2 px-2">{grades.presentations[2] || '-'}</td>
                                                                                                            <td className="text-center py-2 px-2">-</td>
                                                                                                            <td className="text-center py-2 px-2 font-semibold">{presentationAvg}</td>
                                                                                                        </tr>
                                                                                                    </tbody>
                                                                                                </table>
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                })
                                                                            )}
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </motion.div>
                                                    ))
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default StudentDashboard;