module.exports = {
    seleccionarSkills: (seleccionadas = [], opciones) => {   //Toma dos parametros y se pasan por default gracias al helper

        /*opciones.fn() estan disponibles cuando se usa un helper en su forma block, Handlebars convierte tu template en una funcion regular
        JavaScript,el cual retorna un texto, en el caso del helper block, todo lo que esta contenido en el bloque se convierte en su propia
        función, y esa función se pasa a la funcion del helper como la propiedad "fn", en otras palabras opciones.fn() representa el codigo
        escrito dentro del helper, ejemplo = {{#list nav}}<a href="{{url}}">{{title}}</a>{{/list}}, al pasar un parametro dentro de fn()|,
        en este caso un objeto, nav: {url: "ddd", title: "fff"}, automaticamente se colocan en su lugar correspondiente de acuerdo al nombre*/
        //seleccionadas corresponden a los datos que se pasan como parametro en en helper 

        //console.log(seleccionadas)
        //El array seleccionadas almacena aquellas habilidades que son seleccionadas
        const skills = ['HTML5', 'CSS3', 'CSSGrid', 'Flexbox', 'JavaScript', 'jQuery', 'Node', 'Angular', 'VueJS', 'ReactJS', 'React Hooks', 'Redux', 'Apollo', 'GraphQL', 'TypeScript', 'PHP'];

        //Se verifica cuando se quiere editar la vancante pasando el objeto skills en el helper y se comprueba cuales habian sido ya selecciondas
        //con ayuda del arreglo seleccionadas declaron previamente*/
        //Al crear la vacante no se pasa ningun objeto (vacante.skills), para unicamente se retorne la cadena que contiene todas opciones de skills
        //a seleccionar, posteriormente son enlazadas a un input oculto para agregar cada seleccion como arreglo
        let html = ''
        skills.forEach(skill => {
            html += `
                <li ${seleccionadas.includes(skill) ? 'class="activo"' : ''}>${skill}</li>
            `;
        });

        //console.log(opciones)
        //console.log("Soy html", html)
        //console.log("soy opcions.fn()", opciones.fn().html)

        //return opciones.fn().html = html     //Opcion definida en principio
        //El resultado que importa verdaderamente es la cadena que se retorna
        //Mas info: https://subscription.packtpub.com/book/web-development/9781783282654/1/ch01lvl1sec06/top-6-features-you-need-to-know-about
        return html;
    },
    
    tipoContrato: (seleccionado, opciones) => {

        //console.log("Soy gokuuu", opciones.fn())

        /*replace devuelve una nueva cadena con algunas o todas las coincidencias de un patrón, siendo cada una de estas
        coincidencias remplazadas, el patron puede ser una cadena o uun RegExp, y el reemplazo puede ser una cadena o una
        función que sera llamada para la coincidencia, si el patron es una cadena, solo la primera coincidencia será reemplazada
         $& inserta la subcadena emparejada
        https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/String/replace*/
        return opciones.fn(this).replace( new RegExp(`value="${seleccionado}"`), '$& selected="selected"')
    },

    //Por default esta vacio porque no siempre hay errores
    mostrarAlertas: (errores = {}, alertas) => {
        const categoria = Object.keys(errores)   //Extraccion de claves de los objetos, (mensajes existentes en flash())

        let html = '';
        //console.log(errores[categoria])  //Es posible hacer un filtrado
        if(categoria.length) {
            //Se filtran los errores, bien podrian ser correctos, el div es necesario por lo esstilos de los mensajes
            errores[categoria].forEach(error => {
                html += `<div class="${categoria} alerta">
                    ${error}
                </div>`;
            })
        }
        //console.log(html)
        return html
    }
}