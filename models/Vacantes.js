const mongoose = require('mongoose')
mongoose.Promise = global.Promise  //Puede no ser necesario, se coloca para que las respuestas de mongoose sean promesas
const slug = require('slug') //Para que nos genere las url´s
const shortid = require('shortid')

/*slug se encarga de hacer react-developer de una vacante React Developer si esta esta disponible, asi mismo puede
haber muchas vacantes, por lo que shortid nos crea un id unico*/

//El esquema define todos los campos que tendrá la base de datos
const vacantesSchema = new mongoose.Schema({
    titulo: {
        type: String,
        requiered: 'El nombre de la vacante es obligatorio',
        trim: true  //trim elimina los espacios innecesarios de los datos de entrada
    },
    empresa: {
        type: String,
        trim: true
    },
    ubicacion: {
        type: String,
        trim: true,
        required: 'La ubicación es obligatoria'
    },
    salario: {
        type: String,
        default: 0
    },
    contrato: {
        type: String,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    url: {      //La url se genera utilizando shortid y slug
        type: String,
        lowercase: true  //Comversion a minusculas
    },
    skills: [String],
    candidatos: [{          //Arreglo de objetos
        nombre: String,
        email: String,
        cv: String
    }],
    autor: {
        type: mongoose.Schema.ObjectId,   //De esta manera se hace una relacion a los otros modelos, un poco distinto a sequalize
        ref: 'Usuarios',
        required: 'El autor es obligatorio'
    }
})

//Corresponde a un hook, se usa "pre" similar a sequalize para alamacenar antes de que guardara en la BD
//Se conoce "save" --> "antes de guardar", se conoce como middleware existen otros en la pg
vacantesSchema.pre('save', function(next) {

    //Crear la url
    const url = slug(this.titulo);
    this.url = `${url}-${shortid.generate()}`

    //React Developer  --> react-developer-123456

    next()
})

//Crear un Indice   Ayuda mas rapidas las busquedas
vacantesSchema.index({titulo: 'text'})  //Crea como indice el titulo


module.exports = mongoose.model('Vacante', vacantesSchema);