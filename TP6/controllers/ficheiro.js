var mongoose = require('mongoose')
var Ficheiros = require('../models/ficheiro')

module.exports.list = () => {
    return Ficheiros
        .find()
        .sort({ nome: 1 })
        .exec()
}

module.exports.insert = ficheiro => {
    newFicheiro = new Ficheiros(ficheiro)
    return newFicheiro.save()
}

module.exports.remove = id => {
    return Ficheiros.deleteOne({ _id: id })
}