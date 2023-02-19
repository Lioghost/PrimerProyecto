
const express = require('express')
const router = express.Router()
const homeController = require('../controllers/homeControlles.js')
const vacantesController = require('../controllers/vacantesController.js')
const usuariosController = require('../controllers/usuariosController')
const authController = require('../controllers/authController')
//const mostrarVacante

module.exports = () => {
    router.get('/', homeController.mostrarTrabajos)

    //Crear Vacantes
    router.get('/vacantes/nueva', 
        authController.verificarUsuario,    //Permite verificar al usuario que haya iniciado sesion, si pasa la verificacion pasa al siguiente middleware y muestra el formulario 
        vacantesController.formularioNuevaVacante
    )
    router.post('/vacantes/nueva', 
        authController.verificarUsuario,
        vacantesController.validarVacante,
        vacantesController.agregarVacante
    );

    //Mostar Vacante (Singular)
    router.get('/vacantes/:url', vacantesController.mostrarVacante);

    //Editar vacante
    router.get('/vacantes/editar/:url', 
        authController.verificarUsuario,
        vacantesController.formEditarVacante
    );
    router.post('/vacantes/editar/:url', 
        authController.verificarUsuario,
        vacantesController.validarVacante,
        vacantesController.editarVacante
    );

    //Eliminar vacantes
    router.delete('/vacantes/eliminar/:id',
        vacantesController.eliminarVacante
    )

    //Crear Cuentas
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta',
            usuariosController.validarRegistro,
            usuariosController.crearUsuario
    );

    //Autenticar Usuarios
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);

    //Resetear password (emails)
    router.get('/reestablecer-password', authController.formReestablecerPassword)
    router.post('/reestablecer-password', authController.enviarToken);

    //Resetear Password (Almacenar en la BD)
    router.get('/reestablecer-password/:token', authController.reestablecerPassword)
    router.post('/reestablecer-password/:token', authController.guardarPassword)

    //Cerrar sesión
    router.get('/cerrar-sesion',
        authController.verificarUsuario,
        authController.cerrarSesion    
    );

    //Panel de administración
    router.get('/administracion', 
        authController.verificarUsuario,
        authController.mostrarPanel
    );

    //Editar Perfil
    router.get('/editar-perfil', 
        authController.verificarUsuario,
        usuariosController.formEditarPerfil
    );
    router.post('/editar-perfil',
        authController.verificarUsuario,
        //usuariosController.validarPerfil,
        usuariosController.subirImagen,
        usuariosController.editarPerfil  
    );

    //Recibir Mensajes de Candidatos
    router.post('/vacantes/:url',
        vacantesController.subirCV,
        vacantesController.contactar    
    )

    //Muestra los candidatos por vacante
    router.get('/candidatos/:id',
        authController.verificarUsuario,
        vacantesController.mostrarCandidatos
    )

    //Buscador de vacantes
    router.post('/buscador', vacantesController.buscarVacantes);

    return router
}
