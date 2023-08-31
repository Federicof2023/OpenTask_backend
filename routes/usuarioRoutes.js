import express from "express";
import {
  registrar,
  autenticar,
  confirmar,
  olvidoPassword,
  verificarToken,
  nuevoPassword,
  perfil
} from "../controllers/usuarioController.js";

const router = express.Router();

import checkAuth from "../middlewares/checkAuth.js";

// **  Routes para  el registro , autenticacion  y confirmacion de usuarios ** //

router.post("/", registrar); // crea nuevo usuario //
router.post("/login", autenticar); // autenticar usuario //
router.get("/confirmar/:token", confirmar); // confirmar usuario // routing dinamico//
router.post("/olvide-password", olvidoPassword); // es POST ya que el usuario envia su email para confirmar que ese email// // existe y se envia  un token nuevo //
router.get("/olvide-password/:token", verificarToken);// router.route("/olvido-password/:token").get(verificarToken).post(nuevoPassword);
router.post("/olvide-password/:token", nuevoPassword);
router.get('/perfil', checkAuth, perfil) // -> custom middlewarE para verificar que un usuario este autenticado//
// checkAuth(middleware) va  a verifiacar que el token enviado tenga todas las coprobaciones necesarias
// si esta ok, hace next() y va a PERFIL // 


export default router;
