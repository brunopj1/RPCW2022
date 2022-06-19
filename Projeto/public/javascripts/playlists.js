
$(function() {

    $("body").on('click', '.remover', function () {
        event.preventDefault()
        
        var id = this.id

        $.ajax({
            url: endpoint+'/playlists/'+id,
            type: 'DELETE',
            success: function(response) {
                console.log(response)
                $(`#${id}`).remove();
            }
        });
    })
})