const express = require("express");
const { resolve } = require("path");
const { start } = require("repl");

function setupHandlers(app){//Un stub microservice se añadir{an rutas y mensajes de respuesta}


}

function startHttpServer(){
  return new Promise(resolve =>{
    const app = express();
    setupHandlers(app);

    const port = process.env.PORT && parseInt(process.env.PORT) || 3000;
    app.listen(port, () =>{
      resolve();
    });
  });
}

function main(){
  console.log("Hello world!");

  return startHttpServer();
}

main()
  .then(() => console.log("Ya jala microservicio history"))
  .catch(err =>{
    console.error("Microservice history failed to start");
    console.error(err && err.stack || err);
  });