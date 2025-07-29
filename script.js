document.addEventListener('DOMContentLoaded', () => {
    // Definición de todos los ramos y sus requisitos
    const courses = {
        // Semestre 1
        "Aplicaciones de la Biología a la Ingeniería y Ciencias": [],
        "Desafíos de Innovación en Ingeniería y Ciencias": [],
        "Introducción al Álgebra": [],
        "Introducción al Cálculo": [],
        "Introducción a la Física Clásica": [],
        "Herramientas Computacionales para Ingeniería y Ciencias": [],

        // Semestre 2
        "Algebra Lineal": ["Introducción al Álgebra"],
        "Cálculo Diferencial e Integral": ["Introducción al Cálculo"],
        "Introducción a la Física Moderna": ["Introducción al Álgebra", "Introducción al Cálculo", "Introducción a la Física Clásica"],
        "Proyecto de Innovación en Ingeniería y Ciencias": ["Desafíos de Innovación en Ingeniería y Ciencias"],
        "Introducción a la Programación": ["Introducción al Álgebra", "Introducción al Cálculo", "Introducción a la Física Clásica"],
        "Electivo de Formación Integral:(FG/EH/EI/DR/FT)": [],

        // Semestre 3
        "Cálculo en Varias Variables": ["Algebra Lineal", "Cálculo Diferencial e Integral"],
        "Ecuaciones Diferenciales Ordinarias": ["Algebra Lineal", "Cálculo Diferencial e Integral"],
        "Mecánica": ["Algebra Lineal", "Cálculo Diferencial e Integral", "Introducción a la Física Moderna"],
        "Métodos Experimentales": ["Cálculo Diferencial e Integral", "Introducción a la Física Moderna"],
        "Química": ["Introducción a la Física Moderna", "Introducción a la Programación"],

        // Semestre 4
        "Economía": ["Cálculo en Varias Variables"],
        "Cálculo Avanzado y Aplicaciones": ["Cálculo en Varias Variables", "Ecuaciones Diferenciales Ordinarias"],
        "Electromagnetismo": ["Cálculo en Varias Variables", "Ecuaciones Diferenciales Ordinarias", "Mecánica"],
        "Módulo Interdisciplinario": ["Proyecto de Innovación en Ingeniería y Ciencias", "Métodos Experimentales"],
        "Termodinámica Química": ["Química", "Cálculo en Varias Variables", "Mecánica"],
        // El electivo de formación integral no tiene requisitos específicos en este nivel
        "Electivo de Formación Integral:(FG/EH/EI/DR/FT)": [],
    };

    // Obtener la lista de ramos aprobados desde el almacenamiento local
    // Si no hay ramos guardados, inicializa un set vacío
    const approvedCourses = new Set(JSON.parse(localStorage.getItem('approvedCourses')) || []);

    // Referencias a elementos del DOM
    const allCourseElements = document.querySelectorAll('.course');
    const notificationModal = document.getElementById('notification-modal');
    const notificationMessage = document.getElementById('notification-message');
    const closeButton = document.querySelector('.close-button');

    /**
     * Guarda el estado actual de los ramos aprobados en el almacenamiento local.
     */
    const saveApprovedCourses = () => {
        localStorage.setItem('approvedCourses', JSON.stringify(Array.from(approvedCourses)));
    };

    /**
     * Muestra el modal de notificación con un mensaje dado.
     * @param {string} message - El mensaje a mostrar en el modal.
     */
    const showNotification = (message) => {
        notificationMessage.innerHTML = message; // Usar innerHTML para permitir etiquetas HTML
        notificationModal.style.display = 'flex';
    };

    /**
     * Oculta el modal de notificación.
     */
    const hideNotification = () => {
        notificationModal.style.display = 'none';
    };

    // Cierra el modal al hacer clic en el botón de cerrar
    closeButton.addEventListener('click', hideNotification);

    // Cierra el modal al hacer clic fuera del contenido del modal
    window.addEventListener('click', (event) => {
        if (event.target === notificationModal) {
            hideNotification();
        }
    });

    /**
     * Verifica si un ramo dado puede ser aprobado, es decir, si todos sus requisitos están cumplidos.
     * @param {string} courseName - El nombre del ramo a verificar.
     * @returns {Array<string>} Un array de ramos que son requisitos faltantes. Si el array está vacío, significa que todos los requisitos están cumplidos.
     */
    const checkRequirements = (courseName) => {
        const requiredCourses = courses[courseName];
        if (!requiredCourses || requiredCourses.length === 0) {
            return []; // No tiene requisitos, se puede aprobar
        }

        const missingRequirements = requiredCourses.filter(req => !approvedCourses.has(req));
        return missingRequirements;
    };

    /**
     * Actualiza la interfaz de usuario para reflejar el estado actual de los ramos.
     * Se encarga de aplicar las clases 'approved' y 'blocked'.
     */
    const updateCourseStates = () => {
        allCourseElements.forEach(courseElement => {
            const courseName = courseElement.dataset.name;

            // Reiniciar clases para evitar estados incorrectos
            courseElement.classList.remove('approved', 'blocked');

            if (approvedCourses.has(courseName)) {
                courseElement.classList.add('approved');
            } else {
                const missingReqs = checkRequirements(courseName);
                if (missingReqs.length > 0) {
                    courseElement.classList.add('blocked');
                }
            }
        });
    };

    /**
     * Manejador de eventos para el clic en un ramo.
     * @param {Event} event - El objeto de evento del clic.
     */
    const handleCourseClick = (event) => {
        const courseElement = event.target;
        const courseName = courseElement.dataset.name;

        if (courseElement.classList.contains('approved')) {
            // Si el ramo ya está aprobado, se desmarca (opcional, podrías solo permitir marcar)
            approvedCourses.delete(courseName);
            showNotification(`Se ha desmarcado "${courseName}" como aprobado.`);
        } else {
            // Intenta marcar el ramo como aprobado
            const missingReqs = checkRequirements(courseName);

            if (missingReqs.length === 0) {
                // Todos los requisitos están cumplidos, marcar como aprobado
                approvedCourses.add(courseName);
                showNotification(`¡Felicidades! Has aprobado "${courseName}".`);
            } else {
                // Faltan requisitos, mostrar mensaje
                let message = `No puedes aprobar "${courseName}" porque te faltan los siguientes ramos:<ul>`;
                missingReqs.forEach(req => {
                    message += `<li>${req}</li>`;
                });
                message += `</ul>`;
                showNotification(message);
            }
        }

        // Después de cada cambio, guardar y actualizar la UI
        saveApprovedCourses();
        updateCourseStates();
    };

    // Asignar el event listener a cada ramo
    allCourseElements.forEach(courseElement => {
        courseElement.addEventListener('click', handleCourseClick);
    });

    // Inicializar el estado de los ramos al cargar la página
    updateCourseStates();
});
