$(document).ready(function(){
   $('.acceptBtn').click(function(e){
     var tradeid = $(this).data('id');
     
     $.post( "/trade", { action: 'accept', tradeid: tradeid}, function(data){
       window.location.href = '/trade';
     });
   });
  
  $('.deleteBtn').click(function(e){
     var tradeid = $(this).data('id');
     
     $.post( "/trade", { action: 'delete', tradeid: tradeid}, function(data){
       window.location.href = '/trade';
     });
   });
  
});