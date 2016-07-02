$(document).ready(function(){
    $('.deletelabel').click(function(e){
        // delete post
        var bookid = $(this).data('id');
        var data = {
            action: 'delete',
            bookid: bookid
        };
        $.post( "/my", data, function(data){
          $('#book'+bookid).remove();  
        });
        return false;
    });
});