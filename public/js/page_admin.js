var token = '';

$('document').ready(function(){
  console.log(document.cookie);
  if (document.cookie === '') {
    window.location.href = window.location.origin + '/login.html';
  } else {
    token = document.cookie.split('=')[1];
    console.log('SET: '+token);
  }

  if (token !== '') {
    $.post(window.location.origin + '/token',{'access_token':token},function(data,status){
      $('#logLink').text('Log Out - ' + data);
      if (data !== 'admin') {
        window.location.href = window.location.origin + '/login.html';
      }
    })
  }

  $('.panel-body').collapse('toggle');

  $('.panel-heading').click(function(){
    $(this).parent().find('.panel-body').collapse("toggle");
  });

  $('#userForm').submit(function(e){
    e.preventDefault();
    $('#userFeedback').hide();
    $('#userFeedback').html('<div class="alert alert-danger">Username invalid - unable to add user.</div>');
    var username = $('#userUsername').val();
    var forename = $('#userFname').val();
    var surname = $('#userSname').val();
    var password = $('#userPassword').val();
    if(username === '' || forename === '' || surname === '' || password === '') {
      $('#userFeedback').html('<div class="alert alert-danger">Please complete all fields.</div>');
    } else {
      var toSend = {'username':username,'forename':forename,'surname':surname,'password':password,'access_token':token};
      $.post(window.location.origin + '/people', toSend, function(data,status) {
        $('#userUsername').val('');
        $('#userFname').val('');
        $('#userSname').val('');
        $('#userPassword').val('');
        $('#userFeedback').html('<div class="alert alert-success">Successfully added user.</div>');
      })
    }
    $('#userFeedback').show();
  })

  $('#gameForm').submit(function(e){
    e.preventDefault();
    $('#gameFeedback').hide();
    var userWhite = $('#gameWhite').val();
    var userBlack = $('#gameBlack').val();
    var result = $('input[name="outcome"]:checked').val();
    $('#gameFeedback').html('<div class="alert alert-danger">Usernames invalid - unable to add game.</div>');
    if (userWhite === '' || userBlack === '') {
      $('#gameFeedback').html('<div class="alert alert-danger">Please complete all fields.</div>');
    } else if (userWhite === userBlack) {
      $('#gameFeedback').html('<div class="alert alert-danger">Please enter two unique usernames.</div>');
    } else {
      var toSend = {'access_token':token,'white':userWhite,'black':userBlack,'result':result};
      $.post(window.location.origin + '/games', toSend, function(data,status){
        var userWhite = $('#gameWhite').val('');
        var userBlack = $('#gameBlack').val('');
        $('#gameFeedback').html('<div class="alert alert-success">Successfully added game.</div>');
      })
    }
    $('#gameFeedback').show();
  })

});
