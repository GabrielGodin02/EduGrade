import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage'; // Import useLocalStorage
import { UserPlus, Save, RefreshCw, Book } from 'lucide-react';

const StudentRegistration = ({ onStudentAdded }) => { // Receive onStudentAdded prop
    const { user, registerStudent } = useAuth();
    const [students, setStudents] = useLocalStorage('edugrade_students', []); // Use useLocalStorage
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        selectedSubjects: []
    });
    const [newSubject, setNewSubject] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const generateCredentials = () => {
        const username = `est_${Math.random().toString(36).slice(2, 8)}`;
        const password = Math.random().toString(36).slice(-8);
        setFormData({
            ...formData,
            username,
            password
        });
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
        setSuccess('');
    };

    const handleAddSubject = () => {
        if (newSubject.trim() && !formData.selectedSubjects.includes(newSubject.trim())) {
            setFormData(prev => ({
                ...prev,
                selectedSubjects: [...prev.selectedSubjects, newSubject.trim()]
            }));
            setNewSubject('');
        }
    };

    const handleRemoveSubject = (subjectToRemove) => {
        setFormData(prev => ({
            ...prev,
            selectedSubjects: prev.selectedSubjects.filter(s => s !== subjectToRemove)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!formData.name || !formData.username || !formData.password || formData.selectedSubjects.length === 0) {
            setError('Todos los campos son obligatorios y debe seleccionar al menos una materia.');
            setLoading(false);
            return;
        }

        // Simulate network delay
        setTimeout(() => {
            // Verificar si el usuario ya existe
            const existingStudent = students.find(s => s.username === formData.username);
            if (existingStudent) {
                setError('Este nombre de usuario ya existe');
                setLoading(false);
                return;
            }

            const newStudent = {
                id: Date.now().toString(),
                name: formData.name,
                username: formData.username,
                password: formData.password,
                teacherId: user.id,
                subjects: formData.selectedSubjects.map(subjectName => ({
                    name: subjectName,
                    years: {
                        [new Date().getFullYear()]: { // Año actual por defecto
                            'Periodo 1': { tasks: ['', '', '', ''], exams: ['', '', ''], presentations: ['', '', ''] },
                            'Periodo 2': { tasks: ['', '', '', ''], exams: ['', '', ''], presentations: ['', '', ''] },
                            'Periodo 3': { tasks: ['', '', '', ''], exams: ['', '', ''], presentations: ['', '', ''] },
                            'Periodo 4': { tasks: ['', '', '', ''], exams: ['', '', ''], presentations: ['', '', ''] } // Added Period 4
                        }
                    }
                })),
                createdAt: new Date().toISOString()
            };

            const updatedStudents = [...students, newStudent];
            setStudents(updatedStudents); // Update localStorage via hook

            setSuccess(`Estudiante ${formData.name} registrado exitosamente. Usuario: ${formData.username}, Contraseña: ${formData.password}`);
            setFormData({ name: '', username: '', password: '', selectedSubjects: [] });
            setNewSubject('');
            setLoading(false);
            
            if (onStudentAdded) { // Call the refresh function
                onStudentAdded();
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
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl">
                    <UserPlus className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Registrar Estudiante</h2>
                    <p className="text-gray-600">Agrega un nuevo estudiante y asigna materias</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo del Estudiante
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                        placeholder="Nombre completo del estudiante"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre de Usuario
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                            placeholder="Usuario para el estudiante"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña
                        </label>
                        <input
                            type="text"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                            placeholder="Contraseña para el estudiante"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Asignar Materias
                    </label>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={newSubject}
                            onChange={(e) => setNewSubject(e.target.value)}
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                            placeholder="Ej: Matemáticas, Castellano"
                        />
                        <motion.button
                            type="button"
                            onClick={handleAddSubject}
                            className="px-5 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-all duration-300"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Book className="w-5 h-5" />
                        </motion.button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.selectedSubjects.map((subject, index) => (
                            <motion.span
                                key={index}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                            >
                                {subject}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSubject(subject)}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    &times;
                                </button>
                            </motion.span>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <motion.button
                        type="button"
                        onClick={generateCredentials}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                    >
                        <RefreshCw className="w-5 h-5" />
                        Generar Credenciales
                    </motion.button>

                    <motion.button
                        type="submit"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex-1"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-2">Registrando...</span>
                            </div>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Registrar Estudiante
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
            </form>
        </motion.div>
    );
};

export default StudentRegistration;