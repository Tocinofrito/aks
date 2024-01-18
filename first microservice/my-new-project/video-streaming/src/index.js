const express = require('express');
const fs = require("fs");
const path = require('path');

const app = express();

//Requerimos la variable de entorno, si no se recibe se envía error
if(!process.env.PORT){
  throw new Error("Porfavor especifica el numero de puerto para el server http con la variable de entorno Port.");
}

//Así recibimos el puerto:
const port = process.env.PORT;
//const port = 3000;

app.get('/', (req, res) =>{
  res.send('Hola mundo');
  console.log('Holiwis')
})

app.get('/video', (req, res) => {
  const videoPath = path.join('./videos', 'SampleVideo_1280x720_1mb.mp4');
  fs.stat(videoPath, (err, stats) => {
    if (err) {
      console.error('Un error ocurrió');
      res.sendStatus(500);
      return;
    }

    // Mandamos cabecera al navegador para reconocer el contenido a enviar
    res.writeHead(200, {
      'Content-Length': stats.size,
      'Content-Type': 'video/mp4',
    });

    // Utilizamos createReadStream con la ruta corregida
    fs.createReadStream(videoPath).pipe(res);
  });
});


app.listen(port, () =>{
  console.log(`Escuchando en puerto ${port}`);
})
