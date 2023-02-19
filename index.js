const mongoose = require('mongoose')
require('./config/db') //Importa la conexion en el archivo principal
const express = require('express')
const exphbs = require('express-handlebars')
//const path = require('path')   //Se encarga de especificar si estamos en windows/linux/mac y se encarga de concatenar los directorios, ya sea "/" o "\"
const router = require('./routes/indexRoutes')
const cookieParser = require('cookie-parser')
const session = require('express-session') //Nos permite guardar pequeños datos en la memoria del servidor y reutilizarlo en multiples paginas,
//Por lo general esto se utiliza cuando queremos loguear un usuario y queremos compartir ese logueo en tre multiples paginas
//Es simplemente un objeto que podemos compartir en todas estas paginas
const MongoStore = require('connect-mongo') 
/*Se le pasa la sesión. Esto representa el paso de variables hacia ese paquete*/
const flash = require('connect-flash') 
const passport = require('./config/passport')
const createError = require('http-errors')

require('dotenv').config({ path : 'variables.env'})

const app = express()

//Habilitar lectura de datos de formularios
//En versiones anteriores se usa "parser", sin embargo es obligatorio su uso, de los contrario no recibira nada
//Si son inputs de tipo archivos no los leerá, se debe instalar otra dependencia, uno muy cmún es "multer"
app.use(express.json()); //Nos va a permitir leer campos asi como la parte de subir archivos
app.use(express.urlencoded({extended: true}))

//validacion de campos

//Habilitar handlebars como view
app.engine('hbs', 
    exphbs.engine({
        defaultLayout: 'layout', //Siempre se tiene que definir un layout principal en handlebars, ademas es importante crear la carpeta "layouts" dentro de "views", es importante que se llame "layouts", porque handlebars va a buscar esa carpeta, layouts contiene los templates principales
        extname: 'hbs',
        helpers: require('./helpers/handlebars') /*Los helpers son una forma en que se registran scripts para que se
        comuniquen directamente con handlebars antes de su salida*/
    })
)

app.set('view engine', 'hbs')

//static Files
app.use(express.static('public'))

app.use(cookieParser())

//Se define antes debido a que cade vez que llega una ruta e sprocesado antes
//Con esto lo que se tiene en el servidor es una sesion, un espacio de menmoria que se pueden compartir entre multiples paginas
/*Se tiene ahora en rutas el objeto "req.sesion.my_variable" que puede almacenar cualquier cosa, es posible pasar variables de una ruta a otra*/
app.use(session({ //Elementos que se necesitan para firmar la sesion, sirve para decirle a las sesiones cada cuando se deben reiniciar, etc.
    secret: process.env.SECRETO,  //es para que cada sesion sea guardad de manera única
    key: process.env.KEY,   //Se esta creando sesión en la base de datos
    resave: false,      //No guarda la sesion potra vez
    saveUninitialized: false,   //Si no hace nada el usuario no va a guardar la sesión, evitar que sea inicializado
    store: MongoStore.create({mongoUrl: process.env.DATABASE}) //Se define que conexion se quiere utilizar, en este caso mongoose del paquete inportado
}))

//Inicializar passport
app.use(passport.initialize());  //Tiene que colocarse después de sesion
app.use(passport.session()) 

/*
//Se uso unicamente como debug para la session en passport, y entender porque existia req.user, info: https://www.youtube.com/watch?v=fGrSmBk9v-4
app.use((req, res, next) => {
    console.log(req.session)
})
*/

//Alertas y flash messages, al definir flash(), al req le agrega una función extra llamada flash(). que permite dar un nombre y valor al mensaje donde se va a usar
app.use(flash())

//Crear nuestro middleware global que almacena los mensajes desde cualquier parte en el servidor que establesca algun mensaje y  tambien almacena que usuario esta autenticado
app.use((req, res, next) => {
    //req.locals permite almacenar las variables en servidor de manera global, es decir, que cualquier vista puede acceder a ellas con su debida llmad a
    res.locals.mensajes = req.flash() //Siempre que hay un flash que enviar se llamara a este metodo, o cualquier flash almacenado en alguna vista como por ejemplo autenticarUsuario que emplea passport y sus mensajes son enviado a través de passport
    //Automanticante esta variable es accesible desde cualquier vista de hanlebars con ayuda del harlper "mostrarAlertas"
    next();   //Para que llegue a este middleware y se vaya al otro
});

app.use('/', router())

// 404
app.use((req, res, next) => {
    next(createError(404, 'No encontrado'));
})

//Administracion de los errores
//Aqui es donde van caer todos los errores que haya, y es por eso que se tiene el return next() 
app.use((error, req, res, next) => {   //Cuando se genera un error, es lo primero que se pasa
    //console.log(error.message)  //con .message es la forma en la que express pide que se generen los erorres
    res.locals.mensaje = error.message
    console.log(error.mensaje)
    const status = error.status || 500  //Algunos middleware, dependencias no generan el error, por lo tanto si el error no esta presente, que lance el 500
    res.locals.status = status
    res.status(status)
    res.render('error')     //Se debe recordar que cuando se pasa una variable hacia los locales  "res.locals", no se necesita en el
    //el controlador pasarla, se pasa automaticamente hacia la vistas y a otros archivos
})

//Dejar que HEROKU asigne el puerto
const host = '0.0.0.0';
const port  = process.env.PORT

app.listen(port, host, () => {
    console.log('El servidor esta funcionando')
})

/*
app.listen(process.env.PUERTO, () => {
    console.log('El servidor esta funcionando correctamente')
})*/


/*npm i express-handlebars: es un template engine distinto a pug

connect-mongo: para almacenar la sesión de mongo
mongoose: ORM a utilizar para la base de datos
shortid: para almacenar un ID en cada una de las vacantes
slug: 
cookie-parser: para permitir almacenar cookies

@babel/core: corresponde al nucleo de babel
@babel/preset-env: Corresponde a la configuracion que le dice a babel como queremos transpilar nuestro codigo,
El preset que todo lo transpila; Básicamente es como instalar y parametrizar preset-es2015, preset-es2016 y preset-es2017 pero con un único comando:

babel-loader: es el encargado de comunicar a webpack con babel. Es un conector entre ambas librerías.

webpack-cli: nos permite ejecutar webpack desde la terminal

webpack: nuecleo de webpack

connect-flash para enviar los mensaje de validacion

express-validator para validar campos

passport-local: es la forma en la que se accede utilizando una BD local

sweetalert2: npm i sweetalert2 // Es un paquete que nos permite añadir alertas elegantes, basta con copiar el código de alguna
    //de alguna que nos guste de su documentacion
    
axios: npm i axios  // Es un modulo que nos permite hacer solicitudes

nodemailer:  Para enviar correos para reestablecer el password

nodemailer-express-handlebars:  Para poder implementar nodemailer con handlebars

http-errors: ayuda e seleccionar y mostrar errores

util: 
*/