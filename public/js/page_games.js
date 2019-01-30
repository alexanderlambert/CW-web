var token = '';

function refreshPending(feedback = 1) {
  console.log('Refreshing pending...');
  $('#pendingFeedback').html();
  $.post(window.location.origin + '/token',{'access_token':token},function(data,status) {
    var username = data;
    $.get(window.location.origin + '/pending/' + username, function(data,status) {
      $('#pendingList').html('');
      var html = '';
      for (var i = 0; i < data.length; i++) {
        var element = '<li class="list-group-item"><span class="label label-%1%">%2% VS %3%</span><div class="btn-group btn-group-xs pull-right">'
            +'<button type="button" class="btn btn-success"><span class="glyphicon glyphicon-check"></span></button>'
            +'<button type="button" class="btn btn-danger"><span class="glyphicon glyphicon-remove"></span></button></div><span class="hidden">%4%</span></li>';
        var username = data[i][data[i].pending];
        if (data[i].result === 'draw') {
          element = element.replace('%1%','warning');
          element = element.replace('%2%','Draw');
        } else if ((data[i].result === 'white' && data[i].white === username)||(data[i].result === 'black' && data[i].black === username)) {
          element = element.replace('%1%','success');
          element = element.replace('%2%','Win');
        } else {
          element = element.replace('%1%','danger');
          element = element.replace('%2%','Loss');
        }
        if (data[i].pending === 'white') {
          element = element.replace('%3%',data[i].black);
        } else {
          element = element.replace('%3%',data[i].white);
        }
        element = element.replace('%4%',data[i].id);
        html += element
      }
      $('#pendingList').html(html);
      if ($('#pendingList').html() === '' && feedback) {
        $('#pendingFeedback').html('<div class="alert alert-info">You have no pending games.</div>');
      }
    })
  })

}

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
    })
  }

  $('.panel-body').collapse('toggle');

  $('.panel-heading').click(function(){
    $(this).parent().find('.panel-body').collapse("toggle");
  });

  refreshPending();

  $('#confirmAll').click(function(){
    $('#pendingFeedback').html('');
    $.post(window.location.origin + '/confirm',{'access_token':token},function(data,status) {
      refreshPending(0);
      $('#pendingFeedback').html('<div class="alert alert-success">Confirmed '+data+'.</div>');
    })
    if ($('#pendingFeedback').html() === '') {
      $('#pendingFeedback').html('<div class="alert alert-danger">Confirm failed - is your token expired?</div>');
    }
  });

  $('#cancelAll').click(function(){
    $('#pendingFeedback').html('');
    $.post(window.location.origin + '/cancel',{'access_token':token},function(data,status) {
      refreshPending(0);
      $('#pendingFeedback').html('<div class="alert alert-success">Cancelled '+data+'.</div>');
    })
    if ($('#pendingFeedback').html() === '') {
      $('#pendingFeedback').html('<div class="alert alert-danger">Cancel failed - is your token expired?</div>');
    }
  });

  $('.list-group').on('click','.btn-success',function(){
    var id = $(this).parent().parent().find('.hidden').text();
    $('#pendingFeedback').html('');
    $.post(window.location.origin + '/confirm/'+id,{'access_token':token},function(data,status){
      refreshPending(0);
      $('#pendingFeedback').html('<div class="alert alert-success">Successfully confirmed pending game.</div>');
    })
    if ($('#pendingFeedback').html() === ''){
      $('#pendingFeedback').html('<div class="alert alert-danger">Confirm failed - is your token expired?</div>')
    }
  })

  $('.list-group').on('click','.btn-danger',function(){
    var id = $(this).parent().parent().find('.hidden').text();
    $('#pendingFeedback').html('');
    $.post(window.location.origin + '/cancel/'+id,{'access_token':token},function(data,status){
      refreshPending(0);
      $('#pendingFeedback').html('<div class="alert alert-success">Successfully cancelled pending game.</div>');
    })
    if ($('#pendingFeedback').html() === ''){
      $('#pendingFeedback').html('<div class="alert alert-danger">Cancel failed - is your token expired?</div>')
    }
  })

  $('#recordForm').submit(function(e){
    e.preventDefault();
    $('#recordFeedback').hide();
    $('#recordFeedback').html('<div class="alert alert-danger">Unable to submit game. Is the username correct?</div>');
    var colour = $('input[name="colour"]:checked').val();
    var outcome = $('input[name="outcome"]:checked').val();
    var username = $('#recordUsername').val();
    var result = 'white'
    if ((outcome === 'win' && colour === 'black') || (outcome === 'loss' && colour === 'white')) {
      result = 'black';
    } else if (outcome === 'draw') {
      result = 'draw';
    }
    var toSubmit = {'access_token':token,'colour':colour,'result':result,'username':username};
    console.log(toSubmit);
    $.post(window.location.origin + '/record',toSubmit,function(data,status){
      $('#recordUsername').val('');
      $('#recordFeedback').html('<div class="alert alert-success">Your game has been sent for your opponent to review.</div>');
    })
    $('#recordFeedback').show();
  })

});
