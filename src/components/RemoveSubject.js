import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Book, User, Trash2, AlertTriangle } from 'lucide-react';

const RemoveSubject = ({ students = [], onSubjectRemoved }) => {
    const [allStudents, setAllStudents] = useLocalStorage('edugrade_students', []);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedSubjectName, setSelectedSubjectName] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleStudentSelect = (e) => {
        setSelectedStudentId(e.target.value);
        setSelectedSubjectName('');
        setError('');
        setSuccess('');
    };

    const handleSubjectSelect = (e) => {
        setSelectedSubjectName(e.target.value);
        setError('');
        setSuccess('');
    };

    const handleRemoveSubject = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!selectedStudentId || !selectedSubjectName) {
            setError('Por favor, selecciona un estudiante y una materia para eliminar.');
            setLoading(false);
            return;
        }

        const studentToUpdate = allStudents.find(s => s.id === selectedStudentId);

        if (!studentToUpdate) {
            setError('Estudiante no encontrado.');
            setLoading(false);
            return;
        }

        // Simulate network delay
        setTimeout(() => {
            const updatedStudents = allStudents.map(student => {
                if (student.id === selectedStudentId) {
                    return {
                        ...student,
                        subjects: student.subjects.filter(sub => sub.name !== selectedSubjectName)
                    };
                }
                return student;
            });

            setAllStudents(updatedStudents); // Update localStorage
            setSuccess(`Materia "${selectedSubjectName}" eliminada exitosamente de ${studentToUpdate.name}.`);
            setSelectedStudentId('');
            setSelectedSubjectName('');
            setLoading(false);

            if (onSubjectRemoved) {
                onSubjectRemoved(); // Refresh student list in parent
            }
        }, 500); // Simulate network delay
    };

    const currentStudentSubjects = selectedStudentId 
        ? allStudents.find(s => s.id === selectedStudentId)?.subjects || []
        : [];

    return (
        <motion.div 
            className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl">
                    <Trash2 className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Eliminar Materia de Estudiante</h2>
                    <p className="text-gray-600">Remueve una materia de un estudiante existente</p>
                </div>
            </div>

            <form onSubmit={handleRemoveSubject} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seleccionar Estudiante
                    </label>
                    <select
                        value={selectedStudentId}
                        onChange={handleStudentSelect}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Materia a Eliminar
                    </label>
                    <select
                        value={selectedSubjectName}
                        onChange={handleSubjectSelect}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                        disabled={!selectedStudentId || currentStudentSubjects.length === 0}
                    >
                        <option value="">Selecciona una materia...</option>
                        {currentStudentSubjects.map(subject => (
                            <option key={subject.name} value={subject.name}>
                                {subject.name}
                            </option>
                        ))}
                    </select>
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

                <motion.button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading || !selectedStudentId || !selectedSubjectName}
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span className="ml-2">Eliminando...</span>
                        </div>
                    ) : (
                        <>
                            <Trash2 className="w-5 h-5" />
                            Eliminar Materia
                        </>
                    )}
                </motion.button>
            </form>
        </motion.div>
    );
};

export default RemoveSubject;