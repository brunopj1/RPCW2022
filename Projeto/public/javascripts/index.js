

$(function() {
    function normal() {
        $("#atividade").empty()
        $.ajax({
            url: endpoint+'/atividade',
            type: 'GET',
            success: function(data) {
                if (data.length > 0) {
                    $("#atividade").append('<h2 class="titulo">Ultima Atividade</h3>')
                    $("#atividade").append('<span class="atualizar"><button class="botao" id="atualizar"> Atualizar <i class="fa-solid fa-spinner fa-sm"></i></button></span>')
                    var html = '<ul class="w3-ul w3-center">'
                    data.forEach(u => {
                        if (u.musica == undefined) {
                            html += `
                                <li><a class="botao-ativ" href="users/${u.nome}">${u.nome}</a> ouviu uma música apagada...</li>
                            `
                        } else {
                            html += `
                                <li><a class="botao-ativ" href="users/${u.nome}">${u.nome}</a> ouviu a música: <a class="botao-ativ" href="musicas/${u.musica._id}">${u.musica.nome}</a></li>
                            `
                        }
                    })
                    html += "</ul>"
                    $("#atividade").append(html)
                }
            }
        });
    }

    normal()

    $("body").on('click', '#atualizar', function () {
        event.preventDefault()
        normal()
    })

})