

$(function() {

    $("body").on('click', '.remover', function () {
        event.preventDefault()
        
        var id = this.id

        $.ajax({
            url: endpoint+'/albuns/'+id,
            type: 'DELETE',
            success: function(response) {
                $(`#${id}`).remove();
                informa(response)
            }
        });
    })

    
    $("body").on('click', '.remover-musica', function () {
        event.preventDefault()

        var id = this.id

        $.ajax({
            url: endpoint+'/musicas/',
            data: {musicas: JSON.stringify([id])},
            type: 'DELETE',
            success: function(res) {
                
                $("#"+id).remove()

                normal()
                informa(res)
            }
        });
    })
})