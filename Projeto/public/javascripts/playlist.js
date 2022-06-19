

$(document).ready(function() {

    var id = $("#id-playlist").html()

    function normal() {
        $("#comentarios").empty()

        $.ajax({
            url: endpoint+'/playlists/'+id+'/comentarios',
            type: 'GET',
            success: function(res) {

                if (res.comentarios.length > 0) {
                    
                    var htmlComentarios = `
                    <hr class="linhaPequena">
                    <h3 class="titulo">Comentários</h3>
                    <span class="atualizar"><button class="botao" id="atualizar"> Atualizar <i class="fa-solid fa-spinner fa-sm"></i></button></span>
                    <table id="tabela">
                        <tbody>
                            <tr class="cabecalho">
                                <th class="botao-a" onclick="sortTable(0,false)">Comentario</th>
                                <th class="botao-a" onclick="sortTable(1,false)">Autor</th>
                                <th class="botao-a" onclick="sortTable(2,false)">Data</th>
                            </tr>
                    `
                    res.comentarios.forEach(c => {
                        htmlComentarios += `
                            <tr id="comentario-${c._id}" class="tabela-linha">
                                <td>${c.comentario}</td>
                                <td><a class="botao-a" href="/users/${c.nome}">${c.nome}</a></td>
                                <td>${c.data}</td>`
                            if (c.nome == res.user.nome || res.user.tipo == "admin") {
                                htmlComentarios += `
                                    <td>
                                        <button id=${c._id} class="botao-tab remover"> ✖
                                    </td>
                                    `
                            }

                        htmlComentarios +=`
                            </tr>
                        `
                    })

                    htmlComentarios += `
                        </tbody>
                    </table>
                    `
                    
                    $("#comentarios").append(htmlComentarios)
               } 
            }
        });
    }

    normal()

    $("body").on('click', '#comentar', function () {
        event.preventDefault()
        if ($("#comentario").val() != "") {
            $.ajax({
                url: endpoint+"/playlists/comentario/"+id,
                data: $("#comentario-form").serialize(),
                type: 'POST',
                success: function(res) {
                    $("#comentario").val("")
                    normal()
                    informa(res)
                }
            });
        } else {
            informa("Escreva algo...")
        }
    })

    $("body").on('click', '.remover', function () {
        event.preventDefault()
        $.ajax({
            url: endpoint+'/playlists/comentario/'+id,
            data: { _id: this.id },
            type: 'DELETE',
            success: function(res) {
                normal()
                informa(res)
            }
        });
    })

        
    $("body").on('click', '#atualizar', function () {
        event.preventDefault()
        normal()
    })
})