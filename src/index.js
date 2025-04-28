const express = require('express');      //Estructura del código.
 const fs = require('fs');                //Módulo de Node.js que permite trabajar archivos del sistema operativo (File System)
 const path = require('path');            //Manejar rutas de archivos de manera segura
 const HTTPS = require('https');
 const dotenv = require('dotenv');

 
// Cargar las variables del archivo .env
dotenv.config();
 
 const app = express();              //Permite a la aplicación manejar rutas, middleware, json, sesiones o puertos
 
 app.set('port', process.env.PORT || 3001);    //Creá variable que define que puerto será aplicado el servidor 
 
 
 //middlewares
 app.use(express.json());                      //Permite al servidor entender solicitudes JSON
 app.use(express.urlencoded({ extended: false }));    //Permite procesar datos HTML
 app.use(express.static(path.join(__dirname, 'public')));               //Permite servir archivos HTML

 //ruta raiz
 app.get('/', (req, res) => {
     res.send('Bienvenido a API de Reservas');
 });

 //routes endpoints
 const routeReservas = path.join(__dirname, 'reservas.json');//Guarda la ruta de reserva.json
 //_dirname apunta el directorio actual del JS 
 //path.join se asegura de armar correctamente la ruta 
 
 //Ruta GET
 app.get('/reservas', (req, res) => {             //Define una ruta de solicitudes GET
     fs.readFile(routeReservas, 'utf8', (err, data) => {       //Leer reservas.json de la ruta /routeReservas en formato texto
         if (err) return res.status(500).json({ error: 'Error leyendo el archivo de reservas' });
         //Si sucede un error advertira error 500, error al leer reservas.json
 
         const reservas = JSON.parse(data);  //Convierte el texto de reservas.json en un arreglo js
         res.json(reservas);    //Envia el array de "reservas" como respuesta al cliente
     });
 });
 
 // Ruta POST 
 app.post('/reservas', (req, res) => {           //Define una ruta de solicitudes POST
     const { nombre, email, telefono, motivo, hora, fecha } = req.body;       //Recopila los datos del cliente
 
     if (!nombre || !email || !telefono || !motivo || !hora || !fecha) {         //Revisa si falta algun dato
         return res.status(400).json({ error: 'Todos los campos son obligatorios' });    //Si faltan datos, manda una advertencia
     }
 
     fs.readFile(routeReservas, 'utf8', (err, data) => { 
         if (err) return res.status(500).json({ error: 'Error leyendo el archivo de reservas' });  
 
         const reservas = JSON.parse(data);
 
         const horaOcupada = reservas.find(r => r.hora === hora && r.fecha === fecha);  //Revisa en "reservas" si ya existe la hora 
         if (horaOcupada) {return res.status(409).json({ error: 'Hora ya reservada para esa fecha' });}
         //Si la hora esta ya registrada, se enviara una advertencia con el error 409
 
         const nuevaReserva = { nombre, email, telefono, motivo, hora, fecha };
          //Crea una constante que contenga los datos del cliente
         reservas.push(nuevaReserva); //Agrega el nuevo objeto al arreglo "reservas"
 
         fs.writeFile(routeReservas, JSON.stringify(reservas, null, 2), (err) => {  //Escribe los datos en reserva.json
             //Convierte el arreglo en texto JSON 
             if (err) return res.status(500).json({ error: 'Error guardando la reserva' }); 
             //Si se produce un error, mostrara error 500 con una advertencia
 
             console.log('Reserva registrada:', nuevaReserva); //Muestra en la consola la nueva reserva realizada
             res.status(201).json({ mensaje: 'Reserva registrada con éxito' }); //Muestra al cliente el estado 201 y un anuncio
         });
     });
 });
 
 //Levantando el servidor HTTP
 //app.listen(app.get('port'), () => { 
 //    console.log(`Servidor Iniciado! Puerto ${app.get('port')}`);
 //});

 const sslServer = HTTPS.createServer(
    {
        key: fs.readFileSync(path.join(__dirname,'cert','key.pem')),
        cert: fs.readFileSync(path.join(__dirname,'cert','cert.pem'))
    },
    app
 );

 sslServer.listen(app.get('port'),()=>
    console.log(`Servidor Iniciado! Puerto ${app.get('port')}`));
