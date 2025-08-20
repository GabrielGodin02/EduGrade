import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext'; // Asumimos que useAuth ya maneja Supabase Auth
// import { useLocalStorage } from '../hooks/useLocalStorage'; // ❌ ELIMINA ESTA LÍNEA
import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const { login, registerTeacher } = useAuth(); // Asumimos que estos métodos interactúan con Supabase Auth
    // const [teachers] = useLocalStorage('edugrade_teachers', []); // ❌ ELIMINA ESTA LÍNEA
    // const [students] = useLocalStorage('edugrade_students', []); // ❌ ELIMINA ESTA LÍNEA
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '' // Solo necesario para el registro
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
        setSuccess('');
    };

    const handleLogin = async (e) => { // ✅ Hacemos la función asíncrona
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const { email, password } = formData;

        try {
            // Asumimos que `login` de useAuth ahora llama a `supabase.auth.signInWithPassword`
            // Este método de `useAuth` debería manejar la lógica de autenticación
            // y la asignación del rol una vez autenticado (profesor o estudiante).
            // No necesitamos buscar manualmente en `teachers` o `students` aquí.
            await login(email, password); // ✅ Llamamos al método `login` de useAuth
            setSuccess('Inicio de sesión exitoso!'); // Esto podría ser manejado por el AuthContext
        } catch (err) {
            console.error('Error al iniciar sesión:', err.message);
            // Mostrar un error más amigable al usuario
            if (err.message.includes('Invalid login credentials')) {
                setError('Credenciales incorrectas. Verifica tu email y contraseña.');
            } else {
                setError(`Error al iniciar sesión: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => { // ✅ Hacemos la función asíncrona
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const { name, email, password } = formData;

        if (!name || !email || !password) {
            setError('Todos los campos son obligatorios.');
            setLoading(false);
            return;
        }

        try {
            // Asumimos que `registerTeacher` de useAuth llama a `supabase.auth.signUp`
            // y luego inserta el perfil del profesor en la tabla `teachers`.
            await registerTeacher(name, email, password); // ✅ Llamamos al método `registerTeacher` de useAuth
            setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión con tu email y contraseña.');
            setFormData({ email: '', password: '', name: '' }); // Limpiamos el formulario
            setIsLogin(true); // Redirigir a la forma de inicio de sesión
        } catch (err) {
            console.error('Error al registrar profesor:', err.message);
            // Adaptar los mensajes de error de Supabase para el usuario
            if (err.message.includes('User already registered')) {
                setError('Este email ya está registrado. Por favor, inicia sesión.');
            } else if (err.message.includes('Password should be at least 6 characters')) {
                setError('La contraseña debe tener al menos 6 caracteres.');
            } else {
                setError(`Error al registrar: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
            <motion.div
                className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 w-full max-w-md shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="text-center mb-8">
                    <motion.div
                        className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        {isLogin ? (
                            <LogIn className="w-8 h-8 text-white" />
                        ) : (
                            <UserPlus className="w-8 h-8 text-white" />
                        )}
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {isLogin ? 'Iniciar Sesión' : 'Registro de Profesor'}
                    </h2>
                    <p className="text-gray-600">
                        {isLogin ? 'Accede a tu cuenta' : 'Crea tu cuenta de profesor'}
                    </p>
                </div>

                <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-6">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre Completo
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                                placeholder="Tu nombre completo"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email" // Siempre de tipo email para Supabase Auth
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                            placeholder="tu@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 pr-12"
                                placeholder="Tu contraseña"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {error}
                        </motion.div>
                    )}

                    {success && (
                        <motion.div
                            className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {success}
                        </motion.div>
                    )}

                    <motion.button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-2">Cargando...</span>
                            </div>
                        ) : (
                            isLogin ? 'Iniciar Sesión' : 'Registrarse'
                        )}
                    </motion.button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-300"
                        disabled={loading}
                    >
                        {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;