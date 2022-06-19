const mongoose = require('mongoose')

var comentarioSchema = new mongoose.Schema({
    comentario: String,
    nome: String,
    data: String
})

var comentarioModel = mongoose.model('comentario',comentarioSchema)

module.exports = {
    comentarioSchema,
    comentarioModel,
  };
  