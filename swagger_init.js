

module.exports = function (app) {

    
const config = require('./config/config');
    const expressSwagger = require('express-swagger-generator')(app);

    let options = {
        swaggerDefinition: {
            info: {
                description: 'Social Network Appication API with Nodejs, Express and Mongo',
                title: 'Social Network API',
                version: '1.0.0',
            },
            host: config.LAUNCH_URL,
            basePath: '/api',
            produces: [
                "application/json",
                "application/xml"
            ],
            schemes: ['http', 'https'],
            securityDefinitions: {
                JWT: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'Authorization',
                    description: "",
                }
            }
        },
        basedir: __dirname, //app absolute path
        files: ['./controllers/**/*.js'] //Path to the API handle folder
    };
    expressSwagger(options)
}