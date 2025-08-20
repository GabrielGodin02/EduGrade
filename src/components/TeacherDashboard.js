import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
// import { useLocalStorage } from '../hooks/useLocalStorage'; // ❌ ELIMINA ESTA LÍNEA
import { Users, UserPlus, BookOpen, BarChart3, PlusCircle, Trash2 } from 'lucide-react';
import StudentRegistration from './StudentRegistration';
import StudentList from './StudentList';
import GradeManagement from './GradeManagement';
import AssignSubject from './AssignSubject';
import RemoveSubject from './RemoveSubject';
import { supabase } from '../hooks/useLocalStorage'; // ✅ IMPORTA SUPABASE CLIENT

const TeacherDashboard = () => {
    const { user } = useAuth(); // `user` ahora proviene directamente de Supabase Auth via AuthContext
    const [myStudents, setMyStudents] = useState([]); // ✅ Cambiado de useLocalStorage a useState
    const [loadingStudents, setLoadingStudents] = useState(true); // ✅ Nuevo estado para la carga de estudiantes
    const [activeTab, setActiveTab] = useState('overview');

    // Función asíncrona para cargar estudiantes desde Supabase
    const fetchStudents = async () => {
        if (!user || !user.id) { // Asegúrate de que el usuario esté logueado y tenga un ID
            setMyStudents([]);
            setLoadingStudents(false);
            return;
        }

        setLoadingStudents(true);
        try {
            const { data, error } = await supabase
                .from('students') // ✅ Tu tabla de estudiantes en Supabase
                .select('*') // Selecciona todas las columnas
                .eq('teacher_id', user.id); // ✅ Filtra por el ID del profesor logueado

            if (error) {
                console.error("Error fetching students from Supabase:", error.message);
                setMyStudents([]);
            } else {
                setMyStudents(data);
            }
        } catch (err) {
            console.error("Unexpected error fetching students:", err.message);
            setMyStudents([]);
        } finally {
            setLoadingStudents(false);
        }
    };

    // ✅ useEffect para cargar estudiantes cuando el componente se monta o el usuario cambia
    useEffect(() => {
        fetchStudents();
    }, [user]); // Vuelve a cargar si el objeto `user` en el AuthContext cambia

    // Función para refrescar la lista de estudiantes
    // Ahora simplemente llama a fetchStudents para recargar desde Supabase
    const refreshStudents = () => {
        fetchStudents();
    };

    const tabs = [
        { id: 'overview', label: 'Resumen', icon: BarChart3 },
        { id: 'students', label: 'Estudiantes', icon: Users },
        { id: 'register', label: 'Registrar', icon: UserPlus },
        { id: 'assignSubject', label: 'Asignar Materia', icon: PlusCircle },
        { id: 'removeSubject', label: 'Eliminar Materia', icon: Trash2 },
        { id: 'grades', label: 'Calificaciones', icon: BookOpen }
    ];

    const renderTabContent = () => {
        // Muestra un indicador de carga mientras se cargan los estudiantes
        if (loadingStudents) {
            return (
                <motion.div
                    className="flex items-center justify-center h-48 bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-3xl shadow-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="ml-4 text-gray-700">Cargando estudiantes...</p>
                </motion.div>
            );
        }

        switch (activeTab) {
            case 'overview':
                return (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Tarjeta de Estudiantes Registrados */}
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

                        {/* Tarjeta de Materia Principal (puede que necesite lógica más avanzada) */}
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

                        {/* Tarjeta de Estudiantes con Calificaciones (ejemplo) */}
                        <div className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 rounded-xl">
                                    <BarChart3 className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {/* Lógica para contar estudiantes con calificaciones */}
                                        {myStudents.filter(student => student.subjects && student.subjects.some(sub => Object.values(sub.years || {}).some(year => Object.values(year).some(period => Object.values(period).flat().some(grade => grade !== ''))))).length}
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
                // Asegúrate de pasar `myStudents` actualizado
                return <AssignSubject students={myStudents} onSubjectAssigned={refreshStudents} />;
            case 'removeSubject':
                // Asegúrate de pasar `myStudents` actualizado
                return <RemoveSubject students={myStudents} onSubjectRemoved={refreshStudents} />;
            case 'grades':
                // Asegúrate de pasar `myStudents` actualizado
                return <GradeManagement students={myStudents} onGradeUpdated={refreshStudents} />; // Considerar onGradeUpdated para refrescar si se modifican las calificaciones
            default:
                return null;
        }
    };

    // Asegúrate de que `user` esté disponible antes de intentar usarlo
    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <p className="text-gray-700">Cargando perfil de usuario...</p>
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin ml-4"></div>
            </div>
        );
    }

    // Renderiza el dashboard solo si el usuario está disponible y es un profesor
    if (user.role !== 'teacher') {
        return (
            <div className="flex items-center justify-center h-screen bg-red-100">
                <p className="text-red-700 font-semibold">Acceso Denegado: Solo profesores pueden acceder a este panel.</p>
            </div>
        );
    }

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
                            Bienvenido, {user.user_metadata?.full_name || user.email}
                        </h1> {/* ✅ Ajuste para obtener el nombre del usuario de Supabase Auth */}
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