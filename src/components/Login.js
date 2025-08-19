import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage'; // Import useLocalStorage
import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const { login, registerTeacher } = useAuth();
    const [teachers] = useLocalStorage('edugrade_teachers', []); // Use useLocalStorage
    const [students] = useLocalStorage('edugrade_students', []); // Use useLocalStorage
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false); // Keep loading state for UI feedback

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
        setSuccess('');
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        // Simulate network delay
        setTimeout(() => {
            // Buscar en profesores
            const teacher = teachers.find(t => 
                t.email === formData.email && t.password === formData.password
            );

            if (teacher) {
                login({
                    id: teacher.id,
                    name: teacher.name,
                    email: teacher.email,
                    role: 'teacher'
                });
                setLoading(false);
                return;
            }

            // Buscar en estudiantes
            const student = students.find(s => 
                s.username === formData.email && s.password === formData.password
            );

            if (student) {
                login({
                    id: student.id,
                    name: student.name,
                    username: student.username,
                    role: 'student',
                    teacherId: student.teacherId // Keep teacherId for student context
                });
                setLoading(false);
                return;
            }

            setError('Credenciales incorrectas');
            setLoading(false);
        }, 500); // Simulate network delay
    };

    const handleRegister = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!formData.name || !formData.email || !formData.password) {
            setError('Todos los campos son obligatorios');
            setLoading(false);
            return;
        }

        // Simulate network delay
        setTimeout(() => {
            // Verificar si el email ya existe
            const existingTeacher = teachers.find(t => t.email === formData.email);
            if (existingTeacher) {
                setError('Este email ya está registrado');
                setLoading(false);
                return;
            }

            const newTeacher = registerTeacher(formData.name, formData.email, formData.password);
            if (newTeacher) {
                setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
                setFormData({ email: '', password: '', name: '' });
                setIsLogin(true); // Redirect to login form
            } else {
                setError('Error al registrar profesor. Inténtalo de nuevo.');
            }
            setLoading(false);
        }, 500); // Simulate network delay
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
                            {isLogin ? 'Email o Usuario' : 'Email'}
                        </label>
                        <input
                            type={isLogin ? "text" : "email"}
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300"
                            placeholder={isLogin ? "Email o usuario" : "tu@email.com"}
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