import jwt from 'jsonwebtoken'

// genero json web token  //
const generarJWT = (id) => {  // <-- esta funcion toma el id del usuario//

  // .. y a aca le paso el objeto con el id //
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'   // tiempo de xpiracion del JSW  token // 
  })
}
export default generarJWT