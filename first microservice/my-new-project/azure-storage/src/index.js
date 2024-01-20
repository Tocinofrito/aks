const express = require("express");
const azure = require('azure-storage'); //Lo que usaremos para contectar con azure

const app = express();

if (!process.env.PORT) {
  throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.");
}

if (!process.env.STORAGE_ACCOUNT_NAME) {
  throw new Error("Please specify the name of an Azure storage account in environment variable STORAGE_ACCOUNT_NAME.");
}

if (!process.env.STORAGE_ACCESS_KEY) {
  throw new Error("Please specify the access key to an Azure storage account in environment variable STORAGE_ACCESS_KEY.");
}
const PORT = process.env.PORT; //Tomamos el puerto de la variable de entorno ya puesta en el dockerfile
//Descomentamos para pruebas
//const PORT = 3000
const STORAGE_ACCOUNT_NAME = process.env.STORAGE_ACCOUNT_NAME; //La tomamos de la variable de entorno
//Descomentamos para pruebas
//const STORAGE_ACCOUNT_NAME ="microservicios";
const STORAGE_ACCESS_KEY = process.env.STORAGE_ACCESS_KEY;//Igual de la env
//Descomentamos para pruebas
//const STORAGE_ACCESS_KEY="JfjcZZXjPCqoF97fkPPmW1f8CcNnKH4hasK2FdCQk+1Jq4qNJubKWTVqqveCw/qrwN3CyFQ6MnTd+AStGBHqGg==";

console.log(`Serving videos from Azure storage account ${STORAGE_ACCOUNT_NAME}.`);

function createBlobService() {
  const blobService = azure.createBlobService(STORAGE_ACCOUNT_NAME, STORAGE_ACCESS_KEY);
  // Uncomment next line for extra debug logging.
  //blobService.logger.level = azure.Logger.LogLevels.DEBUG; 
  return blobService;
}

app.get("/video", (req, res) =>{
  const videoPath = req.query.path;
  console.log(`aqui debe ir el nombre de ruta${videoPath}`)
  console.log(`Streaming video from path ${videoPath}.`);
  const blobService = createBlobService();

  const containerName = "videos"; //Este debemos cambiar esto para cada usuario
  //Obtenemos las propiedades de videos de azure storage
  blobService.getBlobProperties(containerName, videoPath, (err, properties) =>{
    if (err){
      //Manejo de error
      console.error(`Error occurred getting properties for video ${containerName}/${videoPath}.`);
      console.error(err && err.stack || err);
      res.sendStatus(500);
      return;
    }
    //En caso de no haber error
    res.writeHead(200, {
      "Content-Length" : properties.contentLength,
      "Content-Type": "video/mp4",
    });
      //Aquí obtenemos el video en forma de stream para mostrarlo en el micro
      //Servicio principal
    blobService.getBlobToStream(containerName, videoPath, res, err =>{
      if(err){
        //Manejamos el error
        res.sendStatus(500);
        return;
      }
    });
  });
});

app.listen(PORT, () =>{
  console.log('Microservicio azure-storage online');
})