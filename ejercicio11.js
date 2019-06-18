const http=require('http');
const url=require('url');
const fs=require('fs');

const mime = {
   'html' : 'text/html',
   'css'  : 'text/css',
   'jpg'  : 'image/jpg',
   'ico'  : 'image/x-icon',
   'mp3'  :	'audio/mpeg3',
   'mp4'  : 'video/mp4'
};

//Objeto vacio para almacenar nombres de los recursos y sus contenidos
const cache = {};

const servidor=http.createServer((pedido, respuesta) => {
  const objetourl = url.parse(pedido.url);
  let camino='static'+objetourl.pathname;
  if (camino=='static/')
    camino='static/index.html';

  //verificamos si el objeto cache almacena una propiedad que coincide con el camino
  if (cache[camino]) {
      
    //Si el contenido está en la cache procedemos a extraerlo y acceder a la propiedad que coincide
    const vec = camino.split('.');
    const extension=vec[vec.length-1];
    const mimearchivo=mime[extension];
    respuesta.writeHead(200, {'Content-Type': mimearchivo});
    respuesta.write(cache[camino]);
    respuesta.end();
    console.log('Recurso recuperado de cache: ' + camino);
  } else {//Si no existe archivo verificamos si existe y lo leemos en el disco
    fs.stat(camino, error => {
        if (!error) {
          fs.readFile(camino, (error,contenido) => {		  
            if (error) {
              respuesta.writeHead(500, {'Content-Type': 'text/plain'});
              respuesta.write('Error interno');
              respuesta.end();					
            } else {
              //Una vez leido almacenamos el contenido en la variable cache para una posterior peticion.
              cache[camino] = contenido;
              
              const vec = camino.split('.');
              const extension=vec[vec.length-1];
              const mimearchivo=mime[extension];
              respuesta.writeHead(200, {'Content-Type': mimearchivo});
              respuesta.write(contenido);
              respuesta.end();
              console.log('Recurso leido del disco: ' + camino);
            }
          });
        } else {
          respuesta.writeHead(404, {'Content-Type': 'text/html'});
          respuesta.write('<!doctype html><html><head></head><body>Recurso inexistente</body></html>');		
          respuesta.end();
        }
    });
  }    
});

servidor.listen(8888);

console.log('Servidor web iniciado');