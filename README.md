# Plataforma de Ejercicios Académicos

Sistema web para que los estudiantes pasantes puedan subir ejercicios en formato PDF para que otros estudiantes los puedan descargar y ver. La plataforma cuenta con una vista pública para estudiantes y un panel de administración protegido con autenticación.

## Características

- **Vista Pública**: Cualquier estudiante puede ver y descargar ejercicios
- **Panel de Administración**: Protegido con usuario/contraseña para subir, editar y eliminar ejercicios
- **Subida de PDFs**: Interfaz intuitiva para subir archivos PDF desde AutoCAD u otras aplicaciones
- **Almacenamiento Seguro**: PDFs almacenados en Google Drive con metadatos en Google Sheets
- **Diseño Responsive**: Funciona en computadoras, tablets y móviles
- **Contador de Descargas**: Registra las descargas de cada ejercicio

## Requisitos

- Cuenta de Google (gmail.com)
- Acceso a Google Apps Script
- Archivos PDF de los ejercicios (exportados desde AutoCAD u otras aplicaciones CAD)

## Instalación y Configuración

### Paso 1: Acceder a Google Apps Script
1. Ve a [https://script.google.com](https://script.google.com)
2. Inicia sesión con tu cuenta de Google
3. Clic en "Nuevo proyecto"

### Paso 2: Configurar el Código Backend
1. Copia todo el contenido del archivo `EJERCICIOS_CODE.gs`
2. Pégalo en el editor de código de Google Apps Script (el archivo `Code.gs` que aparece por defecto)
3. Guarda el código (`Ctrl+S`)

### Paso 3: Crear la Interfaz Web (HTML)
1. En el menú lateral, haz clic en el signo `+` y selecciona "HTML"
2. Nombra el archivo como `Ejercicios_Index` (importante que coincida con el nombre en el código)
3. Copia todo el contenido del archivo `EJERCICIOS_INDEX.html`
4. Pégalo en el nuevo archivo HTML
5. Guarda el archivo

### Paso 4: Configurar la Base de Datos
1. En el editor de código, busca y ejecuta la función `inicializarSistema`:
   - Selecciona la función en el menú desplegable de funciones
   - Clic en el botón "Ejecutar" (triángulo verde)
2. Este paso creará automáticamente:
   - Una hoja de cálculo para almacenar los metadatos de los ejercicios
   - Una carpeta en Google Drive para almacenar los archivos PDF

### Paso 5: Configurar Credenciales de Administrador
Por seguridad, deberías cambiar las credenciales por defecto:
1. En el archivo de código (`EJERCICIOS_CODE.gs`), modifica las siguientes líneas:
   ```javascript
   const USUARIO_ADMIN = "admin";           // Cambia "admin" por tu usuario
   const CONTRASENA_ADMIN = "password123";  // Cambia "password123" por tu contraseña segura
   ```

## Uso del Sistema

### Para Estudiantes (Vista Pública)
1. Accede a la URL de publicación del sistema (ver "Publicación" más abajo)
2. Verás una lista de todos los ejercicios disponibles
3. Puedes ver el nombre del ejercicio y descargarlo con el botón "Descargar"

### Para Pasantes/Administradores
1. Accede a la misma URL
2. Clic en el botón "Admin" en la esquina superior derecha
3. Ingresa las credenciales de administrador
4. Accede al panel donde puedes:
   - Subir nuevos ejercicios (nombre + archivo PDF)
   - Editar o eliminar ejercicios existentes
   - Ver estadísticas y descargas

## Publicación

Para hacer el sistema accesible públicamente:

1. En Google Apps Script, haz clic en "Publicar" en el menú superior
2. Selecciona "Publicar como aplicación web"
3. En la configuración:
   - **Ejecutar la aplicación como**: "Yo"
   - **Quién tiene acceso**: "Cualquiera" o "Usuarios de Google" según tu preferencia
4. Clic en "Publicar"
5. Copia la URL proporcionada y compártela con los estudiantes

## Seguridad

- El sistema almacena solo los archivos PDF en Google Drive
- Los metadatos (nombres, descargas, fechas) se guardan en Google Sheets
- Solo usuarios con credenciales pueden acceder al panel de administración
- Los archivos antiguos se envían a la papelera de Google Drive, no se eliminan permanentemente

## Personalización

Puedes personalizar:
- El diseño modificando el CSS en el archivo HTML
- Las credenciales de administración en el archivo de código
- El nombre de la carpeta en Drive cambiando `NOMBRE_CARPETA_DRIVE` en el código

## Solución de Problemas

**Error al subir archivos**: Verifica que estés usando archivos PDF y que no superen el tamaño máximo permitido.

**Problemas de autenticación**: Asegúrate de usar las credenciales correctas y que no haya espacios extra.

**URL no carga**: Verifica que hayas publicado correctamente la aplicación web y que la configuración de acceso sea adecuada.

## Licencia

Este proyecto es de código abierto y puede ser utilizado libremente para fines educativos.