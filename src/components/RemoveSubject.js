import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
// import { useLocalStorage } from '../hooks/useLocalStorage'; // ❌ ELIMINA ESTA LÍNEA
import { Book, User, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '../hooks/useLocalStorage';// ✅ Importa tu cliente Supabase
import { useAuth } from '../context/AuthContext'; // ✅ Para obtener el ID del profesor loggeado

const RemoveSubject = ({ students = [], onSubjectRemoved }) => {
    // const [allStudents, setAllStudents] = useLocalStorage('edugrade_students', []); // ❌ ELIMINA ESTA LÍNEA
    const { user } = useAuth(); // Obtener el usuario autenticado (profesor)
    const teacherId = user?.id; // Suponiendo que el ID del profesor está en el objeto `user`

    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedSubjectName, setSelectedSubjectName] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [studentSubjects, setStudentSubjects] = useState([]); // ✅ Estado para las materias del estudiante seleccionado

    // ✅ Función para cargar las materias de un estudiante específico desde Supabase
    const fetchStudentSubjects = useCallback(async (studentId) => {
        if (!studentId) {
            setStudentSubjects([]);
            return;
        }
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const { data: studentData, error: studentError } = await supabase
                .from('students')
                .select('subjects') // Asume que 'subjects' es un JSONB o array de nombres de materias
                .eq('id', studentId)
                .single();

            if (studentError) {
                throw studentError;
            }

            // Asegúrate de que studentData.subjects es un array antes de usarlo
            setStudentSubjects(studentData?.subjects || []);
        } catch (err) {
            console.error('Error fetching student subjects:', err.message);
            setError('Error al cargar las materias del estudiante.');
            setStudentSubjects([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ Efecto para cargar las materias cuando cambia el estudiante seleccionado
    useEffect(() => {
        if (selectedStudentId) {
            fetchStudentSubjects(selectedStudentId);
        } else {
            setStudentSubjects([]); // Limpiar materias si no hay estudiante seleccionado
        }
    }, [selectedStudentId, fetchStudentSubjects]);

    const handleStudentSelect = (e) => {
        setSelectedStudentId(e.target.value);
        setSelectedSubjectName(''); // Resetear materia seleccionada al cambiar estudiante
        setError('');
        setSuccess('');
    };

    const handleSubjectSelect = (e) => {
        setSelectedSubjectName(e.target.value);
        setError('');
        setSuccess('');
    };

    const handleRemoveSubject = async (e) => { // ✅ Hacemos la función asíncrona
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!selectedStudentId || !selectedSubjectName) {
            setError('Por favor, selecciona un estudiante y una materia para eliminar.');
            setLoading(false);
            return;
        }

        try {
            // ✅ Obtener el estudiante actual para obtener sus materias
            const { data: studentToUpdate, error: fetchError } = await supabase
                .from('students')
                .select('subjects, name') // Asegúrate de seleccionar el nombre también
                .eq('id', selectedStudentId)
                .single();

            if (fetchError || !studentToUpdate) {
                throw new Error('Estudiante no encontrado o error al obtener sus datos.');
            }

            // Filtrar la materia a eliminar
            const updatedSubjects = (studentToUpdate.subjects || []).filter(
                (sub) => sub.name !== selectedSubjectName
            );

            // ✅ Actualizar la tabla 'students' en Supabase
            const { error: updateError } = await supabase
                .from('students')
                .update({ subjects: updatedSubjects })
                .eq('id', selectedStudentId)
                .select(); // Con .select() para obtener los datos actualizados si es necesario

            if (updateError) {
                throw updateError;
            }

            setSuccess(
                `Materia "${selectedSubjectName}" eliminada exitosamente de ${studentToUpdate.name}.`
            );
            setSelectedStudentId('');
            setSelectedSubjectName('');
            // No es necesario actualizar `allStudents` localmente, el `onSubjectRemoved` o una nueva carga manejará esto
            // setAllStudents(updatedStudentsLocal); // ❌ ELIMINA ESTA LÍNEA

            if (onSubjectRemoved) {
                onSubjectRemoved(); // ✅ Notifica al componente padre para refrescar la lista
            }
        } catch (err) {
            console.error('Error removing subject:', err.message);
            setError(`Error al eliminar la materia: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Filtra los estudiantes para mostrar solo los asociados con el profesor actual (si aplica)
    const filteredStudents = teacherId
        ? students.filter(s => s.teacherId === teacherId)
        : students;

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
                        {filteredStudents.map((student) => ( // ✅ Usa filteredStudents
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
                        // Deshabilita si no hay estudiante seleccionado o si no tiene materias
                        disabled={!selectedStudentId || studentSubjects.length === 0} // ✅ Usa studentSubjects
                    >
                        <option value="">Selecciona una materia...</option>
                        {studentSubjects.map((subject) => ( // ✅ Usa studentSubjects
                            <option key={subject.name} value={subject.name}>
                                {subject.name}
                            </option>
                        ))}
                    </select>
                    {!selectedStudentId && (
                        <p className="text-sm text-gray-500 mt-2">Selecciona un estudiante para ver sus materias.</p>
                    )}
                    {selectedStudentId && studentSubjects.length === 0 && !loading && (
                        <p className="text-sm text-gray-500 mt-2">Este estudiante no tiene materias asignadas.</p>
                    )}
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