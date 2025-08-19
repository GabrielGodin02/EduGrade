import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Book, User, PlusCircle, Save } from 'lucide-react';

const AssignSubject = ({ students = [], onSubjectAssigned }) => {
    const [allStudents, setAllStudents] = useLocalStorage('edugrade_students', []);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [newSubjectName, setNewSubjectName] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleStudentSelect = (e) => {
        setSelectedStudentId(e.target.value);
        setNewSubjectName('');
        setError('');
        setSuccess('');
    };

    const handleSubjectNameChange = (e) => {
        setNewSubjectName(e.target.value);
        setError('');
        setSuccess('');
    };

    const handleAssignSubject = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!selectedStudentId || !newSubjectName.trim()) {
            setError('Por favor, selecciona un estudiante y escribe el nombre de la materia.');
            setLoading(false);
            return;
        }

        const studentToUpdate = allStudents.find(s => s.id === selectedStudentId);

        if (!studentToUpdate) {
            setError('Estudiante no encontrado.');
            setLoading(false);
            return;
        }

        // Check if subject already exists for this student
        if (studentToUpdate.subjects.some(sub => sub.name === newSubjectName.trim())) {
            setError(`La materia "${newSubjectName.trim()}" ya está asignada a este estudiante.`);
            setLoading(false);
            return;
        }

        // Simulate network delay
        setTimeout(() => {
            const updatedStudents = allStudents.map(student => {
                if (student.id === selectedStudentId) {
                    const newSubject = {
                        name: newSubjectName.trim(),
                        years: {
                            [new Date().getFullYear()]: { // Current year by default
                                'Periodo 1': { tasks: ['', '', '', ''], exams: ['', '', ''], presentations: ['', '', ''] },
                                'Periodo 2': { tasks: ['', '', '', ''], exams: ['', '', ''], presentations: ['', '', ''] },
                                'Periodo 3': { tasks: ['', '', '', ''], exams: ['', '', ''], presentations: ['', '', ''] }
                            }
                        }
                    };
                    return {
                        ...student,
                        subjects: [...student.subjects, newSubject]
                    };
                }
                return student;
            });

            setAllStudents(updatedStudents); // Update localStorage
            setSuccess(`Materia "${newSubjectName.trim()}" asignada exitosamente a ${studentToUpdate.name}.`);
            setSelectedStudentId('');
            setNewSubjectName('');
            setLoading(false);

            if (onSubjectAssigned) {
                onSubjectAssigned(); // Refresh student list in parent
            }
        }, 500); // Simulate network delay
    };

    return (
        <motion.div 
            className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl">
                    <PlusCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Asignar Materia a Estudiante</h2>
                    <p className="text-gray-600">Agrega una nueva materia a un estudiante existente</p>
                </div>
            </div>

            <form onSubmit={handleAssignSubject} className="space-y-6">
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
                        Nombre de la Nueva Materia
                    </label>
                    <input
                        type="text"
                        value={newSubjectName}
                        onChange={handleSubjectNameChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                        placeholder="Ej: Historia, Química"
                        disabled={!selectedStudentId}
                    />
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
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading || !selectedStudentId || !newSubjectName.trim()}
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span className="ml-2">Asignando...</span>
                        </div>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Asignar Materia
                        </>
                    )}
                </motion.button>
            </form>
        </motion.div>
    );
};

export default AssignSubject;