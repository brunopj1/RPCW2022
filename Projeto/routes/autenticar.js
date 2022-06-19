var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

var User = require('../controllers/user')
const appHash = require('../config/appHash.json');
const appPassEspecial = require('../config/passEspecial.json');
const autenticacao = require('../middlewares/autenticar');

function geraToken(parametros) {
  return jwt.sign(parametros,appHash.secret,{expiresIn: 86400})
}

router.post("/registar",(req,res) => {
  const pessoa = req.body
  pessoa.musicas = 0
  if (pessoa.nome == '' || pessoa.password == '') {
    res.status(200).jsonp({erro: "Credenciais incompletas..."})
  } else {
    var erro = false
    User.listar()
    .then(dados => {
      dados.forEach(p => {
        if (p.nome == pessoa.nome) {
          res.status(200).jsonp({erro: "Nome em uso..."})
          erro = true
        } 
      })
      if (!erro && (pessoa.tipo == "admin" || pessoa.tipo == "produtor")) {
        if (appPassEspecial.pass != pessoa.passEspecial) {
          res.status(200).jsonp({erro: "Pass especial errada..."})
          erro = true
        }
      }
      if (!erro) {
        const salt = bcrypt.genSaltSync()
        pessoa.password = bcrypt.hashSync(pessoa.password,salt)
        User.inserir(pessoa)
          .then(user => {
            login = {
              nome: user.nome,
              token: geraToken({ id: user._id })
            }

            res.cookie("token",login.token, {
              httpOnly: true
            })

            res.status(200).jsonp(login)
          })
          .catch(err => res.render('error', { error: err }))
      }
    })
    .catch(err => res.render('error', { error: err }))
  }
})

router.post("/login",(req,res) => {
  const pessoa = req.body
  if (!pessoa.nome || !pessoa.password) {
    res.status(200).jsonp({erro: "Credenciais incompletas..."})
  } else {
    User.getByName(pessoa.nome)
    .then(dados => {
      if (dados != undefined) {
        if (bcrypt.compareSync(pessoa.password,dados.password)) {
          
          login = {
            nome: dados.nome,
            token: geraToken({ id: dados._id })
          }

          res.cookie("token",login.token, {
            httpOnly: true
          })

          res.status(200).jsonp(login)
        } else {
          res.status(200).jsonp({erro: "Password incorreta..."})
        }
      } else {
        res.status(200).jsonp({erro: "Nao existe esse nome..."})
      }
    })
    .catch(err => res.render('error', { error: err }))
  }
})

router.post("/logout",(req,res) => {
  res.clearCookie("token")
  res.status(200).jsonp("Logout efetuado...")
})


router.get("/registar",(req,res) => {
  res.render('registar',{title: "Registar"});
})

router.get("/login",(req,res) => {
  res.render('login',{title: "Login"});
})

router.get("/logout",(req,res) => {
  res.render('logout',{title: "Logout"});
})

module.exports = router;
