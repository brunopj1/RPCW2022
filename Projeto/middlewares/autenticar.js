
const jwt = require('jsonwebtoken')
const hash = require('../config/appHash.json')

var User = require('../controllers/user')

class Autenticacao {
    static userTipo(tipo) {
        return async (req,res,next) => {
            const autorizacao = req.cookies.token
        
            if (!autorizacao) {
                //Nao sei como os browsers estao a decorar este redirect e a nao deixar a aceder a mais nada mesmo
                // depois de autenticado...
                return res.redirect("/autenticar/registar")
                //return res.status(401).jsonp("Nao tem token...")
            }
        
            const parts = autorizacao.split('.')
        
            if (!parts.length == 3) {
                return res.redirect("/autenticar/login")
                //return res.status(401).jsonp("Token desformatado...")
            }
        
            jwt.verify(autorizacao,hash.secret,(err,decoded) => {
                if (err) {
                    return res.redirect("/autenticar/login")
                    //return res.status(401).jsonp("Token invalido...")
                } else {
                    req.userId = decoded.id
                    User.getById(req.userId)
                    .then(user => {
                        //se houver problemas apagar este if
                        if (user != undefined) {
                            req.userTipo = user.tipo
                            req.user = user
                            if (!tipo.includes(req.userTipo)) {
                                return res.status(401).jsonp("Nao tem permissao...")
                            } else {
                                return next()
                            }
                        } else {
                            return res.redirect("/autenticar/registar")
                        }
                    })
                }
            })
        }
    }
}

module.exports = Autenticacao