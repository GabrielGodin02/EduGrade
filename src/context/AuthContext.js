import React, { createContext, useContext, useState, useEffect } from 'react';
// No longer importing supabase

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('edugrade_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('edugrade_user', JSON.stringify(userData));
    };

    const registerTeacher = (name, email, password) => {
        // In this local storage version, we'll just simulate registration
        // In a real app, this would involve a backend call
        const newTeacher = {
            id: Date.now().toString(),
            name,
            email,
            password,
            role: 'teacher'
        };
        // For simplicity, we'll just store it in localStorage for now
        // In a real app, you'd manage a list of teachers
        const existingTeachers = JSON.parse(localStorage.getItem('edugrade_teachers') || '[]');
        localStorage.setItem('edugrade_teachers', JSON.stringify([...existingTeachers, newTeacher]));
        
        // Log in the newly registered teacher
        login(newTeacher);
        return newTeacher;
    };

    const registerStudent = (name, username, password, teacherId) => {
        // In this local storage version, we'll just simulate registration
        const newStudent = {
            id: Date.now().toString(),
            name,
            username,
            password,
            teacherId,
            role: 'student',
            subjects: [] // Students start with no subjects, teacher adds them
        };
        const existingStudents = JSON.parse(localStorage.getItem('edugrade_students') || '[]');
        localStorage.setItem('edugrade_students', JSON.stringify([...existingStudents, newStudent]));
        return newStudent;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('edugrade_user');
    };

    const value = {
        user,
        login,
        registerTeacher,
        registerStudent,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};