import React, { useState, useEffect } from 'react'; // ✅ Import useEffect
import { motion } from 'framer-motion';
// import { useLocalStorage } from '../hooks/useLocalStorage'; // ❌ ELIMINA ESTA LÍNEA
import { Book, User, PlusCircle, Save } from 'lucide-react';
import { supabase } from '../supabaseClient';// ✅ IMPORTA SUPABASE CLIENT

// Modificamos el prop 'students' para que ya no sea necesario pasarlo desde el padre
// y que el componente se encargue de cargar sus propios estudiantes.
const AssignSubject = ({ onSubjectAssigned }) => {
    const [students, setStudents] = useState([]); // ✅ Nuevo estado para almacenar los estudiantes de Supabase
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [newSubjectName, setNewSubjectName] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingStudents, setFetchingStudents] = useState(true); // ✅ Nuevo estado para la carga de estudiantes

    // Función para obtener la lista de estudiantes desde Supabase
    const fetchStudents = async () => {
        setFetchingStudents(true);
        const { data, error } = await supabase
            .from('students')
            .select('id, full_name, subjects'); // ✅ Seleccionamos el ID, nombre completo y las materias

        if (error) {
            console.error('Error fetching students:', error.message);
            setError('Error al cargar la lista de estudiantes.');
            setStudents([]);
        } else {
            setStudents(data);
            setError('');
        }
        setFetchingStudents(false);
    };

    // ✅ useEffect para cargar los estudiantes cuando el componente se monta
    useEffect(() => {
        fetchStudents();
    }, []); // El array vacío asegura que se ejecute solo una vez al montar

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

    const handleAssignSubject = async (e) => { // ✅ Hacemos la función asíncrona
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!selectedStudentId || !newSubjectName.trim()) {
            setError('Por favor, selecciona un estudiante y escribe el nombre de la materia.');
            setLoading(false);
            return;
        }

        const studentToUpdate = students.find(s => s.id === selectedStudentId);

        if (!studentToUpdate) {
            setError('Estudiante no encontrado. Intenta recargar la página.');
            setLoading(false);
            return;
        }

        // Asegúrate de que `subjects` es un array, incluso si es null o undefined
        const currentSubjects = studentToUpdate.subjects || [];

        // Check if subject already exists for this student
        if (currentSubjects.some(sub => sub.name === newSubjectName.trim())) {
            setError(`La materia "${newSubjectName.trim()}" ya está asignada a este estudiante.`);
            setLoading(false);
            return;
        }

        // Crear la nueva materia con la estructura predeterminada de años y períodos
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

        const updatedSubjects = [...currentSubjects, newSubject];

        try {
            // Actualizar el registro del estudiante en Supabase
            const { error: updateError } = await supabase
                .from('students')
                .update({ subjects: updatedSubjects }) // ✅ Actualizamos la columna `subjects` (JSONB)
                .eq('id', selectedStudentId); // ✅ Filtramos por el ID del estudiante

            if (updateError) {
                console.error('Error assigning subject:', updateError.message);
                setError(`Error al asignar la materia: ${updateError.message}`);
            } else {
                setSuccess(`Materia "${newSubjectName.trim()}" asignada exitosamente a ${studentToUpdate.full_name}.`);
                setSelectedStudentId('');
                setNewSubjectName('');
                // Volver a cargar la lista de estudiantes para reflejar el cambio en la UI
                await fetchStudents();
                if (onSubjectAssigned) {
                    onSubjectAssigned(); // Call parent callback if provided
                }
            }
        } catch (err) {
            console.error('Unexpected error during subject assignment:', err.message);
            setError('Ocurrió un error inesperado al asignar la materia.');
        } finally {
            setLoading(false);
        }
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
                    {fetchingStudents ? (
                        <div className="flex items-center gap-2 text-gray-600">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            Cargando estudiantes...
                        </div>
                    ) : (
                        <select
                            value={selectedStudentId}
                            onChange={handleStudentSelect}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                            disabled={loading || fetchingStudents}
                        >
                            <option value="">Selecciona un estudiante...</option>
                            {students.length > 0 ? (
                                students.map(student => (
                                    <option key={student.id} value={student.id}>
                                        {student.full_name}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>No hay estudiantes disponibles</option>
                            )}
                        </select>
                    )}
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
                        disabled={!selectedStudentId || loading || fetchingStudents}
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
                    disabled={loading || !selectedStudentId || !newSubjectName.trim() || fetchingStudents}
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