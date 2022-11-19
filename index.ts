/**
 * @author Felipe Serna
 * @email damsog38@gmail.com
 * @create date 2021-14-06 20:01:10
 * @modify date 2022-02-13 14:19:39
 * @desc Backend engine that server a a list of functionalities to connect and control to a 
 * python  engine that allows to run live face detection and face recognition (or by single image).
 * And using said algorithms offers other more specific solutions to the user.
 */

/************************************************************************************************
 *                                             Dependencies
*************************************************************************************************/
import express from 'express';
import fs from 'fs';
import cors from 'cors';
import path from 'path';
import http from 'http';
import https from 'https';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import authenticator from './middlewares/authenticator';

// Style & Color
import logger from './lib/logger';
import customMorgan from './middlewares/customMorgan';
import colorText from './lib/colortext';
//import gradient from 'gradient';
import figlet from 'figlet';

/************************************************************************************************
 *                                           Configurations
*************************************************************************************************/

// Swagger Documentation confifguration
const swaggerOptions = {
    definition: {
        openapi: "3.0.1",
        info: {
            title: 'Platform API',
            version: "1.0.0",
            description: 'Gnosis platform API'
        },
        servers: [
            {
                url: `https://${process.env.SERVER}:${process.env.PORT_SWAGGER}`
           },
        ],
        components: {
            securitySchemes: {
                bearerAuth:{
                    type: "http",
                    scheme: "bearer",
                    in: "header",
                    bearerFormat: "JWT"
                },
            }
        },
        security: [ { bearerAuth: [] } ],
    },
    apis: ["./controllers/*.ts", "./dataModels/*.ts"],
}
// Swagger Documentation initialization
const swaggerDocs = swaggerJsDoc(swaggerOptions);
const app = express();

// Figlet Configuration. To display a cool title for the Server.
const figletParamsTitle = {
    font: "Isometric2",
    horizontalLayout: 'full',
    verticalLayout: 'full',
    width: 100,
    whitespaceBreak: false
}
const figletParamsSubtitle = {
    font: "Alligator2",
    horizontalLayout: 'fitted',
    verticalLayout: 'fitted',
    width: 200,
    whitespaceBreak: true
}

// Creating some required folders to store users resources (Pictures, and groups)
if (!fs.existsSync(process.env.RESOURCES_PATH!)) {
    fs.mkdirSync(process.env.RESOURCES_PATH!, { recursive: true});
    logger.info( colorText( "Resource Created on: " + process.env.RESOURCES_PATH) );
}

// General Server settigs
app.set('port', process.env.PORT || 4000);
app.use('/api/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs)); // swagger route


// Middlewares Used
app.use(cors());
//app.use(morgan('[:date[iso]] : : :method : : :url : : HTTP/:http-version : : :status', {"stream": logger.stream.write}));
app.use(customMorgan);
app.use(express.urlencoded({extended: false}));
app.use(express.json({limit: '50mb'}));

// API
app.use('/api/auth', require('./controllers/authenticationController'));
app.use('/api/user', authenticator, require('./controllers/userController'));

const options = {
    key: fs.readFileSync(process.env.SSL_KEY!),
    cert: fs.readFileSync(process.env.SSL_CERT!)
}

/************************************************************************************************
 *                                             Running
*************************************************************************************************/
https.createServer(options, app).listen(app.get('port'), () => {

    // Sick title
    console.log( 
            figlet.textSync("Gnosis", "Isometric2")
    );
    // Cool subtitle
    console.log( 
            figlet.textSync("Central Server", "Alligator2")
        
    );  
    logger.info( colorText( "SERVER CONFIG INFO: Resources folder resides on: " + process.env.RESOURCES_PATH) );
    logger.info( colorText( "SERVER CONFIG INFO: Server Address : " + process.env.SERVER) );
    logger.info( colorText( "SERVER CONFIG INFO: Server running on port: " + process.env.PORT) );
    logger.info( colorText( "SERVER CONFIG INFO: Connecting to Face Analytics server on : " + process.env.FACE_ANALYTICS_SERVER) );
    logger.info( colorText( "SERVER CONFIG INFO: Connecting to Face Analytics server on port : " + process.env.FACE_ANALYTICS_PORT) );
});