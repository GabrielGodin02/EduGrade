// src/components/StudentRegistration.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext'; // Mantén esta importación
// import { useLocalStorage } from '../hooks/useLocalStorage'; // Ya eliminada
import { UserPlus, Save, RefreshCw, Book } from 'lucide-react';

const StudentRegistration = ({ onStudentAdded }) => {
    const { user, registerStudent } = useAuth(); // Obtén registerStudent del contexto
    // const [students, setStudents] = useState([]); // Ya no necesitas este estado local para todos los estudiantes
                                                  // Los obtendrás de Supabase cuando sea necesario.

    // ... (rest of your state variables: formData, newSubject, success, error, loading)

    const handleSubmit = async (e) => { // Marca la función como async
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!formData.name || !formData.username || !formData.password || formData.selectedSubjects.length === 0) {
            setError('Todos los campos son obligatorios y debe seleccionar al menos una materia.');
            setLoading(false);
            return;
        }

        try {
            const newStudentData = {
                name: formData.name,
                username: formData.username,
                password: formData.password, // Supabase Auth lo hasheará
                teacherId: user.id, // Asegúrate de que `user.id` esté disponible
                subjects: formData.selectedSubjects.map(subjectName => ({
                    name: subjectName,
                    years: {
                        [new Date().getFullYear()]: {
                            'Periodo 1': { tasks: ['', '', '', ''], exams: ['', '', ''], presentations: ['', '', ''] },
                            'Periodo 2': { tasks: ['', '', '', ''], exams: ['', '', ''], presentations: ['', '', ''] },
                            'Periodo 3': { tasks: ['', '', '', ''], exams: ['', '', ''], presentations: ['', '', ''] },
                            'Periodo 4': { tasks: ['', '', '', ''], exams: ['', '', ''], presentations: ['', '', ''] }
                        }
                    }
                })),
            };

            // Llama a la función registerStudent del AuthContext
            const { data: registeredStudent, authUser } = await registerStudent(newStudentData);

            setSuccess(`Estudiante ${formData.name} registrado exitosamente. Usuario: ${formData.username}, Contraseña: ${formData.password}`);
            setFormData({ name: '', username: '', password: '', selectedSubjects: [] });
            setNewSubject('');
            setLoading(false);

            if (onStudentAdded) {
                onStudentAdded(); // Notifica al componente padre que un estudiante fue agregado
            }

        } catch (err) {
            setError(err.message || 'Error al registrar el estudiante. Inténtalo de nuevo.');
            setLoading(false);
        }
    };

    // ... (rest of your component JSX)
};

export default StudentRegistration;