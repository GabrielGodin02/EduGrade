// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; // Asegúrate de que esta ruta sea correcta

// Importa tus componentes de UI
import Layout from './components/Layout'; // Asume que tienes un componente Layout
import Login from './components/Login'; // Tu componente de login/registro
import TeacherDashboard from './components/TeacherDashboard'; // Dashboard para profesores
import StudentDashboard from './components/StudentDashboard'; // Dashboard para estudiantes (aunque no se use directamente aquí para el registro)

// Este componente envuelve tu lógica de enrutamiento y muestra condicionalmente el contenido
const AppContent = () => {
    const { user, loading } = useAuth(); // Obtiene el usuario y el estado de carga del contexto

    // ⭐ Debug: Muestra el estado actual del usuario y loading para AppContent
    console.log('AppContent Render - User:', user, 'Loading state:', loading);

    // 1. Mostrar pantalla de carga mientras se inicializa la sesión o se procesa el cambio de auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    // 2. Si no hay usuario (y ya no estamos cargando), mostrar la pantalla de Login
    if (!user) {
        console.log('AppContent: No user, showing Login component.');
        return <Login />;
    }

    // 3. Si hay usuario y ya no estamos cargando, decidir qué dashboard mostrar
    // ⭐ Debug: Muestra el rol final del usuario autenticado
    console.log('AppContent: User authenticated. Role:', user.role);

    // Si el usuario tiene el rol 'teacher', muestra el TeacherDashboard
    if (user.role === 'teacher') {
        return (
            <Layout>
                <TeacherDashboard />
            </Layout>
        );
    } 
    // Si el usuario tiene el rol 'student' (o cualquier otro rol/desconocido), muestra el StudentDashboard
    // Considera qué hacer si el rol es 'unknown' o nulo. Podrías redirigir al login o a una página de error.
    else if (user.role === 'student') { // Asume que podrías tener estudiantes si implementas ese flujo
        return (
            <Layout>
                <StudentDashboard />
            </Layout>
        );
    } else {
        // Manejo para roles desconocidos o nulos. Podría ser un error, redirigir al login o a una página de error.
        console.warn('AppContent: User authenticated but has an unhandled role or no role:', user.role);
        // Opcional: Redirigir a login o a una página de error si el rol no es válido
        return <Navigate to="/login" replace />; 
    }
};

// Componente principal de la aplicación que configura el router y el AuthProvider
const App = () => {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
};

export default App;