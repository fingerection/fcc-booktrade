$(document).ready(function(){
  $('.requestlabel').click(function(event){
    var bookid = $(this).data('id');
    window.location.href = "/newtrade?receivebookid="+bookid;
  });
});