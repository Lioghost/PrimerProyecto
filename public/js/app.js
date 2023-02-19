/*DOMContentLoaded es una palabra reservada que nos permite conocer el momento en el que todos los elementos del 
DOM, es decir, los elementos HTML de un proyecto, están cargados, es decir cuando el documento es listo*/

import axios from 'axios'
import Swal from 'sweetalert2'

document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('.lista-conocimientos');

    //Limpiar las alertas
    let alertas = document.querySelector('.alertas') //alertas es el contenedor padre de todas las alertas

    if(alertas) {
        limpiarAlertas(alertas)
    }

    //si ya se cargaron los datos
    if(skills) {
        skills.addEventListener('click', agregarSkills);

        //una vez que estamos en editar llamar la función
        skillsSeleccionados()
    }
    
    const vacantesListado = document.querySelector('.panel-administracion')
    if(vacantesListado) {
        vacantesListado.addEventListener('click', accionesListado)
    }

})

//Se colocan global para evitar que se esten creando cada ves que se dispare un evento
const skills = new Set()

const agregarSkills = e => {
    if(e.target.tagName === 'LI') {  //Para comprobar nombre de elemento con event.target, se hace con MAYUSCULAS
        if(e.target.classList.contains('activo')) {
            //Eliminarlo del set y eliminar la clase
            e.target.classList.remove('activo')
            skills.delete(e.target.textContent)
        } else {
            //Agregarlo al set y agregar la clase
            skills.add(e.target.textContent);
            e.target.classList.add('activo')
        }
    }
        
    //Se hace una conversion del set a un formato string para ingresarlo al input #skills
    const skillsArray = [...skills]
    document.querySelector('#skills').value = skillsArray
    console.log(skillsArray)
}

const skillsSeleccionados = () => {

    //Se convierten a un arreglo con Array.from()
    const seleccionadas = Array.from(document.querySelectorAll('.lista-conocimientos .activo'))

    //Se extraen los datos texto de cada elemento y se añaden al set, por ello la inportancia de mantener a set fuera de las funciones
    seleccionadas.forEach(seleccionada => {
        skills.add(seleccionada.textContent)
    })

    //Inyectarlo en el hidden
    const skillsArray = [...skills]
    document.querySelector('#skills').value = skillsArray

}

const limpiarAlertas = (alertas) => {
    
    //const alertas = document.querySelector('.alertas')
    const interval = setInterval(() => {
          if(alertas.children.length > 0) { //S ecomprueba que deban existan las alertas
            alertas.removeChild(alertas.children[0]);
        } else if(alertas.children.length === 0) {
            alertas.parentElement.removeChild(alertas)  //Esto elimina el div de alerta padre de las alertas individuales
            clearInterval(interval)
        }
    }, 2000)
}

//Eliminar vacantes
const accionesListado = e => {
    
    e.preventDefault(); //Previene la ejecucion al pulsar sobre el elemento como un boton

    //console.log(e.target)
    if(e.target.dataset.eliminar) {  //Espera el evento correspondiente al elemento con el atributo "data-eliminar"
        //Eliminar por axios

        Swal.fire({         //Este codigo es copiado de sweetalert2
            title: 'Confirmar Eliminación?',
            text: "Una vez eliminada, no se puede recuperar",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, Eliminar',
            cancelButtonText: 'No, Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {

                //enviar la petición con axios
                //location.origin : nos trae nuestro servidor actual, actualmente estamos en localhost, pero la idea es que cuando se haga
                //un deployment, esa ruta sea portable, es decir que lea en la que esta ospedada
                const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`

                //Axios para eliminar el registro
                axios.delete(url, {params: {url} })
                    .then(function(respuesta) {
                        //console.log(respuesta)
                        if(respuesta.status === 200) {
                            Swal.fire(
                                'Eliminado',
                                respuesta.data,  //Son leidos los datos envidos por parte del servidor en "eliminarVacante"
                                'success'
                            );

                            //TODO: eliminar del DOM
                            e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement)
                            //Se elimina la class vacante, cuyo resultado corresponde a una vacante completa en el panel de admin. se sube
                            //tres niveles para eliminar el hijo "vacante" de "panel-administracion"
                        }
                    })
                    .catch(() => {   //Se coloca el catch por si existe algun error como de que el usuario loguedo no es priopietario de la vacante y ejecuta lam solicitud para que pueda eliminarla
                        Swal.fire({
                            type: 'error',
                            title: 'Hubo un error',
                            text: 'No se pudo eliminar'
                        })
                    })
            }
        })
    } else if(e.target.tagName === 'A') {
        window.location.href = e.target.href;  /*En caso de que se oprima alguno de los otros enlaces de los botones, reanuda su ejecución
        a trvés de "window.location.href" respecto al evento e.target.href*/

        //Se usa  if(e.target.tagName === 'A') para evitar que no se redirija a otra parte si no existe un enlace
    }
}