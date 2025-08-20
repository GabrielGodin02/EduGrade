// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// Asegúrate de que la ruta a tu supabaseClient.js sea correcta
import { supabase } from '../supabaseClient'; 

// Crear el contexto de autenticación
const AuthContext = createContext(null);

// Hook personalizado para usar el contexto de autenticación más fácilmente
export const useAuth = () => {
  return useContext(AuthContext);
};

// Proveedor de autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener la sesión del usuario al cargar la aplicación
  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        console.log("App loaded with session for user:", session.user.id);
      } else if (error) {
        console.error("Error getting session:", error);
      }
      setLoading(false);
    };

    getSession();

    // Suscribirse a los cambios de estado de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth State Change Event:", event);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user || null);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        }
      }
    );

    // Limpiar la suscripción al desmontar el componente
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Función para registrar un nuevo profesor y su perfil
  const registerTeacher = useCallback(async (fullName, email, password) => {
    setLoading(true); // Indicar que la operación está en curso
    let authError = null;
    let profileError = null;
    let newUser = null;

    try {
      // 1. Registrar usuario en Supabase Auth (crea la entrada en auth.users)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        authError = error;
        console.error('🛑 registerTeacher: Error al registrar usuario en Supabase Auth:', authError);
        // Devolver el error de autenticación para que el componente de UI lo maneje
        return { success: false, error: authError };
      }

      newUser = data.user; // El objeto 'user' de Supabase Auth
      console.log('registerTeacher: Usuario de Supabase creado.', newUser);

      if (newUser) {
        // 2. Intentar insertar perfil en la tabla 'teachers'
        // ✅ CRÍTICO: El 'id' del perfil en la tabla 'teachers' DEBE ser el 'id' del usuario de Supabase Auth
        console.log("DEBUG: ID del usuario de Supabase Auth (auth.uid()):", newUser.id);
        console.log("DEBUG: Datos del perfil a insertar en 'teachers':", {
          id: newUser.id, // Esto es vital para la política RLS (auth.uid() = id)
          full_name: fullName,
          email: newUser.email, // Usar el email proporcionado por Supabase Auth para consistencia
          role: 'teacher', // Asigna el rol predeterminado
        });

        const { error: insertError } = await supabase
          .from('teachers')
          .insert([
            {
              id: newUser.id, // Aquí es donde se asegura la coincidencia con auth.uid()
              full_name: fullName,
              email: newUser.email,
              role: 'teacher',
            }
          ]);

        if (insertError) {
          profileError = insertError;
          console.error('🛑 registerTeacher: ERROR AL INSERTAR PERFIL DE PROFESOR EN DB:', profileError);
          console.error('    Mensaje del error:', profileError.message);
          console.error('    Código del error:', profileError.code);
          console.error('    Detalles del error:', profileError.details);
          console.error('    Sugerencia del error:', profileError.hint);
          // Si falla la inserción del perfil, también lo consideramos un error de registro completo
          return { success: false, error: profileError };
        }

        console.log('registerTeacher: Perfil de profesor insertado exitosamente en DB.');
        setUser(newUser); // Actualiza el estado del usuario en el contexto
        return { success: true, user: newUser };

      } else {
        // Esto puede ocurrir si el registro de Supabase Auth está configurado para requerir confirmación de email
        // y data.user es null hasta que se confirme.
        console.warn('registerTeacher: Registro exitoso en Auth, pero newUser es null. Puede requerir confirmación de email.');
        return { success: true, user: null, message: 'Revisa tu correo para confirmar la cuenta.' };
      }

    } catch (err) {
      // Captura cualquier error inesperado en el proceso
      console.error('registerTeacher: Error en el bloque catch.', err);
      return { success: false, error: err };
    } finally {
      setLoading(false); // Finalizar la carga
    }
  }, []); // El array de dependencias vacío asegura que la función no se recree innecesariamente

  // Función para iniciar sesión
  const login = useCallback(async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      console.error("Login error:", error);
      return { success: false, error };
    }
    setUser(data.user);
    return { success: true, user: data.user };
  }, []);

  // Función para cerrar sesión
  const logout = useCallback(async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) {
      console.error("Logout error:", error);
      return { success: false, error };
    }
    setUser(null);
    return { success: true };
  }, []);

  // Función para cargar el perfil del usuario
  const fetchUserProfile = useCallback(async (userId) => {
    if (!userId) {
      console.log("No user ID provided to fetchUserProfile.");
      return null;
    }
    try {
      setLoading(true);
      // Asume que la tabla es 'teachers' y la columna de enlace es 'id'
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', userId) // La política RLS de SELECT usará esta condición (auth.uid() = id)
        .single(); // Para obtener solo un resultado

      if (error && error.code !== 'PGRST116') { // PGRST116 es "No rows found"
        console.error("Error fetching user profile:", error);
        return null;
      }
      if (data) {
        console.log("User profile fetched:", data);
        return data;
      } else {
        console.log("No profile found for user ID:", userId);
        return null;
      }
    } catch (err) {
      console.error("Exception fetching user profile:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);


  // El valor que se proporciona a los componentes que usan este contexto
  const value = {
    user,
    loading,
    registerTeacher,
    login,
    logout,
    fetchUserProfile, 
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Solo renderiza los hijos una vez que el estado de carga inicial ha terminado */}
      {!loading && children} 
    </AuthContext.Provider>
  );
};