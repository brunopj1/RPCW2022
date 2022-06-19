const mongoose = require("mongoose")

var albumSchema = new mongoose.Schema({
    nome: String,
    artista: String,
    dataLancamento: String,
    genero: String,
    user: String,
    critica: String
})

module.exports = mongoose.model("album", albumSchema)