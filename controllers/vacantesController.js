//const Vacante = require('../models/Vacante') se puede exporta de esta manera
const mongoose = require('mongoose') //Debido a que mongoose guarda la referencia de la instacia de mongoose, se puede importar 
const Vacante = mongoose.model('Vacante')
const {
    check,
    validationResult
} = require('express-validator');
const multer = require('multer')
const shortid = require('shortid');

/*Al pasar al helper para renderizar condicionalmente un bloque, si su argumento returna false, undefined, null
"", 0, [] y {}, handlebars no renderizara el bloque, se entiende que sucelo mismo para cuaquier helper, en este caso seleccionarSkills*/
exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        s: [],  
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}

//Agrega las vacantes a la base de datos
exports.agregarVacante = async (req, res) => {
    const vacante = new Vacante(req.body) //De esa forma se mapean automaticamente los campos con las instancia y todo se llena bien
    //console.log(req.body)

    //Usuario autor de la vacante, corresponde al usuario autenticado, passport agrega la propiedad "user" correspondiente al usuario, independientemente del nombre asignado, passport internamente lo nombra como "user" usando el middleware "verificarUsuario" 
    vacante.autor = req.user._id

    //Crear arreglo de habilidades (skills), se hace un pequeño cambio antes de almacernarlo en la BD
    vacante.skills = req.body.skills.split(',');

    //Almacenarlo en la BD
    const nuevaVacante = await vacante.save()

    //Redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`)  //Se redirecciona hacia la vacante y podrla ver
}

//muestra una vacante
exports.mostrarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({url: req.params.url}).populate('autor').lean() //Debido a que se esta filtrando por url, se usa findOne
    /*De forma predeterminada, las consultas de Mongoose devuelven una instancia de la clase Mongoose Document . Los documentos son mucho más pesados
    ​​que los objetos JavaScript vanilla, porque tienen mucho estado interno para el seguimiento de cambios. Habilitar la opción lean le dice a 
    Mongoose que omita la creación de instancias de un documento completo de Mongoose y le dé el POJO.*/

    //Se coloca .populate("autor") para relacionar la table de usuario y vacante de acuerdo al autor de la vacante, se le dice donde va a encontrar el id, y ese autor se encarga de buscar el id

    console.log(vacante)

    //si no hay resultados
    if(!vacante) {
        return next()
    }

    res.render('vacante', {
        vacante,
        nombrePagina: vacante.titulo,
        barra: true
    })
}

exports.formEditarVacante = async (req, res, next) => {

    const vacante = await Vacante.findOne({url: req.params.url}).lean();

    //console.log(vacante.skills)

    if(!vacante)
        return next()

    res.render('editar-vacante', {
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })  
}

exports.editarVacante = async (req, res) => {

    const vacanteActualizada = req.body;

    vacanteActualizada.skills = vacanteActualizada.skills.split(',')

    const vacante = await Vacante.findOneAndUpdate({url: req.params.url}, vacanteActualizada, {
        new: true,   //Se trae el documento nuevo, el nuevo valor
        runValidators: true  //Para que todo lo que se puso en el modelo lo tome
    });

    res.redirect(`/vacantes/${vacante.url}`)
}

//Validar y sanitizar los campos de las nuevas vacantes
exports.validarVacante = async (req, res, next) => {

    //sanitizar los campos
    check('salario').escape()
    const rules = [
        check('titulo').notEmpty().withMessage('Agrega un titulo a la Vacante').escape(),
        check('empresa').notEmpty().withMessage('Agrega una Empresa').escape(),
        check('ubicacion').notEmpty().withMessage('Agrega una Ubicación').escape(),
        check('contrato').notEmpty().withMessage('Selecciona el tipo de contrato').escape(),
        check('skills').notEmpty().withMessage('Agrega al menos una Habilidad')
    ]

    await Promise.all(rules.map(validation => validation.run(req)))
    //console.log(req.body.nombre)
    let errores = validationResult(req)

    if(!errores.isEmpty()) {
        req.flash('error', errores.array().map(error => error.msg))     //Se coloca array() debido a que "errores" es devuelto como objeto
        //console.log("erroressssssss", req.flash())
        res.render('nueva-vacante', {
            nombrePagina: 'Nueva Vacante',
            tagline: 'Llena el formulario y publica tu vacante',
            mensajes: req.flash(),   //"mensajes se colocaron en la pagina principal index, mediante la definición global de la funcion flash()"
            cerrarSesion: true,
            nombre: req.user.nombre
        })
        //son pasados como un arreglo de objetos
        //Los mensajes se inyectan del validationResult se inyecta en flash(), en handlebars no es posible pasarlo directamente a la vista
        //como PUG, es necesario utilizar javascript puro, contrario a PUG que era posible utilizar Javascript directamente en la vista de PUG
        return;
    }

    next()  //Siguiente middleware
}

