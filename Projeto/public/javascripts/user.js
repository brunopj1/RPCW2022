

$(document).ready(function() {

    $("body").on('click', '.remover-favorita', function () {
        event.preventDefault()
        
        var id = this.id
    
        $.ajax({
            url: endpoint+'/musicas/remover/',
            data: { _id: id },
            type: 'PUT',
            success: function(response) {
                $(`#favorita-${id}`).remove();
                informa(response)
            }
        });
    })

    $("body").on('click', '.remover-playlist', function () {
        event.preventDefault()
        
        var id = this.id
    
        $.ajax({
            url: endpoint+'/playlists/'+id,
            data: { _id: id },
            type: 'DELETE',
            success: function(response) {
                $(`#playlist-${id}`).remove();
                informa(response)
            }
        });
    })

    $("body").on('click', '#add-foto', function () {
        event.preventDefault()
        
        $("#botao").hide()
        $("#foto").append(`
        <form action="/submeter/foto" method="POST" enctype="multipart/form-data">
            <label for="foto"> Selecione a foto:
            <input type="file" name="foto" placeholder="Selecione a foto de perfil" required>
            <input class="botao" type="submit" value="Enviar">
        </form>
        `)
        $("#add-foto").hide()
    })

    $("body").on('click', '#rem-foto', function () {
        event.preventDefault()
        $.ajax({
            url: endpoint+'/submeter/foto/'+$("#nome").html(),
            type: 'DELETE',
            success: function(response) {
                location.reload()
                informa(response)
            }
        });
    })
})