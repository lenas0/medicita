# Caso 7: Proyecto MediCita — Plataforma de Agendamiento y Gestión Médica

**Objetivo General:**
Desarrollar una aplicación web para un centro médico privado que permita a los pacientes gestionar sus citas y resultados de manera autónoma, reemplazando el actual sistema de agendamiento telefónico.

---

## 1. Requerimientos Tecnológicos y de Seguridad

* **Plataforma:** Aplicación web accesible desde cualquier navegador en computadora. El equipo de desarrollo tiene total libertad para elegir las tecnologías y la arquitectura.
* **Seguridad de Datos:** Es indispensable implementar un sistema robusto de encriptación o *hashing* para las contraseñas de los usuarios. La información es sensible y debe estar completamente resguardada contra vulnerabilidades y filtraciones de bases de datos.

## 2. Perfil y Experiencia del Paciente

* **Registro y Autenticación:** Los pacientes deben poder crear una cuenta e iniciar sesión de forma segura.
* **Catálogo de Especialistas:** Acceso a un directorio médico donde se visualice la siguiente información por profesional:
* Nombre completo.
* Especialidad médica.
* Horario de atención.
* Valor de la consulta.
* Breve descripción o perfil profesional.


* **Gestión de Citas (Sección "Mis Citas"):**
* Agendamiento de nuevas consultas.
* Visualización de próximas citas.
* Acceso al historial de citas previas.


* **Sistema de Reseñas:** Tras finalizar una cita, el paciente podrá evaluar al médico. Este sistema debe ser flexible e incluir:
* Calificación obligatoria.
* Campos opcionales: comentario, etiquetas personalizadas y tiempo de espera en sala.
* Posibilidad de dejar únicamente la calificación sin texto adicional.



## 3. Gestión de Resultados de Exámenes

Los pacientes deben poder consultar sus resultados directamente en la plataforma, organizados por categoría y con un formato estandarizado, independientemente del médico que los solicite. Se identifican tres tipos de exámenes:

1. **Exámenes Numéricos:** Deben mostrar el valor obtenido por el paciente junto con el rango de referencia considerado normal (ej. exámenes de sangre).
2. **Exámenes Cualitativos:** Resultados directos basados en condiciones (ej. positivo/negativo).
3. **Estudios de Imagenología:** Deben incluir el informe escrito redactado por el radiólogo adjunto al archivo de la imagen correspondiente (ej. radiografías o ecografías).

## 4. Panel de Administración (Director del Centro)

El sistema debe contar con un módulo de administración básico y fácil de usar, diseñado para personal sin formación técnica, que permita:

* **Gestión del Directorio:** Agregar fácilmente nuevos médicos al catálogo cuando se incorporen al centro.
* **Control de Citas:** Visualizar la agenda y las citas programadas para el día en curso.
* **Gestión de Pacientes:** Administrar la base de datos de pacientes registrados.
* **Reportes de Ingresos:** Seguimiento detallado y trazabilidad de las transacciones. El administrador debe poder identificar fácilmente qué paciente se atendió, con qué médico, en qué fecha y cuál fue el valor exacto cobrado por la consulta.