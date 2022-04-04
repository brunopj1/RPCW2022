var express = require('express');
var router = express.Router();
var multer = require('multer')
var upload = multer({dest: 'uploads'})
var fs = require("fs")

var Ficheiros = require('../controllers/ficheiro')

/* GET home page. */
router.get('/', function(req, res, next) {
  // Get ficheiros
  Ficheiros.list()
    .then(data => {
      console.log(data);
      res.render('index', { title: 'Ficheiros', ficheiros: data });
    })
    .catch(error => {
      res.render('error', { error: error })
    })
});

router.post('/novoFicheiro', upload.single('ficheiro'), function(req, res, next) {
  // Move file
  let oldPath = __dirname + '/../' + req.file.path
  let newPath = __dirname + '/../fileStorage/' + req.file.originalname
  fs.rename(oldPath,newPath,erro => {
      if (erro) {
          throw erro
      }
  })
  // Save on the database
  file = {
    _id: req.file.originalname,
    descricao: req.body.descricao,
    tipo: req.file.mimetype,
    tamanho: req.file.size
  }
  Ficheiros.insert(file)
    .then(data => {
      res.redirect('/')
    })
    .catch(error => {
      res.render('error', { error: error })
    })
});

router.get('/eliminarFicheiro/:id', function(req, res, next) {
  Ficheiros.remove(req.params.id)
    .then(data => {
      res.redirect('/')
    })
    .catch(error => {
      res.render('error', { error: error })
    })
});

module.exports = router;
