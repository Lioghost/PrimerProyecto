const mongoose = require('mongoose')
const Usuarios = mongoose.model('Usuarios')
const {
    check,
    validationResult
} = require('express-validator');
const multer = require('multer')
const shortid = require('shortid')
//const uuid  //Con este modulo es posible generar un id mas único comparado con shortId

exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error) {  //Puede ser que en la subida se presente un error, por ejemplo el formato no es valido, por lo que es aqui donde se presentará el error
        if(error) {
            if(error instanceof multer.MulterError) {  //Revisa si el error fue por parte de multer   
                if(error.code === 'LIMIT_FILE_SIZE') {  //Debido a que se trata un error de multer, el tamaño del archivo es mayor al definido
                    req.flash('error', 'El archivo es muy grande: Máximo 100kb')
                } else {    //Puede ser que se presenten diferentes errores de multer, por ello se pone un else
                    req.flash('error', error.message)  //Igualmente siempre que se present ecualquier error 
                }
            } else {
                //console.log(error.message)  //Siempre que se generan errores con "new Error" se accede al mensaje con ".message"
                req.flash('error', error.message)
            }
            res.redirect('/administracion') //Evita que se ejecute el codigo que manda la alerta de cambios guardados, debido a un error de formato
            return;
        } else {
            return next(); //En caso de que no haya errores next() para que se vaya al siguiente middleware
        }
             
    });
}

//Opciones de multer
const configuracionMulter = {
    limits: {fileSize: 100000 },  //Corresponde a 100kbytes, debe ser la primera validación, para que asi en caso de cualquier error, pueda ser mostrado en las siguientes instrucciones que permiten errores
    storage: fileStorage = multer.diskStorage({  //Donde se van a almacenar los archivos que van subiendo
        destination: (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/perfiles')
        }, 
        filename: (req, file, cb) => {
           //file contiene la infomracion del archivo que se sube
            const extension = file.mimetype.split('/')[1];  //Se divide el mimetype y se extrae la extension de las imagenes          
            cb(null, `${shortid.generate()}.${extension}`)
        }
    }),
    fileFilter(req, file, cb) {
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ) {
            //el callback se ejecuta como true o false: true cuando la imagen se acepta
            cb(null, true); 
        } else {
            cb(new Error('Fromato No Válido'));
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');  //single() es el nombre del campo que se va a leer que va a contener el nombre del archivo

exports.formCrearCuenta = (req, res) => {

    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu Cuenta en devJobs',
        tagline: 'Comienza a Publicar tus Vacantes Gratis, solo debes crear una Cuenta'
    })
}

exports.validarRegistro = async (req, res, next) => {
    
    //Sanitizar los campos
    const rules = [
        check('nombre').notEmpty().withMessage('El nombre es obligatorio').escape(),
        check('email').isEmail().withMessage('El email es obligatorio').normalizeEmail(),
        check('password').isLength({min: 4}).withMessage('El password debe ser de al menos 4 caracteres'),
        check('confirmar').notEmpty().withMessage('No puede ir vacio confirmar contraseña').equals(req.body.password).withMessage('Los password no son iguales')
    ]

    await Promise.all(rules.map(validation => validation.run(req)))
    //console.log(req.body.nombre)
    let errores = validationResult(req)

    if(!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg))     //Se coloca array() debido a que "errores" es devuelto como objeto
        //console.log("erroressssssss", req.flash())
        res.render('crear-cuenta', {
            nombrePagina: 'Crea una cuenta en devJobs',
            tagline: 'Comienza a Publicar tus Vacantes Gratis, solo debes crear una Cuenta',
            mensajes: req.flash()   //"mensajes se colocaron en la pagina principal index, mediante la definición global de la funcion flash()"
        })
        //son pasados como un arreglo de objetos
        //Los mensajes se inyectan del validationResult se inyecta en flash(), en handlebars no es posible pasarlo directamente a la vista
        //como PUG, es necesario utilizar javascript puro, contrario a PUG que era posible utilizar Javascript directamente en la vista de PUG
        return;
    }

    //Si toda la validacion es correcta pasa al siguiente middleware
    next()
    //console.log(resultado)
}

exports.crearUsuario = async (req, res) => {

    //crear usuario
    const usuario = new Usuarios(req.body) 
    //console.log(usuario)

    //Este seria el sigueite middleware si hay o no hay error al guardar el usuario en DB en seccion post Usuarios
    try {  //try si todo se hace correcto, es decir si se guarda correctamente
        const nuevoUsuario = await usuario.save()
        res.redirect('/iniciar-sesion')
    } catch (error) {  //Es recibido el error definido en el Modelo Usuario.post, y es enviado a traves de flash()
        req.flash('error', error)
        res.redirect('crear-cuenta') //se redireje para nuevamente creen una cuenta con otro usuario
    }
    //Si no se crea el usuario 
    //if(!nuevoUsuario)
      //  return next()
}

// formulario para iniciar sesion
exports.formIniciarSesion = (req, res) => {
    res.render('iniciar-sesion', {
        nombrePagina : 'Iniciar Sesión devJobs'
    })
}

//Form Editar el perfil
exports.formEditarPerfil = (req, res) => {

    res.render('editar-perfil', {
        nombrePagina: 'Edita tu perfil en devJobs',
        usuario: req.user.toObject(),
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}

//Guardar cambios editar perfil
exports.editarPerfil = async (req, res) => {

    const usuario = await Usuarios.findById(req.user._id)

    usuario.nombre = req.body.nombre
    usuario.email = req.body.email
    if(req.body.password) {
        usuario.password = req.body.password
    }

    //console.log(req.file) //todos los archivos que se suben cion multer se accede a su informacion con req.file
    if(req.file) {
        usuario.imagen = req.file.filename
    }

    await usuario.save()
    //console.log(usuario)
    req.flash('correcto', 'Cambios guardados Correctamente')

    res.redirect('/administracion');
}

//Sanitizar y valida el formulario de editar perfiles
exports.validarPerfil = async (req, res, next) => {

    //Sanitizar / validar
    const rules = [
        check('nombre').notEmpty().withMessage('El nombre es obligatorio').escape(),
        check('email').isEmail().withMessage('El email es obligatorio').normalizeEmail()
    ]

    if(req.body.password)
        check('password').escape().run(req)

    await Promise.all(rules.map(validation => validation.run(req))) 
    //console.log(req.body.nombre)
    let errores = validationResult(req)

    if(!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg))     //Se coloca array() debido a que "errores" es devuelto como objeto
        //console.log("erroressssssss", req.flash())
        res.render('editar-perfil', {
            nombrePagina: 'Edita tu perfil en devJobs',
            usuario: req.user.toObject(),
            cerrarSesion: true,
            nombre: req.user.nombre,
            mensajes: req.flash(),
            imagen: req.user.imagen
        })
    }

    next()  //Todo bien, pasa al siguiente middleware
}