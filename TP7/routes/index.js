var express = require('express');
var axios = require('axios')

var router = express.Router();

const tokenAPI = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyNGNiYTg0OWJhYmI2NjdjYmZkYzE2ZSIsImlhdCI6MTY0OTE5NTY1MiwiZXhwIjoxNjUxNzg3NjUyfQ.EuvH713Qr6IZ073-5FMF6j5p_3tb6Trv0TOOF5ZHWOPUlCBqKU1H9DTo_ueoCyWhPbEd6F8xzNvn-UkG3J8Ppq65xF8uukoElnSIsi3kldXI2E_EHMv5ETIq-2SGpiBmLyv1zu2broi-nXw18XwKM-WWpoumw5mZacg1qyj4kokGm--WzPIDD15Uibu2ObsDfeHpbDt81Npq-WgEVe56F5w0TdAvY_b-Xvm77hXI4MuaatL9bsOtYEyiepLuBelDyVWjAIoon3-7tB1lwrPnC0OJ_cxKUyCdqx8sZPkmciyTmBsV8fDTyvTP1ibiryAQsDRK5TrG83CcWmStZyDnoQ"

/* GET home page. */
router.get('/', function(req, res, next) {
  axios.get(`http://clav-api.di.uminho.pt/v2/classes?nivel=1&apikey=${tokenAPI}`)
    .then(axios_res => {
      classes = axios_res.data
      res.render('classes', { title: 'Classes', classes: classes, back_ref: "/" });
    })
    .catch(error => {
      res.render('error', { error: error })
    })
});

router.get('/:id', function(req, res, next) {
  axios.get(`http://clav-api.di.uminho.pt/v2/classes/${req.params.id}?apikey=${tokenAPI}`)
    .then(axios_res => {
      classe = axios_res.data
      // Se for de nivel 3 filtrar os processos
      if (classe.nivel == 3) {
        processos = []
        classe.processosRelacionados.forEach(p => {
          if (p.idRel.match(/eCruzadoCom|eComplementarDe|eSuplementoDe|eSuplementoPara/)) {
            processos.push(p)
          }
        })
        classe.processosRelacionados = processos
      }
      // Determinar a href do botao de regressar
      classe.temPai = Object.keys(classe.pai).length > 0
      back_ref = classe.temPai ? "/c" + classe.pai.codigo : "/"
      res.render('classe', { title: 'Classe', classe: classe, back_ref: back_ref });
    })
    .catch(error => {
      res.render('error', { error: error })
    })
});

module.exports = router;
