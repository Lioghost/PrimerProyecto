const mongoose = require('mongoose')
require('dotenv').config({path: 'variables.env'})

mongoose.connect(process.env.DATABASE, {useNewUrlParser: true})

mongoose.connection.on('error', (error) => {
    console.log(error);
})

//Importar modelos, se pueden importar cuantos modelos se deseen y se agregaran a la conexion de la base de datos
require('../models/Vacantes')
require('../models/Usuarios')