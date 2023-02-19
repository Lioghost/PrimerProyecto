const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy  //Strategy conrresponde a un modo de autenticación
const mongoose = require('mongoose')
const Usuarios = mongoose.model('Usuarios')


passport.use(new LocalStrategy({  //Primero se define el campo para el usuario, passport espera un campo de usuario para validar
    usernameField: 'email',
    passwordField: 'password'
    }, async (email, password, done) => { //Esta funcion interactua con la BD, pasa el email, pass del form aqui, done se puede entender como "next", es una callback
        const usuario = await Usuarios.findOne({email})
        if(!usuario)
            return done(null, false, {  //parametros: done(error, usuarios no hay, opciones)
                message: 'Usuario No Existente'  //Se envia mensaje a usuario 
            });  //
            
            //el usuario existe, vamos a verificarlo
            //Debido a que ya tenemos una instancia del usuario es posble utilizar el metodo creado para verificar el password
            const verificarPass = usuario.compararPassword(password)
            if(!verificarPass) {
                return done(null, false, {
                    message: 'Password Incorrecto'  //passport le agrega el nombre de "error" para flash(), debido a eso no hubo problema ni tampoco se
                    //se tuvo que realizar alguna modificacion para que fuera posible mostrar el error en la vista, ya que desde el principio los 
                    //mensajes anteriores se nombraron como "error"
                })
            }

            //Usuario es correcto y el password es correcto
            return done(null, usuario);  //Se retorna done(ningun error, el usuario encontrado)
    }))

//Igual como en Sequalize se colocan las funciones serealizeUser, son funcioes propias de passport, 
passport.serializeUser((usuario, done) => done(null, usuario._id)) //done(no toma nigun error, si toma el usuarioID)

passport.deserializeUser(async (id, done) => {  //Ayuda a comprobar que vez que el usuario esta navegando a través de su id, si ese usuario tiene permisos o si existe 
    const usuario = await Usuarios.findById(id);
    return done(null, usuario)
})

module.exports = passport;