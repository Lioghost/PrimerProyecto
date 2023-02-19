const mongoose = require('mongoose') //Debido a que mongoose guarda la referencia de la instacia de mongoose, se puede importar 
const Vacante = mongoose.model('Vacante')

exports.mostrarTrabajos = async (req, res, next) => {

    const vacantes = await Vacante.find().lean();  //Trae todos los resultados que se tengan en la base de datos
    //console.log("soy la vacante", vacantes)
    if(!vacantes)    //Si no hay vacantes return next
        return next();

    res.render('home', {
        nombrePagina: 'devJobs',
        tagline: 'Encuentra y Pública Trabajos para Desarrolladores Web',
        barra: true,
        boton: true,
        vacantes
    })
}