//Eliminar Vacante
exports.eliminarVacante = async (req, res) => {

    const { id } = req.params   //Extrae el parametro "id" proveniente de la ejecución de axios de "accionesListado" en app.js para eliminar una vacante

    const vacante = await Vacante.findById(id)   //Con el id se extrae la vacante completa de la BD

    if(verificarAutor(vacante, req.user)) {  //pasamos la vacante que estamos consultando y tomamos la sesion actual del usuario y se pasa para comparar si pertenecen al mismo autor
        //Todo bien, si es el usuario, eliminar

        //console.log(id)  Recibe la url y extrae el id
        vacante.remove()
        res.status(200).send('Vacante Eliminada Correctamente')  //Dvuelve una respuesta a axios del lado del cliente en "accionesListado"
    } else {
        //no permitido
        res.status(403).send('Error')
    }

    
}

const verificarAutor = (vacante = {}, usuario = {}) => {  //Se coloca como objeto vacio por defecto para el caso de que se llame al metodo y no haya un usuario
    if(!vacante.autor.equals(usuario._id)) { //Si el autor de la vacante no es igual al usuario de la cuanta logueada
        return false
    } else {
        return true
    }
}


//Subir archivos en PDF
exports.subirCV = (req, res, next) => {
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
            res.redirect('back') //si hay un error o algo asi, back los regresa a la pagina donde se origino el error
            return;
        } else {
            return next(); //En caso de que no haya errores next() para que se vaya al siguiente middleware
        }
             
    });
}

//Opciones de multer
const configuracionMulter = {
    limits: {fileSize: 200000 },  //Corresponde a 100kbytes, debe ser la primera validación, para que asi en caso de cualquier error, pueda ser mostrado en las siguientes instrucciones que permiten errores
    storage: fileStorage = multer.diskStorage({  //Donde se van a almacenar los archivos que van subiendo
        destination: (req, file, cb) => {
            cb(null, __dirname+'../../public/uploads/cv')
        }, 
        filename: (req, file, cb) => {
           //file contiene la infomracion del archivo que se sube
            const extension = file.mimetype.split('/')[1];  //Se divide el mimetype y se extrae la extension de las imagenes          
            cb(null, `${shortid.generate()}.${extension}`)
        }
    }),
    fileFilter(req, file, cb) {
        if(file.mimetype === 'application/pdf') {
            //el callback se ejecuta como true o false: true cuando la imagen se acepta
            cb(null, true); 
        } else {
            cb(new Error('Fromato No Válido'));
        }
    }
}

const upload = multer(configuracionMulter).single('cv');  //single() es el nombre del campo que se va a leer que va a contener el nombre del archivo

//ALmacenar los cadidatos en la BD
exports.contactar = async (req, res, next) => {

    const vacante = await Vacante.findOne({url: req.params.url})

    //Si no existe la vacante
    if(!vacante) {
        return next()
    }

    //Si todo esta bien, contruir el nuevo objeto
    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file.filename
    }

    //Almacenar la vacante
    vacante.candidatos.push(nuevoCandidato);
    await vacante.save()

    //mensaje flash y redireccion
    req.flash('correcto', 'Se envió tu CV Correctamente')
    res.redirect('/')
}

exports.mostrarCandidatos = async (req, res, next) => {

    //console.log(req.params.id)
    const vacante = await Vacante.findById(req.params.id).lean()

    //Se valida que el autor es igual a la persona logueada, recodar que el "req.user._id" corresponde a un object
    if(vacante.autor != req.user._id.toString()) {
        return next();
    }

    //Si no hay no vacante
    if(!vacante)
        return next();

    res.render('candidatos', {
        nombrePagina: `Candidatos Vacante - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        candidatos: vacante.candidatos
    })
}

exports.buscarVacantes = async (req, res) => {
    
    const vacantes = await Vacante.find({
        $text: {
            $search: req.body.q
        }
    }).lean()
    
    res.render('home', {
        nombrePagina: `Resultados para la búsqueda: ${req.body.q}`,
        barra: true,
        vacantes
    })
}