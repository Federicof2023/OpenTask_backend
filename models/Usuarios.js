import mongoose from "mongoose";
import bcrypt from "bcrypt";

const usuarioSchema = mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true, // eliminar espacios en blanco
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    token: {
      type: String,
    },
    confirmado: {
      type: Boolean,
      default: false,
    },
  },
  {
    timesstamps: true,
  }
);


usuarioSchema.pre('save', async function (next) {

  if (!this.isModified('password')) {
    next()
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt); // hasheo el password //
});

usuarioSchema.methods.verificarPassword = async function (password) { // verificar password //
  return await bcrypt.compare(password, this.password)

}

// model //

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;
