

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
})