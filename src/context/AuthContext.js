// src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'; // ✅ Añade useCallback aquí
import { supabase } from '../hooks/useLocalStorage'; // Asegúrate de importar tu cliente Supabase

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Se inicia en true para verificar la sesión al cargar

    // Función auxiliar para cargar el perfil del usuario desde las tablas 'teachers' o 'students'
    const fetchUserProfile = useCallback(async (userId) => {
        if (!userId) {
            console.warn('fetchUserProfile: userId is null or undefined. Cannot fetch profile.');
            return null;
        }

        try {
            // 1. Intenta buscar el perfil en la tabla 'teachers' (registro exclusivo de profesores)
            const { data: teacherProfile, error: teacherError } = await supabase
                .from('teachers')
                .select('id, full_name, email, role') // ✅ Asegúrate de seleccionar el campo 'role'
                .eq('id', userId)
                .single();

            if (teacherProfile) {
                console.log('Profile found in teachers table:', teacherProfile);
                return { ...teacherProfile, role: 'teacher' }; // Asigna explícitamente el rol 'teacher'
            } else if (teacherError && teacherError.code !== 'PGRST116') {
                // PGRST116 es el código de error para "No se encontraron filas"
                // Si es un error real de la base de datos (no solo que no encontró el perfil)
                console.error('Error fetching teacher profile (DB error):', teacherError.message);
            }

            // 2. Si este es un sistema donde SOLO los profesores se registran por este formulario,
            // y luego crean estudiantes, entonces si no se encuentra un perfil de profesor
            // aquí, es probable que no sea un usuario de este flujo o haya habido un error.
            // Para evitar asignaciones incorrectas a 'student' si no se encuentra como profesor:
            console.warn(`No teacher profile found for user ID: ${userId}. Returning null profile.`);
            return null; // Si no es profesor, y este es el único flujo de registro, devuelve null.

            // Si tuvieras un flujo de registro directo para estudiantes, lo buscarías aquí:
            /*
            const { data: studentProfile, error: studentError } = await supabase
                .from('students')
                .select('id, name, username, teacher_id, role')
                .eq('id', userId)
                .single();

            if (studentProfile) {
                console.log('Profile found in students table:', studentProfile);
                return { ...studentProfile, role: 'student' }; // Asigna explícitamente el rol 'student'
            } else if (studentError && studentError.code !== 'PGRST116') {
                console.error('Error fetching student profile (DB error):', studentError.message);
            }
            */

        } catch (err) {
            console.error('Unexpected error in fetchUserProfile:', err.message);
            return null;
        }
    }, []); // El array de dependencias vacío significa que fetchUserProfile no cambia

    // useEffect para manejar cambios de estado de autenticación y carga inicial
    useEffect(() => {
        let isMounted = true; // Para evitar actualizaciones de estado en componentes desmontados

        // Suscripción a cambios de estado de autenticación de Supabase
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth State Change Event:', event, 'Session:', session); // ⭐ Debug: Qué evento y sesión se recibieron

            if (!isMounted) return; // Si el componente se desmontó, no hagas nada

            if (session?.user) {
                // Si hay una sesión y un usuario, intenta obtener su perfil
                if (session.user.id) {
                    const profile = await fetchUserProfile(session.user.id);
                    if (isMounted) {
                        if (profile) {
                            setUser({ ...session.user, ...profile });
                            console.log('User profile loaded:', { ...session.user, ...profile });
                        } else {
                            // Si no se encontró perfil específico pero está autenticado
                            console.warn('User authenticated but no specific profile found. Setting base user with "unknown" role.');
                            setUser({ ...session.user, role: 'unknown' }); // Asigna un rol 'unknown' o similar
                        }
                    }
                } else {
                    console.warn('Session user ID is missing after auth state change. Setting user to null.');
                    setUser(null);
                }
            } else {
                // Si no hay sesión, o el usuario es nulo, limpia el estado
                console.log('No session or user found, setting user to null.');
                if (isMounted) {
                    setUser(null);
                }
            }
            if (isMounted) {
                setLoading(false); // ⭐ IMPORTANTE: Desactiva el loading después de procesar el estado de autenticación
                console.log('Auth state change processed. Loading set to false.');
            }
        });

        // Función para cargar la sesión inicial cuando el componente se monta por primera vez
        const getInitialSession = async () => {
            console.log('Fetching initial session...'); // ⭐ Debug: Indicador de inicio de carga inicial
            if (!isMounted) return;

            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (!isMounted) return;

                if (error) {
                    console.error('Error getting initial session:', error.message);
                    setUser(null);
                } else if (session?.user) {
                    const profile = await fetchUserProfile(session.user.id);
                    if (isMounted) {
                        if (profile) {
                            setUser({ ...session.user, ...profile });
                            console.log('Initial session user profile loaded:', { ...session.user, ...profile });
                        } else {
                            console.warn('Initial session user authenticated but no specific profile found. Setting base user with "unknown" role.');
                            setUser({ ...session.user, role: 'unknown' });
                        }
                    }
                } else {
                    console.log('No initial session found. Setting user to null.');
                    setUser(null);
                }
            } catch (err) {
                console.error('Unexpected error in getInitialSession:', err.message);
                setUser(null);
            } finally {
                if (isMounted) {
                    setLoading(false); // ⭐ IMPORTANTE: Desactiva el loading SIEMPRE al finalizar la carga inicial
                }
                console.log('Initial session fetch completed. Loading set to false.'); // ⭐ Debug: Final de carga inicial
            }
        };

        getInitialSession();

        // Función de limpieza para la suscripción al desmontar el componente
        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
            isMounted = false; // Marcar componente como desmontado
        };
    }, [fetchUserProfile]); // fetchUserProfile es una dependencia de useEffect

    // Función para iniciar sesión
    const login = async (email, password) => {
        setLoading(true); // Activa el loading mientras se procesa el login
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                console.error('Login error:', error.message);
                throw error;
            }
            // El onAuthStateChange se encargará de setear el user y desactivar el loading.
            // No llamar setLoading(false) aquí para evitar race conditions.
            console.log('Login successful, waiting for onAuthStateChange to update state...');
            return data;
        } catch (error) {
            // Si el login falla de forma inmediata, desactivamos el loading aquí
            setLoading(false);
            throw error;
        }
    };

    // Función para registrar un profesor (este formulario es SOLO para profesores)
    const registerTeacher = async (name, email, password) => {
        setLoading(true); // Activa el loading mientras se procesa el registro
        try {
            // Trim the email to remove any leading/trailing whitespace
            const trimmedEmail = email.trim(); // ✅ Asegúrate de recortar el email

            const { data, error } = await supabase.auth.signUp({
                email: trimmedEmail,
                password,
                options: {
                    data: {
                        full_name: name, // Esto es metadata para Supabase Auth
                    }
                }
            });

            if (error) {
                console.error('Supabase Auth signUp error:', error.message);
                throw error;
            }

            // Si el registro de autenticación fue exitoso, inserta los detalles en tu tabla 'teachers'
            if (data.user) {
                console.log('Supabase user created. Attempting to insert profile into teachers table...');
                const { error: insertError } = await supabase
                    .from('teachers') // ✅ La tabla debe ser 'teachers'
                    .insert({
                        id: data.user.id,        // ✅ El ID debe ser el del usuario de Supabase Auth
                        full_name: name,         // ✅ La columna debe existir en 'teachers' y llamarse así
                        email: trimmedEmail,     // Usar el email recortado
                        role: 'teacher'          // ⭐ ESTO ES CLAVE: Asigna explícitamente 'teacher'
                    });
                if (insertError) {
                    console.error('Error inserting teacher profile into DB:', insertError.message);
                    // IMPORTANTE: Si la inserción del perfil falla, el usuario de Auth existe pero no tiene perfil.
                    // Considera eliminar el usuario de Auth aquí si quieres evitar "huérfanos".
                    // Esto requeriría una llamada a supabase.auth.admin.deleteUser() (solo en el servidor o con RLS apropiado).
                    throw new Error('Error al guardar el perfil del profesor.');
                }
                console.log('Teacher profile successfully inserted with role "teacher".');
            }
            // El onAuthStateChange se encargará de setear el user y desactivar el loading.
            return data;
        } catch (error) {
            // Si el registro falla de forma inmediata, desactivamos el loading aquí
            setLoading(false);
            throw error;
        }
    };

    // Función para cerrar sesión
    const logout = async () => {
        setLoading(true); // Activa el loading al iniciar el logout
        console.log('Logout initiated. Loading set to true.');

        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Logout error:', error.message);
                throw error;
            }
            // El onAuthStateChange también se dispara con SIGNED_OUT y limpiará el user y loading
            // Si quieres forzarlo de inmediato:
            setUser(null);
            console.log('User state set to null after signOut.');
        } catch (error) {
            console.error('Catch block for logout error:', error.message);
            throw error;
        } finally {
            // ⭐ IMPORTANTE: Asegura que setLoading(false) se llame SIEMPRE.
            setLoading(false);
            console.log('Logout process finished. Loading set to false.');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, registerTeacher, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);