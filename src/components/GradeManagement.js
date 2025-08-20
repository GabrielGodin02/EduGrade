import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// import { useLocalStorage } from '../hooks/useLocalStorage'; // ❌ ELIMINA ESTA LÍNEA
import { BookOpen, Save } from 'lucide-react';
import { calculateAverage, calculateFinalGrade, getGradeStatus } from '../utils/gradeCalculations';
import { supabase } from '../hooks/useLocalStorage'; // ✅ IMPORTA SUPABASE CLIENT

// Modificamos el componente para que no reciba 'students' como prop,
// sino que los cargue internamente desde Supabase.
const GradeManagement = () => {
    const [students, setStudents] = useState([]); // ✅ Estado para los estudiantes cargados desde Supabase
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedSubjectName, setSelectedSubjectName] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [grades, setGrades] = useState({
        tasks: ['', '', '', ''],
        exams: ['', '', ''],
        presentations: ['', '', '']
    });
    const [success, setSuccess] = useState('');
    const [loadingGrades, setLoadingGrades] = useState(false);
    const [fetchingStudents, setFetchingStudents] = useState(true); // ✅ Nuevo estado para la carga de estudiantes
    const [error, setError] = useState('');

    // Función para obtener la lista de estudiantes desde Supabase
    const fetchStudents = async () => {
        setFetchingStudents(true);
        const { data, error: fetchError } = await supabase
            .from('students')
            .select('id, full_name, subjects'); // ✅ Seleccionamos ID, nombre completo y el objeto de materias

        if (fetchError) {
            console.error('Error fetching students:', fetchError.message);
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

    // Re-calculamos estos selectores cada vez que los estados relevantes cambian
    const currentStudent = students.find(s => s.id === selectedStudentId);
    const currentSubjectData = currentStudent?.subjects?.find(sub => sub.name === selectedSubjectName);
    const currentYearData = currentSubjectData?.years?.[selectedYear];
    const currentPeriodData = currentYearData?.[selectedPeriod];

    // Effect para cargar las calificaciones cuando las selecciones cambian
    useEffect(() => {
        if (selectedStudentId && selectedSubjectName && selectedYear && selectedPeriod) {
            if (currentPeriodData) {
                setGrades({
                    tasks: currentPeriodData.tasks || ['', '', '', ''],
                    exams: currentPeriodData.exams || ['', '', ''],
                    presentations: currentPeriodData.presentations || ['', '', '']
                });
            } else {
                // Si no hay datos para el período/año/materia seleccionados, inicializa con vacíos
                setGrades({
                    tasks: ['', '', '', ''],
                    exams: ['', '', ''],
                    presentations: ['', '', '']
                });
            }
        } else {
            // Reiniciar calificaciones si no hay una selección completa
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
        // Permitir un valor vacío para borrar la nota
        if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 10)) {
            setGrades(prev => ({
                ...prev,
                [category]: prev[category].map((grade, i) => i === index ? value : grade)
            }));
        }
    };

    const handleSave = async () => { // ✅ Hacemos la función asíncrona
        if (!selectedStudentId || !selectedSubjectName || !selectedYear || !selectedPeriod) {
            setError('Por favor, selecciona estudiante, materia, año y período.');
            return;
        }
        setLoadingGrades(true);
        setError('');
        setSuccess('');

        const studentToUpdate = students.find(s => s.id === selectedStudentId);

        if (!studentToUpdate) {
            setError('Error: Estudiante no encontrado.');
            setLoadingGrades(false);
            return;
        }

        // Crear una copia profunda del objeto subjects para evitar mutaciones directas del estado
        const updatedSubjects = JSON.parse(JSON.stringify(studentToUpdate.subjects || []));

        const subjectIndex = updatedSubjects.findIndex(sub => sub.name === selectedSubjectName);

        if (subjectIndex !== -1) {
            // Asegurarse de que el objeto 'years' exista en la materia
            if (!updatedSubjects[subjectIndex].years) {
                updatedSubjects[subjectIndex].years = {};
            }
            // Asegurarse de que el objeto del año exista
            if (!updatedSubjects[subjectIndex].years[selectedYear]) {
                updatedSubjects[subjectIndex].years[selectedYear] = {
                    'Periodo 1': { tasks: ['', '', '', ''], exams: ['', '', ''], presentations: ['', '', ''] },
                    'Periodo 2': { tasks: ['', '', '', ''], exams: ['', '', ''], presentations: ['', '', ''] },
                    'Periodo 3': { tasks: ['', '', '', ''], exams: ['', '', ''], presentations: ['', '', ''] },
                    'Periodo 4': { tasks: ['', '', '', ''], exams: ['', '', ''], presentations: ['', '', ''] } // Añadido Periodo 4
                };
            }
            // Asignar las nuevas calificaciones al período seleccionado
            updatedSubjects[subjectIndex].years[selectedYear][selectedPeriod] = grades;
        } else {
            setError('Materia no encontrada para el estudiante seleccionado.');
            setLoadingGrades(false);
            return;
        }

        try {
            // Actualizar el registro del estudiante en Supabase
            const { error: updateError } = await supabase
                .from('students')
                .update({ subjects: updatedSubjects }) // ✅ Actualizamos la columna `subjects` (JSONB)
                .eq('id', selectedStudentId); // ✅ Filtramos por el ID del estudiante

            if (updateError) {
                console.error('Error saving grades:', updateError.message);
                setError(`Error al guardar las calificaciones: ${updateError.message}`);
            } else {
                setSuccess('Calificaciones guardadas exitosamente');
                // Volver a cargar los estudiantes para que los datos en la UI se actualicen
                await fetchStudents();
            }
        } catch (err) {
            console.error('Unexpected error during grade saving:', err.message);
            setError('Ocurrió un error inesperado al guardar las calificaciones.');
        } finally {
            setLoadingGrades(false);
        }
    };

    const taskAvg = calculateAverage(grades.tasks);
    const examAvg = calculateAverage(grades.exams);
    const presentationAvg = calculateAverage(grades.presentations);
    const finalGrade = calculateFinalGrade(taskAvg, examAvg, presentationAvg);
    const gradeStatus = getGradeStatus(finalGrade);

    // Si no hay estudiantes y ya terminamos de cargarlos
    if (!fetchingStudents && students.length === 0) {
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

    // Determinar años y períodos disponibles
    const selectedSubjectObj = currentStudent?.subjects?.find(s => s.name === selectedSubjectName);
    
    // Obtener los años existentes en las calificaciones de la materia
    const existingYears = selectedSubjectObj?.years ? Object.keys(selectedSubjectObj.years).sort((a, b) => b - a) : [];
    
    // Incluir el año actual si no está presente
    const currentYear = new Date().getFullYear().toString();
    const availableYears = [...new Set([currentYear, ...existingYears])].sort((a, b) => b - a);
    
    const availablePeriods = ['Periodo 1', 'Periodo 2', 'Periodo 3', 'Periodo 4'];

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
                    {fetchingStudents ? (
                         <div className="flex items-center gap-2 text-gray-600">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            Cargando estudiantes...
                        </div>
                    ) : (
                        <select
                            value={selectedStudentId}
                            onChange={(e) => handleStudentSelect(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                            disabled={fetchingStudents}
                        >
                            <option value="">Selecciona un estudiante...</option>
                            {students.map(student => (
                                <option key={student.id} value={student.id}>
                                    {student.full_name} {/* ✅ Usamos full_name aquí */}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Materia</label>
                    <select
                        value={selectedSubjectName}
                        onChange={(e) => handleSubjectSelect(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                        disabled={!selectedStudentId || !currentStudent?.subjects?.length || fetchingStudents}
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
                        disabled={!selectedSubjectName || fetchingStudents}
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
                        disabled={!selectedYear || fetchingStudents}
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