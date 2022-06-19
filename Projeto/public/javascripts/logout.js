

$(function() {
    $("body").on('click', '#logout', () => {
        $.ajax({
            url: endpoint+'/autenticar/logout',
            type: 'POST',
            success: function(data) {
               window.location.replace(endpoint+"/autenticar/login")
            }
        });
    })
})