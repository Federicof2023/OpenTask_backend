import express from "express";
import dotenv from "dotenv";
import cors from "cors";


import conectarDb from "./config/db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import tareaRoutes from "./routes/tareaRoutes.js";






const app = express();
// middlewares //
app.use(express.json());

dotenv.config();

conectarDb();



// ************configuracion de cors ****************** //


// configurarando una  whitelist de dominios permitidos //

const whiteList = [process.env.FRONT_END_URL]; // agrego variable de entorno //

// valido si el origin  http://127.0.0.1:5173   esta includio en la lista blanca   //
const corsOptions = {
  origin: function (origin, callback) {
    // Si esta incluida, puede consultar la api ... // 
    if (whiteList.includes(origin)) {
      console.log(origin);
      callback(null, true)
    } else {
      // Si no , no esta permitido su request devuelve error //
      callback(new Error('Error de cors '))
    }
  },
};



// middleware cors //
app.use(cors(corsOptions))





// endpoints //
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/proyectos", proyectoRoutes);
app.use("/api/tareas", tareaRoutes);

// inicializacion  de la app //
const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


// socket.io //
import { Server } from 'socket.io'

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONT_END_URL,
  }
})



io.on('connection', (socket) => {
  // console.log("Conectado a socket.io"); 
  // aca definimos los eventos de socket io// 
  socket.on('open proyect', (proyecto) => {
    socket.join(proyecto)
  })

  // aca  toma la 'nueva tarea' y emite el evento a un proyecto 
  socket.on('nueva tarea', (tarea) => {
    const proyecto = tarea.proyecto
    socket.to(proyecto).emit('tarea incluida', tarea)
  })

  socket.on('eliminar tarea', (tarea) => {
    // const proyecto = tarea.proyecto
    // socket.to(proyecto).emit('tarea eliminada', tarea)
    const proyectoValue = tarea.proyecto

    if (typeof proyectoValue === 'string') {
      socket.to(proyectoValue).emit('tarea eliminada', tarea)
    } else if (typeof proyecto === 'object') {
      socket.to(proyectoValue._id).emit('tarea eliminada', tarea)
    }
  })

  socket.on('actualizar tarea', (tarea) => {
    const proyecto = tarea.proyecto._id
    socket.to(proyecto).emit('tarea actualizada ', tarea)

  })

  socket.on('actualizar estado', (tarea) => {
    const proyecto = tarea.proyecto._id
    socket.to(proyecto).emit('estado actualizado', tarea)
  })

})