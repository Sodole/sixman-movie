const swaggerJSDoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")

const options = {
    swaggerDefinition : {
        info:{
            title:"sixman-movie",
            version:"1.0.0",
            description:"to provide movie information for sixman",
        },
        servers:[
            {url: "https://port-0-sixman-movie-r8xoo2mlenkvdnc.sel3.cloudtype.app/"}
        ],
        host:"localhost:3000",
        basePath:"/"
    },
    apis:["routes/*.js"]
}

const specs = swaggerJSDoc(options);

module.exports = { swaggerUi, specs}