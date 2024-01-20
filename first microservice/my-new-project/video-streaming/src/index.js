const express = require('express');
//Usaremos esta libreria para peticion http al otro microservicio
const http = require("http");
//const fs = require("fs"); Ya no necesitamos estas 2 ya que usaremos peticiones http para los demás microservicios
//const path = require('path');
//Traemos la libreria con la que trabajaremos con mongodb
const mongodb = require("mongodb");

const app = express();
//
// Manda error si cualquier de las env variables no existe
//

if (!process.env.PORT) {
  throw new Error("Please specify the port number for the HTTP server with the environment variable PORT.");
}

if (!process.env.VIDEO_STORAGE_HOST) {
  throw new Error("Please specify the host name for the video storage microservice in variable VIDEO_STORAGE_HOST.");
}

if (!process.env.VIDEO_STORAGE_PORT) {
  throw new Error("Please specify the port number for the video storage microservice in variable VIDEO_STORAGE_PORT.");
}

if (!process.env.DBHOST) {
  throw new Error("Please specify the databse host using environment variable DBHOST.");
}

if (!process.env.DBNAME) {
  throw new Error("Please specify the name of the database using environment variable DBNAME");
}

//Así recibimos el puerto como variable de entorno:
const port = process.env.PORT;
//const port = 3000;
//Configuramos la conección al microservicio video-storage
const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
const VIDEO_STORAGE_PORT = parseInt(process.env.VIDEO_STORAGE_PORT);
//Traemos las env variables para el dbhost y dbname
const DBHOST = process.env.DBHOST;
const DBNAME = process.env.DBNAME;

// app.get('/', (req, res) => {
//   res.send('Hola mundo');
//   console.log('Holiwis')
// })
function main() {
  //Conectamos a la db
  return mongodb.MongoClient.connect(DBHOST)
    .then(client => {
      //recuperamos la database que usa el microservicio usa
      const db = client.db(DBNAME);
      //Recuperamos la colección de videos donde almacenamos los metadatos de cada una
      const videosCollection = db.collection("videos");
      app.get('/video', (req, res) => {
        //especificamos el id de video por un parametro http
        const videoId = new mongodb.ObjectId(req.query.id);
        //Hace query a la db para traer el de id requerido
        videosCollection.findOne({ _id: videoId })
          .then(videoRecord => {
            if (!videoRecord) {
              res.sendStatus(404);
              return;
            }

            const forwartRequest = http.request(//El primer parametro es la conexión al microservicio
              {
                host: VIDEO_STORAGE_HOST,
                port: VIDEO_STORAGE_PORT,
                //Cuando seguimos la request http a video-storage service mapeamos el id del video con su localizacion
                path: `/video?path=${videoRecord.videoPath}`,
                method: 'GET',
                headers: req.headers
              },
              //El callback al recibir la respuesta al GET
              forwardResponse => {//Ya lo habíamos trabajado, para mandar el stream
                res.writeHeader(forwardResponse.statusCode, forwardResponse.headers);
                forwardResponse.pipe(res);
              }
            );


            req.pipe(forwartRequest);
          })
          .catch(err => {
            console.error("database query failed.");
            console.error(err && err.stack || err);
            res.sendStatus(500);
          });

        //Lo siguiente comentado es la manera en como traiamos el video y lo mostrabamos
        //Antes del microservicio que nos traerá esa información/archivos
        // const videoPath = path.join('./videos', 'SampleVideo_1280x720_1mb.mp4');
        // fs.stat(videoPath, (err, stats) => {
        //   if (err) {
        //     console.error('Un error ocurrió');
        //     res.sendStatus(500);
        //     return;
        //   }

        //   // Mandamos cabecera al navegador para reconocer el contenido a enviar
        //   res.writeHead(200, {
        //     'Content-Length': stats.size,
        //     'Content-Type': 'video/mp4',
        //   });

        //   // Utilizamos createReadStream con la ruta corregida
        //   fs.createReadStream(videoPath).pipe(res);
        // });
      });


      app.listen(port, () => {
        console.log(`Microservicio principal en puerto: ${port}`);
      });
    });
}

main()
  .then(() => console.log("Microservicio online"))
  .catch(err => {
    console.error("Microservicio falló el iniciar");
    console.error(err && err.stack || err);
  })