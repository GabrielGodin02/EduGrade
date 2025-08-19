export const calculateAverage = (grades) => {
    if (!grades || grades.length === 0) return 0;
    const validGrades = grades.filter(grade => grade !== null && grade !== undefined && grade !== '');
    if (validGrades.length === 0) return 0;
    const sum = validGrades.reduce((acc, grade) => acc + parseFloat(grade), 0);
    return (sum / validGrades.length).toFixed(2);
};

export const calculateFinalGrade = (taskAvg, examAvg, presentationAvg) => {
    const task = parseFloat(taskAvg) || 0;
    const exam = parseFloat(examAvg) || 0;
    const presentation = parseFloat(presentationAvg) || 0;
    
    // Ponderación: 40% tareas, 40% evaluaciones, 20% exposiciones
    const finalGrade = (task * 0.4) + (exam * 0.4) + (presentation * 0.2);
    return finalGrade.toFixed(2);
};

export const getGradeStatus = (grade) => {
    const numGrade = parseFloat(grade);
    if (numGrade >= 9.0) return { status: 'Excelente', color: 'text-green-600', bg: 'bg-green-100' };
    if (numGrade >= 7.0) return { status: 'Bueno', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (numGrade >= 5.0) return { status: 'Aceptable', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'Insuficiente', color: 'text-red-600', bg: 'bg-red-100' };
};