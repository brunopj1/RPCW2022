

$(function() {

    var contMood = 0
    var contRede = 0

    $("body").on('click', '#mais-mood', function () {
        event.preventDefault()
        
        $("#moods").append(`
            <span class="item">
                <input type="text" name="mood" id="mood-${contMood}" placeholder="Escreva a seu mood..." required>
            </span>
        `)
        contMood++
    })

    $("body").on('click', '#mais-rede', function () {
        event.preventDefault()
        
        $("#redes").append(`
            <span class="item">
                <form id="rede-${contRede}">
                    <label for="tipo"> Tipo da rede:
                    <select id="tipo" name="tipo">
                        <option class="opcao" id="" value=""> --Selecione um opção--
                        <option class="opcao" id="face" value="facebook"> Facebook
                        <option class="opcao" id="insta" value="instagram"> Instagram
                        <option class="opcao" id="twitter" value="twitter"> Twitter
                    </select>
                    <label for="rede"> Link do perfil:
                    <input type="url" name="rede" placeholder="Coloque o link..." required>
                </form>
            </span>
        `)
        contRede++
    })

    $("body").on('click', '#enviar', function () {
        event.preventDefault()

        var moods = []

        for (var i = 0; i<contMood; i++) {
            if ($(`#mood-${i}`).val() != "") {
                moods.push($(`#mood-${i}`).val())
            }
        }

        var redes = []

        for (var i = 0; i<contRede; i++) {
            var objeto = {}
            var queryString = $(`#rede-${i}`).serialize()
            var partes = queryString.split("&")
            partes.forEach(p => {
                constituintes = p.split("=")
                if (constituintes[0] == "tipo") {
                    tipo = constituintes[1]
                } else {
                    link = constituintes[1].replaceAll("%2F","/")
                    link = link.replace("https%3A//","")
                    var regExpQuery = new RegExp("%3F.*")
                    link = link.replace(regExpQuery,"")
                }
            })
            objeto = {
                tipo: tipo,
                link: link
            }
            if (tipo != "" && link != "") {
                redes.push(objeto)
            }
        }

        //Depois de criar o artista envia a foto 
        var form = new FormData($("#foto")[0]);


        if ($("#nome").val() != "" && $("#descricao").val() != "" && $("#foto_file").val() != "") {
            $.ajax({
                url: endpoint+'/artistas/',
                data: {nome: $("#nome").val(), biografia: $("#biografia").val(), moods: JSON.stringify(moods), redes: JSON.stringify(redes)},
                type: 'POST',
                success: function(res) {
                
                    $.ajax({
                        url: endpoint+'/submeter/userArtistaFoto',
                        data: form,
                        dataType: 'json',
                        method: 'POST',
                        contentType: "multipart/form-data",
                        enctype: 'multipart/form-data',
                        contentType: false,
                        processData: false,
                        cache: false,
                        success: function(res) {
                            console.log(res)
                            window.location.replace(endpoint)
                            informa(res)
                        }
                    });
                }
            });
        
        } else {
            alert("Prencha todos os campos!")
        }
    })
})