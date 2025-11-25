// Configuración del sistema
// NOTA: El sistema creará automáticamente la hoja de cálculo y carpeta en Drive si no existen
const HOJA_EJERCICIOS = "Ejercicios";
const NOMBRE_CARPETA_DRIVE = "Ejercicios_Academicos"; // Nombre de la carpeta en Google Drive
const USUARIO_ADMIN = "admin";
const CONTRASENA_ADMIN = "password123"; // Cambiar por una contraseña segura

// Variables para almacenar temporalmente los IDs
let SPREADSHEET_ID = null;
let CARPETA_DRIVE_ID = null;

// Función para obtener o crear la hoja de cálculo
function getSpreadsheet() {
  if (SPREADSHEET_ID === null) {
    // Buscar una hoja de cálculo existente
    const archivos = DriveApp.getFilesByName("EjerciciosAcademicos_DB");
    if (archivos.hasNext()) {
      const archivo = archivos.next();
      SPREADSHEET_ID = archivo.getId();
    } else {
      // Crear una nueva hoja de cálculo
      const ss = SpreadsheetApp.create("EjerciciosAcademicos_DB");
      SPREADSHEET_ID = ss.getId();
    }
  }
  
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

// Función para obtener o crear la carpeta en Drive
function getCarpetaDrive() {
  if (CARPETA_DRIVE_ID === null) {
    // Buscar carpeta existente
    const carpetas = DriveApp.getFoldersByName(NOMBRE_CARPETA_DRIVE);
    if (carpetas.hasNext()) {
      const carpeta = carpetas.next();
      CARPETA_DRIVE_ID = carpeta.getId();
    } else {
      // Crear nueva carpeta
      const carpeta = DriveApp.createFolder(NOMBRE_CARPETA_DRIVE);
      CARPETA_DRIVE_ID = carpeta.getId();
    }
  }
  
  return DriveApp.getFolderById(CARPETA_DRIVE_ID);
}

// Página principal que se carga para todos los usuarios
function doGet() {
  try {
    // Inicializar sistema si es necesario
    inicializarSistema();
    
    return HtmlService.createHtmlOutputFromFile("Ejercicios_Index")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .setTitle("Plataforma de Ejercicios Académicos");
  } catch (error) {
    return HtmlService.createHtmlOutput(`
      <div style="padding: 20px; font-family: Arial; text-align: center;">
        <h2 style="color: #dc3545;">Error del Sistema</h2>
        <p>No se pudo cargar la aplicación: ${error.message}</p>
        <button onclick="window.location.reload()">Reintentar</button>
      </div>
    `);
  }
}

// Función de autenticación para el panel de administración
function autenticar(usuario, contrasena) {
  try {
    if (!usuario || !contrasena) {
      return { autenticado: false, mensaje: "Usuario y contraseña son requeridos" };
    }
    
    if (usuario === USUARIO_ADMIN && contrasena === CONTRASENA_ADMIN) {
      return { autenticado: true, mensaje: "Autenticación exitosa" };
    } else {
      return { autenticado: false, mensaje: "Credenciales incorrectas" };
    }
  } catch (error) {
    console.error("Error en autenticación:", error);
    return { autenticado: false, mensaje: "Error en la autenticación: " + error.message };
  }
}

// Función para subir un ejercicio (archivo + información)
function subirEjercicio(datos) {
  try {
    if (!datos || !datos.nombre || !datos.archivoBase64 || !datos.tipoArchivo || !datos.nombreOriginal) {
      return { exito: false, mensaje: "Datos incompletos para subir ejercicio" };
    }
    
    // Validar tipo de archivo (solo PDF)
    if (datos.tipoArchivo !== 'application/pdf') {
      return { exito: false, mensaje: "Solo se permiten archivos PDF" };
    }
    
    // Validar nombre del ejercicio
    if (datos.nombre.trim().length < 2) {
      return { exito: false, mensaje: "El nombre del ejercicio debe tener al menos 2 caracteres" };
    }
    
    const ss = getSpreadsheet();
    let hoja = ss.getSheetByName(HOJA_EJERCICIOS);
    
    // Crear la hoja si no existe
    if (!hoja) {
      hoja = ss.insertSheet(HOJA_EJERCICIOS);
      hoja.appendRow(["ID", "Nombre", "Nombre Archivo Original", "URL Drive", "Fecha Subida", "Tamaño", "Descargas"]);
      hoja.getRange(1, 1, 1, 7).setBackground("#5DADE2").setFontColor("white").setFontWeight("bold");
    }
    
    // Crear archivo en Google Drive
    const carpeta = getCarpetaDrive();
    const blob = Utilities.newBlob(Utilities.base64Decode(datos.archivoBase64), datos.tipoArchivo, datos.nombreOriginal);
    const archivoDrive = carpeta.createFile(blob);
    
    // Generar ID único para el ejercicio
    const idEjercicio = "EJ" + Date.now();
    
    // Agregar registro a la hoja de cálculo
    hoja.appendRow([
      idEjercicio,
      datos.nombre.trim(),
      datos.nombreOriginal,
      archivoDrive.getUrl(),
      new Date(),
      datos.tamano || archivoDrive.getSize(),
      0 // Contador de descargas inicial
    ]);
    
    return { 
      exito: true, 
      mensaje: "Ejercicio subido exitosamente", 
      id: idEjercicio,
      url: archivoDrive.getUrl()
    };
    
  } catch (error) {
    console.error("Error en subirEjercicio:", error);
    return { exito: false, mensaje: "Error al subir ejercicio: " + error.message };
  }
}

// Función para obtener todos los ejercicios
function obtenerEjercicios() {
  try {
    const ss = getSpreadsheet();
    const hoja = ss.getSheetByName(HOJA_EJERCICIOS);
    
    if (!hoja) {
      return [];
    }
    
    const datos = hoja.getDataRange().getValues();
    
    if (datos.length <= 1) {
      return [];
    }
    
    const ejercicios = [];
    
    // Saltar el encabezado (índice 0) y empezar desde índice 1
    for (let i = 1; i < datos.length; i++) {
      const fila = datos[i];
      if (fila[0]) { // Si tiene ID
        ejercicios.push({
          id: fila[0],
          nombre: fila[1],
          nombreOriginal: fila[2],
          url: fila[3],
          fechaSubida: fila[4] instanceof Date ? Utilities.formatDate(fila[4], Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm") : fila[4],
          tamano: fila[5],
          descargas: fila[6] || 0
        });
      }
    }
    
    return ejercicios;
  } catch (error) {
    console.error("Error en obtenerEjercicios:", error);
    return [];
  }
}

// Función para eliminar un ejercicio
function eliminarEjercicio(id) {
  try {
    if (!id) {
      return { exito: false, mensaje: "ID de ejercicio no proporcionado" };
    }
    
    const ss = getSpreadsheet();
    const hoja = ss.getSheetByName(HOJA_EJERCICIOS);
    
    if (!hoja) {
      return { exito: false, mensaje: "No se encontró la hoja de ejercicios" };
    }
    
    const datos = hoja.getDataRange().getValues();
    
    for (let i = 1; i < datos.length; i++) {
      if (datos[i][0] === id) {
        // Obtener la URL del archivo para eliminarlo de Drive
        const urlDrive = datos[i][3];
        if (urlDrive) {
          try {
            const archivoId = urlDrive.split('/')[5]; // Extraer ID del archivo de la URL
            const archivoDrive = DriveApp.getFileById(archivoId);
            archivoDrive.setTrashed(true); // Mandar a papelera en lugar de eliminar permanentemente
          } catch (driveError) {
            console.warn("No se pudo eliminar el archivo de Drive:", driveError.message);
          }
        }
        
        hoja.deleteRow(i + 1); // i+1 porque getDataRange incluye el encabezado
        return { exito: true, mensaje: "Ejercicio eliminado exitosamente" };
      }
    }
    
    return { exito: false, mensaje: "Ejercicio no encontrado" };
  } catch (error) {
    console.error("Error en eliminarEjercicio:", error);
    return { exito: false, mensaje: "Error al eliminar ejercicio: " + error.message };
  }
}

// Función para actualizar un ejercicio
function actualizarEjercicio(datos) {
  try {
    if (!datos || !datos.id || !datos.nombre) {
      return { exito: false, mensaje: "ID y nombre son requeridos para actualizar ejercicio" };
    }
    
    if (datos.nombre.trim().length < 2) {
      return { exito: false, mensaje: "El nombre del ejercicio debe tener al menos 2 caracteres" };
    }
    
    const ss = getSpreadsheet();
    const hoja = ss.getSheetByName(HOJA_EJERCICIOS);
    
    if (!hoja) {
      return { exito: false, mensaje: "No se encontró la hoja de ejercicios" };
    }
    
    const datosHoja = hoja.getDataRange().getValues();
    
    for (let i = 1; i < datosHoja.length; i++) {
      if (datosHoja[i][0] === datos.id) {
        // Actualizar solo el nombre
        hoja.getRange(i + 1, 2).setValue(datos.nombre.trim());
        
        // Si se proporciona archivo nuevo, actualizarlo
        if (datos.archivoBase64 && datos.tipoArchivo && datos.nombreArchivo) {
          if (datos.tipoArchivo !== 'application/pdf') {
            return { exito: false, mensaje: "Solo se permiten archivos PDF" };
          }
          
          // Eliminar archivo anterior de Drive
          try {
            const urlAnterior = datosHoja[i][3];
            if (urlAnterior) {
              const archivoId = urlAnterior.split('/')[5];
              const archivoAnterior = DriveApp.getFileById(archivoId);
              archivoAnterior.setTrashed(true);
            }
          } catch (e) {
            console.warn("No se pudo eliminar archivo anterior:", e.message);
          }
          
          // Subir nuevo archivo
          const carpeta = getCarpetaDrive();
          const blob = Utilities.newBlob(Utilities.base64Decode(datos.archivoBase64), datos.tipoArchivo, datos.nombreArchivo);
          const nuevoArchivoDrive = carpeta.createFile(blob);
          
          // Actualizar URL en la hoja
          hoja.getRange(i + 1, 4).setValue(nuevoArchivoDrive.getUrl());
          hoja.getRange(i + 1, 3).setValue(datos.nombreArchivo);
        }
        
        return { exito: true, mensaje: "Ejercicio actualizado exitosamente" };
      }
    }
    
    return { exito: false, mensaje: "Ejercicio no encontrado" };
  } catch (error) {
    console.error("Error en actualizarEjercicio:", error);
    return { exito: false, mensaje: "Error al actualizar ejercicio: " + error.message };
  }
}

// Función para registrar una descarga
function registrarDescarga(id) {
  try {
    if (!id) {
      return { exito: false, mensaje: "ID de ejercicio no proporcionado" };
    }
    
    const ss = getSpreadsheet();
    const hoja = ss.getSheetByName(HOJA_EJERCICIOS);
    
    if (!hoja) {
      return { exito: false, mensaje: "No se encontró la hoja de ejercicios" };
    }
    
    const datos = hoja.getDataRange().getValues();
    
    for (let i = 1; i < datos.length; i++) {
      if (datos[i][0] === id) {
        const nuevasDescargas = (datos[i][6] || 0) + 1;
        hoja.getRange(i + 1, 7).setValue(nuevasDescargas);
        return { exito: true, descargas: nuevasDescargas };
      }
    }
    
    return { exito: false, mensaje: "Ejercicio no encontrado" };
  } catch (error) {
    console.error("Error en registrarDescarga:", error);
    return { exito: false, mensaje: "Error al registrar descarga: " + error.message };
  }
}

// Función para inicializar las hojas
function inicializarSistema() {
  try {
    const ss = getSpreadsheet();
    
    let hoja = ss.getSheetByName(HOJA_EJERCICIOS);
    if (!hoja) {
      hoja = ss.insertSheet(HOJA_EJERCICIOS);
    }
    
    if (hoja.getLastRow() === 0) {
      const encabezados = [["ID", "Nombre", "Nombre Archivo Original", "URL Drive", "Fecha Subida", "Tamaño", "Descargas"]];
      hoja.getRange(1, 1, 1, 7).setValues(encabezados);
      const headerRange = hoja.getRange(1, 1, 1, 7);
      headerRange.setBackground("#5DADE2").setFontColor("white").setFontWeight("bold");
      
      hoja.autoResizeColumns(1, 7);
    }
    
    // Asegurar que se crea la carpeta en Drive
    getCarpetaDrive();
    
    return "Sistema inicializado correctamente";
  } catch (error) {
    console.error("Error en inicializarSistema:", error);
    return "Error al inicializar sistema: " + error.message;
  }
}

// Función para obtener información de un ejercicio específico
function obtenerEjercicioPorId(id) {
  try {
    if (!id) {
      return null;
    }
    
    const ss = getSpreadsheet();
    const hoja = ss.getSheetByName(HOJA_EJERCICIOS);
    
    if (!hoja) {
      return null;
    }
    
    const datos = hoja.getDataRange().getValues();
    
    for (let i = 1; i < datos.length; i++) {
      if (datos[i][0] === id) {
        return {
          id: datos[i][0],
          nombre: datos[i][1],
          nombreOriginal: datos[i][2],
          url: datos[i][3],
          fechaSubida: datos[i][4] instanceof Date ? Utilities.formatDate(datos[i][4], Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm") : datos[i][4],
          tamano: datos[i][5],
          descargas: datos[i][6] || 0
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error en obtenerEjercicioPorId:", error);
    return null;
  }
}