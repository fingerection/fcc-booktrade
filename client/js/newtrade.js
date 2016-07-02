$(document).ready(function(){
  $('#btn0').click(function(e){
    
    //.attr("class","newclass");
    // animationend and webkitAnimationend will trigger twice
    $('#card0').attr('class', 'fast-animation animated fadeOutLeft').one('animationend', function(event){
      $('#card0').addClass('hidden');
      $('#card1').attr('class','fast-animation animated slideInRight');
      
      $('.grid2').masonry('layout');
    });
  });
  
  $('#btn1').click(function(e){
    $('#card1').attr('class', 'fast-animation animated fadeOutRight').one('animationend', function(event){
      $('#card1').addClass('hidden');
      $('#card0').attr('class', 'fast-animation animated slideInLeft');
      $('.grid1').masonry('layout');
    });
  });

  
  $('.theirselect').click(function(e){
    $('.theirselect.select1').removeClass('select1').addClass('select0');
    $(this).addClass('select1');
  });
  
  $('.myselect').click(function(e){
    $('.myselect.select1').removeClass('select1').addClass('select0');
    $(this).addClass('select1');
  });
  
   $('#btn2').click(function(e){
     if ($('.myselect.select1').attr('id') === undefined) {
       alert("Please choose book to send");
       return;
     }
     if ($('.theirselect.select1').attr('id') === undefined) {
       alert("Please choose book to receive");
       return;
     }
     var sendbookid = $('.myselect.select1').attr('id').slice('mybid'.length);
     var receivebookid = $('.theirselect.select1').attr('id').slice('theirbid'.length);
     
     $.post( "/newtrade", { sendbookid: sendbookid, receivebookid: receivebookid}, function(data){
       window.location.href = '/trade';
     });
   });
  
});