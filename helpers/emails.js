import nodemailer from 'nodemailer'

export const emailRegistro = async (datos) => {
  const { email, nombre, token } = datos


  // configuramos el cliente para enviar el email ose estas credenciales //

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // informacion del email //  

  const infoEmail = await transport.sendMail({ // con el metodo sendMail envia el mail, una vez que identifica ccredenciales//
    from: '"OpenTask - Administrador de proyectos" <cuentas@uptask.com>',
    to: email,
    subject: "OpenTask - Verificacion de tu cuenta ",
    text: " Verifica tu cuenta en Opentask",
    html: `<p> Hola ${nombre} ! : Gracias por registrarte en OpenTask.
    Por favor sigue haz click en el siguiente enlace  para confirmar tu cuenta : 
    <a href="${process.env.FRONT_END_URL}/confirmar/${token}">Verificar cuenta</a>
    
    <p>Si no creaste esta cuenta por favor  ignora este mensaje</p>`

  })

}

export const emailOlvidePassword = async (datos) => {
  const { email, nombre, token } = datos
  // configuramos el cliente para enviar el email ose estas credenciales //

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // informacion del email //  

  const infoEmail = await transport.sendMail({ // con el metodo sendMail envia el mail, una vez que identifica ccredenciales//
    from: '"OpenTask - Administrador de proyectos" <cuentas@Opentask.com>',
    to: email,
    subject: "OpenTask - Restablecer Password ",
    text: " Restablece tu password",
    html: `<p> Hola ${nombre} ! has solicitado restablecer tu password  ?<p/> 

    <p>Sigue el siguiente enlace para generar un nuevo password : 

    <a href="${process.env.FRONT_END_URL}/olvide-password/${token}">Restablecer password</a>
    
    <p>Si tu no solicitaste restablecer tu password,  por favor  ignora este mensaje. <p/>

    <br>
    
    <p>All the best </p>
    <p> OpenTask Team  </p>`

  })

}