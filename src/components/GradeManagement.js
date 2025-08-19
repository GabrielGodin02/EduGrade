import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Save } from 'lucide-react';
import { calculateAverage, calculateFinalGrade, getGradeStatus } from '../utils/gradeCalculations';
import { useLocalStorage } from '../hooks/useLocalStorage'; // Import useLocalStorage

const GradeManagement = ({ students = [] }) => {
    const [allStudents, setAllStudents] = useLocalStorage('edugrade_students', []); // Use useLocalStorage
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedSubjectName, setSelectedSubjectName] = useState(''); // Changed to name
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [grades, setGrades] = useState({
        tasks: ['', '', '', ''],
        exams: ['', '', ''],
        presentations: ['', '', '']
    });
    const [success, setSuccess] = useState('');
    const [loadingGrades, setLoadingGrades] = useState(false);
    const [error, setError] = useState('');

    const currentStudent = allStudents.find(s => s.id === selectedStudentId);
    const currentSubjectData = currentStudent?.subjects?.find(sub => sub.name === selectedSubjectName);
    const currentYearData = currentSubjectData?.years?.[selectedYear];
    const currentPeriodData = currentYearData?.[selectedPeriod];

    // Effect to load grades when selections change
    useEffect(() => {
        if (currentPeriodData) {
            setGrades({
                tasks: currentPeriodData.tasks || ['', '', '', ''],
                exams: currentPeriodData.exams || ['', '', ''],
                presentations: currentPeriodData.presentations || ['', '', '']
            });
        } else {
            setGrades({
                tasks: ['', '', '', ''],
                exams: ['', '', ''],
                presentations: ['', '', '']
            });
        }
        setError('');
        setSuccess('');
    }, [selectedStudentId, selectedSubjectName, selectedYear, selectedPeriod, currentPeriodData]);

    const handleStudentSelect = (id) => {
        setSelectedStudentId(id);
        setSelectedSubjectName('');
        setSelectedYear('');
        setSelectedPeriod('');
    };

    const handleSubjectSelect = (name) => {
        setSelectedSubjectName(name);
        setSelectedYear('');
        setSelectedPeriod('');
    };

    const handleYearSelect = (year) => {
        setSelectedYear(year);
        setSelectedPeriod('');
    };

    const handlePeriodSelect = (period) => {
        setSelectedPeriod(period);
    };

    const handleGradeChange = (category, index, value) => {
        if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 10)) {
            setGrades(prev => ({
                ...prev,
                [category]: prev[category].map((grade, i) => i === index ? value : grade)
            }));
        }
    };

    const handleSave = () => {
        if (!selectedStudentId || !selectedSubjectName || !selectedYear || !selectedPeriod) {
            setError('Por favor, selecciona estudiante, materia, año y período.');
            return;
        }
        setLoadingGrades(true);
        setError('');
        setSuccess('');

        // Simulate saving to localStorage
        setTimeout(() => {
            const updatedStudents = allStudents.map(student => {
                if (student.id === selectedStudentId) {
                    const updatedSubjects = student.subjects.map(sub => {
                        if (sub.name === selectedSubjectName) {
                            // Ensure years and periods objects exist
                            const updatedYears = { ...sub.years };
                            if (!updatedYears[selectedYear]) {
                                updatedYears[selectedYear] = {};
                            }
                            updatedYears[selectedYear][selectedPeriod] = grades;
                            return { ...sub, years: updatedYears };
                        }
                        return sub;
                    });
                    return { ...student, subjects: updatedSubjects };
                }
                return student;
            });

            setAllStudents(updatedStudents); // Update localStorage
            setSuccess('Calificaciones guardadas exitosamente');
            setLoadingGrades(false);
        }, 500); // Simulate network delay
    };

    const taskAvg = calculateAverage(grades.tasks);
    const examAvg = calculateAverage(grades.exams);
    const presentationAvg = calculateAverage(grades.presentations);
    const finalGrade = calculateFinalGrade(taskAvg, examAvg, presentationAvg);
    const gradeStatus = getGradeStatus(finalGrade);

    if (students.length === 0) {
        return (
            <motion.div 
                className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-12 text-center shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No hay estudiantes para calificar</h3>
                <p className="text-gray-500">Registra estudiantes primero para poder gestionar sus calificaciones</p>
            </motion.div>
        );
    }

    // Determine available years and periods based on existing data for the selected subject
    const currentStudentSubjects = currentStudent?.subjects || [];
    const selectedSubjectObj = currentStudentSubjects.find(s => s.name === selectedSubjectName);
    
    const availableYears = selectedSubjectObj 
        ? [...new Set(Object.keys(selectedSubjectObj.years || {}))].sort((a, b) => b - a) 
        : [];
    
    // Add current year if not present
    const currentYear = new Date().getFullYear().toString();
    if (!availableYears.includes(currentYear)) {
        availableYears.unshift(currentYear);
    }

    const availablePeriods = ['Periodo 1', 'Periodo 2', 'Periodo 3', 'Periodo 4']; // Added Period 4

    return (
        <motion.div 
            className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl">
                    <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestión de Calificaciones</h2>
                    <p className="text-gray-600">Administra las notas de tus estudiantes</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estudiante</label>
                    <select
                        value={selectedStudentId}
                        onChange={(e) => handleStudentSelect(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                    >
                        <option value="">Selecciona un estudiante...</option>
                        {students.map(student => (
                            <option key={student.id} value={student.id}>
                                {student.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Materia</label>
                    <select
                        value={selectedSubjectName}
                        onChange={(e) => handleSubjectSelect(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                        disabled={!selectedStudentId || !currentStudent?.subjects?.length}
                    >
                        <option value="">Selecciona una materia...</option>
                        {currentStudent?.subjects?.map(subject => (
                            <option key={subject.name} value={subject.name}>
                                {subject.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => handleYearSelect(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                        disabled={!selectedSubjectName}
                    >
                        <option value="">Selecciona un año...</option>
                        {availableYears.map(year => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
                    <select
                        value={selectedPeriod}
                        onChange={(e) => handlePeriodSelect(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                        disabled={!selectedYear}
                    >
                        <option value="">Selecciona un período...</option>
                        {availablePeriods.map(period => (
                            <option key={period} value={period}>
                                {period}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loadingGrades ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : selectedPeriod ? (
                <motion.div 
                    className="space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Tareas */}
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">Tareas (40%)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {grades.tasks.map((grade, index) => (
                                <div key={index}>
                                    <label className="block text-sm font-medium text-blue-700 mb-2">
                                        Tarea {index + 1}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                        value={grade}
                                        onChange={(e) => handleGradeChange('tasks', index, e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                        placeholder="0.0"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-between bg-blue-100 rounded-lg p-3">
                            <span className="font-medium text-blue-900">Promedio Tareas:</span>
                            <span className="text-xl font-bold text-blue-900">{taskAvg}</span>
                        </div>
                    </div>

                    {/* Evaluaciones */}
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-green-900 mb-4">Evaluaciones (40%)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {grades.exams.map((grade, index) => (
                                <div key={index}>
                                    <label className="block text-sm font-medium text-green-700 mb-2">
                                        Evaluación {index + 1}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                        value={grade}
                                        onChange={(e) => handleGradeChange('exams', index, e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                                        placeholder="0.0"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-between bg-green-100 rounded-lg p-3">
                            <span className="font-medium text-green-900">Promedio Evaluaciones:</span>
                            <span className="text-xl font-bold text-green-900">{examAvg}</span>
                        </div>
                    </div>

                    {/* Exposiciones */}
                    <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-purple-900 mb-4">Exposiciones (20%)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {grades.presentations.map((grade, index) => (
                                <div key={index}>
                                    <label className="block text-sm font-medium text-purple-700 mb-2">
                                        Exposición {index + 1}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                        value={grade}
                                        onChange={(e) => handleGradeChange('presentations', index, e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                                        placeholder="0.0"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-between bg-purple-100 rounded-lg p-3">
                            <span className="font-medium text-purple-900">Promedio Exposiciones:</span>
                            <span className="text-xl font-bold text-purple-900">{presentationAvg}</span>
                        </div>
                    </div>

                    {/* Nota Final */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Nota Final</h3>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${gradeStatus.bg} ${gradeStatus.color}`}>
                                    {gradeStatus.status}
                                </span>
                                <span className="text-3xl font-bold text-gray-900">{finalGrade}</span>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600">
                            Cálculo: Tareas (40%) + Evaluaciones (40%) + Exposiciones (20%)
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <motion.button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loadingGrades}
                        >
                            {loadingGrades ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span className="ml-2">Guardando...</span>
                                </div>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Guardar Calificaciones
                                </>
                            )}
                        </motion.button>
                    </div>

                    {error && (
                        <motion.div 
                            className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {error}
                        </motion.div>
                    )}

                    {success && (
                        <motion.div 
                            className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-600"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {success}
                        </motion.div>
                    )}
                </motion.div>
            ) : (
                <div className="p-8 text-center text-gray-500">
                    Selecciona un estudiante, materia, año y período para gestionar las calificaciones.
                </div>
            )}
        </motion.div>
    );
};

export default GradeManagement;