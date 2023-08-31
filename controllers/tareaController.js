import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/tareas.js";

// para agregar una tarea..
const agregarTarea = async (req, res) => {
  // // busco el proyecto //
  const { proyecto } = req.body;

  // me fijo si existe en la DB //
  const existeProyecto = await Proyecto.findById(proyecto);

  // validacion de  si existe el proyecto y  quien esta agregando tarea //

  if (!existeProyecto) {
    const error = new Error("El proyecto no existe");
    return res.status(404).json({ msg: error.message });
  }

  // me fijo si la persona que esta dando de alta esta tarea es quien creo el proyecto//

  if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Disculpa, no tienes permisos para agregar tareas");
    return res.status(403).json({ msg: error.message });
  }
  // si es correcto que son la misma persona ,  se crea la tarea //
  try {
    const tareaGuardada = await Tarea.create(req.body);
    // almacenar el id en el proyecto //
    existeProyecto.tareas.push(tareaGuardada._id);
    // luego lo guardo //
    await existeProyecto.save();
    res.json(tareaGuardada);
  } catch (error) {
    console.log(error);
  }
};

// para obtener una tarea ..
const obtenerTarea = async (req, res) => {
  // primero desestructuro  y me traigo el id por params //
  const { id } = req.params;
  // identifco la tarea,  hago un await al modelo de tarea con un findById  y me traigo toda la tarea //
  const tarea = await Tarea.findById(id).populate("proyecto"); //-> con populate me traigo la informacion del proyecto tambien//
  // ** es otra opcion para  traerme el proyecto y ver el creador ** //
  // const { proyecto } = tarea;
  // const informacionProyecto = await Proyecto.findById(proyecto)
  // console.log(informacionProyecto);

  // validadcion similar que agregar tarea .. //
  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Disculpa, accion es no valida");
    return res.status(403).json({ msg: error.message });
  }
  // si esta todo correcto me traigo la tarea //
  res.json(tarea);
};
const actualizarTarea = async (req, res) => {
  const { id } = req.params;
  const tarea = await Tarea.findById(id).populate("proyecto");

  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Disculpa, accion es no valida");
    return res.status(403).json({ msg: error.message });
  }

  tarea.nombre = req.body.nombre || tarea.nombre;
  tarea.descripcion = req.body.descripcion || tarea.descripcion;
  tarea.prioridad = req.body.prioridad || tarea.prioridad;
  tarea.fechadeEntrega = req.body.fechadeEntrega || tarea.fechadeEntrega;

  try {
    const tareaGuardada = await tarea.save();
    res.json(tareaGuardada);
  } catch (error) {
    console.log(error);
    res.status(400).send("Error");
  }
};


const eliminarTarea = async (req, res) => {
  // mismas validaciones que antes..//

  const { id } = req.params;

  const tarea = await Tarea.findById(id).populate("proyecto");

  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }

  if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Disculpa, accion  no valida");
    return res.status(403).json({ msg: error.message });
  }

  try {
    const proyecto = await Proyecto.findById(tarea.proyecto);
    proyecto.tareas.pull(tarea._id);
    await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()]);

    res.json({ msg: " La tarea fue borrada" });
  } catch (error) {
    console.log(error);
  }
};
const cambiarEstado = async (req, res) => {

  const { id } = req.params;

  const tarea = await Tarea.findById(id).populate("proyecto")


  if (!tarea) {
    const error = new Error("Tarea no encontrada");
    return res.status(404).json({ msg: error.message });
  }


  if (
    tarea.proyecto.creador.toString() !== req.usuario._id.toString() &&
    !tarea.proyecto.colaboradores.some(
      (colaborador) => colaborador._id.toString() === req.usuario._id.toString()
    )
  ) {
    const error = new Error("Disculpa, accion es no valida");
    return res.status(403).json({ msg: error.message });
  }

  tarea.estado = !tarea.estado;
  tarea.completado = req.usuario._id
  await tarea.save();

  const tareaGuardada = await Tarea.findById(id)
    .populate("proyecto")
    .populate('completado')


  res.json(tareaGuardada);
};

export {
  agregarTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEstado,
};
