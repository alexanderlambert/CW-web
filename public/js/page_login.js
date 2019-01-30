$('document').ready(function(){
  document.cookie =  'access_token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';;
  console.log(document.cookie);

  $('.panel-body').collapse('toggle');

  $('.panel-heading').click(function(){
    $(this).parent().find('.panel-body').collapse("toggle");
  });

  $('#loginForm').submit(function(e){
    e.preventDefault();
    $('#feedback').html('');
    var loginData = {"username":$('#username').val(),"password":$('#password').val()}
    $.post(window.location.origin + '/login',loginData,function(data,status){
      document.cookie = 'access_token='+data;
      console.log(document.cookie);
      window.location.href = window.location.origin + "/games.html";
    });
    $(document).ajaxError(function(){
      $('#feedback').html('<div class="alert alert-danger">Username or password was incorrect.</div>')
    });
  });
});
