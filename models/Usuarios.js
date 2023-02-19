/*mongoose va a almacenar una sola referencia para todo, modelos, conexion, etc, se conoce como singleton, es decir
solo una instancia de mongoose en todo el proyecto*/
const mongoose = require('mongoose')
mongoose.Promise = global.Promise  //Puede no ser necesario, se coloca para que las respuestas de mongoose sean promesas
const bcrypt = require('bcrypt')

const usuariosSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true, //para que todo se almacene en minusculas
        trim: true   //Evitar espacios al inicio o final  
    },
    nombre: {
        type: String,
        required: true   //Es un validador
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    token: String,
    expira: Date,
    imagen: String
})

//Metodo para hashear  los passwords
usuariosSchema.pre('save', async function(next) {
    //Si el passwrod ya esta hasheado
    if(!this.isModified('password'))  //isModified es un metodo propio de mongoose, si el passwrod ya esta hasheado, deten la ejecución this hace referencia a todos los datos 
        return next()

    //si no esta hasheado
    const hash = await bcrypt.hash(this.password, 12)
    this.password = hash;
    //next() //para que termine de ejecutar la funcion y avance hacia el siguiente middleware
});

//Envia alerta cuando un usuario ya esta registrado
usuariosSchema.post('save', function(error, doc, next) {  //"corresponde al documento actual, se deben pasar los tres", "post" previene que se agregue el registro a MongoDB
    //console.log("erorrrrrrrrrrrrr", error.name)
    if(error.name === 'MongoServerError' && error.code === 11000) {  //Cuando se presente ese error especifico
        next('Ese correo ya esta registrado')   //Es lanzado este mensaje como "error" en lugar del error lanzado originalmente, es recibido en usuarioController, donde continuara el flujo de datos en "crearUsuarios" 
    } else {
        next(error); //Es importante colocar next(error) porque pueden pasar muchos errores y tal vez el error que sucede no es de este código y no se quiere que detenga la ejecucion del programa
        //Se le da next a este error para que se siga ejecutando el middleware con los errores como sucedan
    }
});

//Autenticar Usuarios
//En el caso de sequalize se usaba prototype, para el caso de mongo se usa methods
usuariosSchema.methods = {
    compararPassword: function(password) {
        return bcrypt.compareSync(password, this.password) //Compara el password pasado y retorna "true" o "false"
    }
}

module.exports = mongoose.model('Usuarios', usuariosSchema)