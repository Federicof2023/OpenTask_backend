import Proyecto from "../models/Proyecto.js";
import Usuario from "../models/Usuarios.js";

const obtenerProyectos = async (req, res) => {
  const proyectos = await Proyecto.find({
    $or: [
      { colaboradores: { $in: req.usuario } },
      { creador: { $in: req.usuario } },
    ],
  }).select("-tareas");
  res.json(proyectos);
};

const nuevoProyecto = async (req, res) => {
  const proyecto = new Proyecto(req.body);
  proyecto.creador = req.usuario._id;

  try {
    const proyectoGuardado = await proyecto.save();
    res.json(proyectoGuardado);
  } catch (error) {
    console.log(error);
  }
};

const obtenerProyecto = async (req, res) => {
  // busco el proyecto por ID  //
  const { id } = req.params;
  const proyecto = await Proyecto.findById(id)
    .populate({ path: 'tareas', populate: { path: 'completado', select: 'nombre' } })
    .populate("colaboradores", "nombre email");

  // console.log(proyecto);

  // aca valido , si el id del proyecto no existe me va retorna un error //
  if (!proyecto) {
    const error = new Error("No encontrado");
    return res.status(404).json({ msg: error.message });
  }

  // solamente la persona que creo el proyecto puede tener acceso a verlo //
  if (
    proyecto.creador.toString() !== req.usuario._id.toString() &&
    !proyecto.colaboradores.some(
      colaborador => colaborador._id.toString() === req.usuario._id.toString()
    )) {
    const error = new Error(" Acceso no permitido");
    return res.status(401).json({ msg: error.message });
  }

  // obtener las tareas del proyecto //

  // const tareas = await Tarea.find().where('proyecto').equals(proyecto._id)
  res.json(proyecto);
};

const editarProyecto = async (req, res) => {
  // leemos el parametro para identificar el proyecto por ID   //
  const { id } = req.params;
  const proyecto = await Proyecto.findById(id);

  console.log(proyecto);

  // aca valido , si el id del proyecto no existe me va retorna un error //
  if (!proyecto) {
    const error = new Error("No encontrado");
    return res.status(404).json({ msg: error.message });
  }

  // solamente la persona que creo el proyecto puede tener acceso a verlo //
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error(" Acceso no permitido");
    return res.status(401).json({ msg: error.message });
  }

  proyecto.nombre = req.body.nombre || proyecto.nombre;
  proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
  proyecto.fechadeEntrega = req.body.fechadeEntrega || proyecto.fechadeEntrega;
  proyecto.cliente = req.body.cliente || proyecto.cliente;

  try {
    const proyectoGuardado = await proyecto.save();
    return res.json(proyectoGuardado);
  } catch (error) {
    console.log(error);
  }
};

const eliminarProyecto = async (req, res) => {
  // leo el parametro para identificar el proyecto por ID   //
  const { id } = req.params;
  const proyecto = await Proyecto.findById(id); // -> consulto la BD para ver si esta ese proyecto

  console.log(proyecto);

  // aca hago una validacion , si el id del proyecto no existe me va retorna un error //
  if (!proyecto) {
    const error = new Error("No encontrado");
    return res.status(404).json({ msg: error.message });
  }

  // entonces si existe ,  solamente la persona que creo el proyecto puede ELIMINAR un proyecto  //
  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error(" Acceso no permitido");
    return res.status(401).json({ msg: error.message });
  }

  // despues de validar que sea el usuario que creo el proyecto   ,  se elimina el proyecto//
  try {
    await proyecto.deleteOne();
    res.json({ msg: "proyecto Eliminado" });
  } catch (error) {
    console.log();
  }
};

const buscarColaborador = async (req, res) => {
  const { email } = req.body; // con select solo me traigo los datos que necesito //
  const usuario = await Usuario.findOne({ email }).select(
    "-confirmado -createAt -token -password -updatedAt -__v  "
  );

  if (!usuario) {
    const error = new Error("Usuario no encontrado");
    return res.status(404).json({ msg: error.message });
  }

  res.json(usuario);
};

const agregarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);

  if (!proyecto) {
    const error = new Error("No se encontro ese proyecto");
    return res.status(404).json({ msg: error.message });
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Accion no valida");
    return res.status(404).json({ msg: error.message });
  }
  const { email } = req.body; // con select solo me traigo los datos que necesito //
  const usuario = await Usuario.findOne({ email }).select(
    "-confirmado -createAt -token -password -updatedAt -__v  "
  );

  if (!usuario) {
    const error = new Error("Usuario no encontrado");
    return res.status(404).json({ msg: error.message });
  }

  // validar si el colaborador no es el admin del proyecto //

  if (proyecto.creador.toString() === usuario._id.toString()) {
    const error = new Error(
      "Si creaste un proyecto no puedes ser colaborador!"
    );
    return res.status(404).json({ msg: error.message });
  }
  // tambien validar que ya no este agregado al proyecto //

  if (proyecto.colaboradores.includes(usuario._id)) {
    const error = new Error("Este usuario ya esta incluido en el proyecto !");
    return res.status(404).json({ msg: error.message });
  }

  //.. finalmente si  todo esto esta validado, se puede agregar al proyecto //
  proyecto.colaboradores.push(usuario._id);
  // lo guardo...
  await proyecto.save();
  res.json({ msg: "Colaborador incluido correctamente" });
};

const eliminarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);

  if (!proyecto) {
    const error = new Error("No se encontro ese proyecto");
    return res.status(404).json({ msg: error.message });
  }

  if (proyecto.creador.toString() !== req.usuario._id.toString()) {
    const error = new Error("Accion no valida");
    return res.status(404).json({ msg: error.message });
  }

  //Si esta todo validado se puede eliminar el colaborador...//
  proyecto.colaboradores.pull(req.body.id);

  // lo guardo...
  await proyecto.save();
  res.json({ msg: "Colaborador eliminado correctamente" });
};

export {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  agregarColaborador,
  eliminarColaborador,
  buscarColaborador,
};
