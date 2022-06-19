
$(function() {

    $("body").on('click', '.remover', function () {
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