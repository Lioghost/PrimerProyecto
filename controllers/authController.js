//Autenticacion y cerrar sesión estarán en esta parte

const passport = require("passport");
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const Usuarios = mongoose.model('Usuarios');
const crypto = require('crypto')  //Ya forma parte de express
const enviarEmail = require('../handlers/email')

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,   /*Cuando haya un error permite utilizar flash(), de alguna manera los message definidos en passports.js internamente son
    son nombrados como "error" de manera interna, independientemente del nombre "message", la opcion anterior permite habilitar el uso de flash() para enviar estos 
    mensajes a la vista, se debe recordar que se ha definido globalmente el uso de flash(), para que cualquier vista pueda acceder a las variables 
    definidas que continen algun "mensaje", de este modo al haber definido el middleware con la siguiente instruccion "res.locals.mensajes = req.flash()"
    se asigna el valor de "message" a req.locals.mensajes y dado que no se trata de un arreglo vacio, se renderiza la vista de hanlebars que mostrara el mensaje*/
    badRequestMessage: 'Ambos campos son obligatorios'
})

//Revisar si el usuario esta autenticado o no
exports.verificarUsuario = (req, res, next) => {

    //revisar el usuario
    if(req.isAuthenticated()) { //Corresponde a un método de passport en el cual almacena y devuelve "true"/"false" si el usuario esta autenticado
        return next()  //Si el usuario esta autenticado para que se vaya al siguiente middleware 
    }

    //redireccionar
    res.redirect('/iniciar-sesion')
}

exports.mostrarPanel = async (req, res) => {
    
    //consultar el usuario autenticado
    
    const vacantes = await Vacante.find({autor: req.user._id}).lean()
    //console.log(vacantes)

    res.render('administracion', {
        nombrePagina: 'Panel de Administración',
        tagline: 'Crea y Administra tus vacantes desde aquí',
        vacantes,
        imagen: req.user.imagen,
        cerrarSesion: true,   //Se pasa para crear boton de cerrar sesión
        nombre: req.user.nombre     //Se pasa nombre de usuario a panel para identificar al usuario
    })
}

exports.cerrarSesion = (req, res, next) => {
    req.logout(function(err) {
        if (err) { 
            return next(err) }})       //Se utiliza este metodo para cerrar sesión
    req.flash('correcto', 'Cerraste Sesión Correctamente')
    return res.redirect('/iniciar-sesion')
}

//Formulario para reinicia el Password
exports.formReestablecerPassword = (req, res) => {

    res.render('reestablecer-password', {
        nombrePagina: 'Reestablece tu Password',
        tagline: 'Si ya tienes una cuenta pero olvidaste tu password, coloca tu email'
    })
}

//Genera el token
exports.enviarToken = async (req, res) => {

    const usuario = await Usuarios.findOne({email: req.body.email})

    if(!usuario) {
        req.flash('error', 'No existe esa cuenta');
        return res.redirect('/iniciar-sesion')
    }

    //El usuario existe generar token
    usuario.token = crypto.randomBytes(20).toString('hex') //Nos ayuda a generar un token automaticamente sin necesidad de escribir nada de código
    usuario.expira = Date.now() + 3600000

    //Guardar el usuario
    await usuario.save()
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`

    //TODO: Enviar notificacion por email
    //const r = enviarEmail.enviar({
    await enviarEmail.enviar({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo: 'reset'   //Corresponde al template a usar para los email enviados
    })

    //console.log(r)
    //return
    req.flash('correcto', 'Revisa tu email para las indicaciones')
    res.redirect('/iniciar-sesion')

}

//Valida si el token es valido y el usuario existe, muestra la vista
exports.reestablecerPassword = async (req, res) => {

    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });

    if(!usuario) {
        req.flash('error', 'El formulario ya no es válido, intenta de nuevo')
        return res.redirect('/reestablecer-password');
    }

    //Todo bien, mostrar el formulario
    res.render('nuevo-password', {
        nombrePagina: 'Nuevo Password'
    })
}

//Almacena el nuevo password en la BD
exports.guardarPassword = async (req, res) => {

    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()  //Se verifica que el token sea valido, que no sea mayor a la hora de expiracion definida
        }
    });

    //no existe el usuario o el token ya es invalido
    if(!usuario) {
        req.flash('error', 'El formulario ya no es válido, intenta de nuevo')
        return res.redirect('/reestablecer-password');
    }

    //Asignar nuevo password, limpiar valores previos
    usuario.password = req.body.password;
    usuario.token = undefined
    usuario.expira = undefined;

    //Agregar y eliminar valores del objeto
    await usuario.save()

    req.flash('correcto', 'Password Modificado Correctamente')
    res.redirect('/iniciar-sesion')
}