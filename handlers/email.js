const emailConfig = require('../config/email');
const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const util = require('util')  //Sera necesario para el callback una vez que se envie en correo

var transport = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth: {
      user: emailConfig.user,
      pass: emailConfig.pass
    }
});

//Utilizar templates de handlebars
/*transport.use('compile', hbs({  //"compile es una propiedad que toma nodemailer-express-handlebars" para generar una configuracion y que tome los templates de handlebars
    viewEngine: 'hbs',     //Lo que se esta utilizando para las vistas
    viewPath: __dirname+'/../views/partials/emails',
    extName: '.hbs'
}))*/

transport.use('compile',hbs({
    viewEngine: {
       extname: 'hbs',
       defaultLayout: false,
    },
    viewPath: __dirname+'/../views/emails',
    extName: '.hbs',
}));

exports.enviar = async (opciones) => {   //Esta funcion se comunica con "authController.enviarToken", por ello tiene async

    const opcionesEmail = {
        from: 'devJobs <noreply@devjobs.com',
        to: opciones.usuario.email,
        subject: opciones.subject,
        template: opciones.archivo,   //No es posible hacer lo mismo que en pug
        context: {          //Las variables que se le van a pasar al archivo se definen dentro de contxt, todo lo que se ponga dentro de contxt se podra utilizar en el template
            resetUrl: opciones.resetUrl
        }
    }

    const sendMail = util.promisify(transport.sendMail, transport); 
    return sendMail.call(transport, opcionesEmail)
    //En caso de que llegue a fallar, se podria probar ejecutando el codigo siguiente, lo que hace es mantener la
    //respuesta como un callback() y de esa manera se podrían retornar los resultados desde donde es llamada la funcion
    //authController.enviarToken, tambien se tendria que quitar async y await y asignarlos a una variable
    //https://github.com/yads/nodemailer-express-handlebars/issues/43   Ayuda sobre el problema aparentemente
    /*transport.sendMail(opcionesEmail, (error, info) => {
        if (error) {
            console.log('holaaaaaaaaaaaaaaaa')
          console.log(error);
        } else {
          //res.send({
            //status: "success",
            //data: "Reset Link sent successfully",
          //});
          console.log("ffffffffff")
          console.log("Email sent: " + info.response);
          return 'success'
        }
      });*/

}