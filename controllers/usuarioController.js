import Usuario from "../models/Usuarios.js";
import generarId from "../helpers/generarid.js";
import generarJWT from "../helpers/generarJWT.js";
import { emailRegistro, emailOlvidePassword } from '../helpers/emails.js';

const registrar = async (req, res) => {
  // para evitar registros duplicados //
  const { email } = req.body;
  const existeUsuario = await Usuario.findOne({ email });

  // valido si ya existe el usuario...//
  if (existeUsuario) {
    const error = new Error("Usuario ya registrado");
    return res.status(400).json({ msg: error.message });
  }
  // si no ... lo creo
  try {
    const usuario = new Usuario(req.body); // creo un nuevo Usuario //
    usuario.token = generarId(); //  creo un token  y genero id //
    await usuario.save();

    // ** envio mail de confirmacion  ** // 
    // console.log(usuario);

    emailRegistro({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token
    })

    res.json({ msg: "Usuario creado correctamente, revisa tu email para confirmar tu cuenta" });
  } catch (error) {
    console.log(error);
  }
};

const autenticar = async (req, res) => {
  const { email, password } = req.body;
  // 1-compruebo si el usuario existe//
  const usuario = await Usuario.findOne({ email });
  if (!usuario) {
    const error = new Error("El usuario no existe");
    return res.status(404).json({ msg: error.message });
  }
  // 2- comprobar si el usuario esta verificado //
  if (!usuario.confirmado) {
    const error = new Error("Este usuario no esta verificado");
    return res.status(403).json({ msg: error.message });
  }
  // 3 -- verificar password //
  if (await usuario.verificarPassword(password)) {
    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      token: generarJWT(usuario._id), // agrego token aca tambien para verificacion para el password  //
    });
  } else {
    const error = new Error("El password es incorrecto");
    return res.status(403).json({ msg: error.message });
  }
};

const confirmar = async (req, res) => {
  // console.log(req.params.token);  // Coloco 'token'  es en este caso  pero podes poner otra cosa 'id'por ejem , //
  // depende lo que necesita la app, EXPRESS lo toma y te lo muestra dinamicamente //

  const { token } = req.params; // -> LO LEO DE LA URL//
  const usuarioConfirmar = await Usuario.findOne({ token }); //-> busco usuario con ese token //

  if (!usuarioConfirmar) {
    // luego la  validacion si NO existe //
    const error = new Error("Token no valido ! ");
    return res.status(403).json({ msg: error.message });
  }
  try {
    // si el usuario existe ...//

    usuarioConfirmar.confirmado = true; // <-- confirmo el usuario //
    usuarioConfirmar.token = ""; //  <-- elimino el token //
    await usuarioConfirmar.save(); //   <-- y con SAVE la  guardo en la DB//
    res.json({ msg: "Usuario confirmado exitosamente" }); // <-- msg :  'Se confirmo el usuario' //
  } catch (error) {
    console.log(error);
  }
};

const olvidoPassword = async (req, res) => {
  const { email } = req.body;

  const usuario = await Usuario.findOne({ email }); // 1 verifico que exista el usuario //
  if (!usuario) {
    const error = new Error("El usuario no existe");
    return res.status(404).json({ msg: error.message });
  }
  // 2 si  existe..  le generamos un token nuevo//
  try {
    usuario.token = generarId(); // // genero token n uevo para enviarselo al usuario//
    await usuario.save(); // se guarda en la base de datos //

    // le enviamos un email al usuario  //


    emailOlvidePassword({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token

    })


    res.json({ msg: "Te enviamos un email con las instrucciones " });
  } catch (error) {
    console.log(error);
  }
};

const verificarToken = async (req, res) => {
  // comparar y validar  el token que paso el usuario con el que esta guardado en la DB //
  const { token } = req.params;

  const tokenValido = await Usuario.findOne({ token }); // lo busco ahora por token //

  // validadcion //
  if (tokenValido) {
    res.json({ msg: "Token correcto - usuario correcto" });
  } else {
    const error = new Error("Token no valido");
    return res.status(404).json({ msg: error.message });
  }
};

const nuevoPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const usuario = await Usuario.findOne({ token }); // lo busco ahora por token, verifico //

  // Si es correcto..
  if (usuario) {
    usuario.password = password; //<-- guardo el nuevo password //
    usuario.token = ""; // <- reseteo el token , lo elimino //
    try {
      await usuario.save(); // <-- guardo en la DB //
      res.json({ msg: "Password modificado correctamente" });
    } catch (error) {
      console.log(error);
    }
  } else {
    // si no es correcto enviamos respuesta //
    const error = new Error("Token no valido");
    return res.status(404).json({ msg: error.message });
  }
};

const perfil = async (req, res) => {
  const { usuario } = req
  res.json(usuario)
}

export {
  registrar,
  autenticar,
  confirmar,
  olvidoPassword,
  verificarToken,
  nuevoPassword,
  perfil

};
