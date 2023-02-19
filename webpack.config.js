const path = require('path')

module.exports = {
    entry: './public/js/app.js',
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, "./public/dist")
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
}

//Es posible utilizar esta configuración únicamente con webpack y webpack-cli
/*
module.exports = {
    entry: './public/js/app.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve('public/dist') //Automaticmante va a detectar la ruta absoluta y va a escribir en esa carpeta donde se va a guardar
    } 
}
*/