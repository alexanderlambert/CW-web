function refreshGraph() {
  $.get(window.location.origin + '/games',function(data,status){
    labels = []
    for (var i = 1; i <= data.length; i++) {
      labels.push(''+i);
    }

    var users = $('#userList li').map(function() {return $(this).text();} ).get();
    var datasets = [];
    for (var u = 0; u < users.length; u++) {
      var elo = []
      for (var i = 0; i < labels.length; i++) {
        elo.push(1200);
      }
      var hasGame = false;
      for (var i = 1; i < data.length; i++) {
        if (data[i].white == users[u]) {
          if (data[i].result === 'white' || data[i].result === 'draw_white') {
            elo[i] = elo[i-1] + data[i].elo_change;
          } else {
            elo[i] = elo[i-1] - data[i].elo_change;
          }
          hasGame = true;
        } else if (data[i].black == users[u]) {
          if (data[i].result === 'black' || data[i].result === 'draw_black') {
            elo[i] = elo[i-1] + data[i].elo_change;
          } else {
            elo[i] = elo[i-1] - data[i].elo_change;
          }
          hasGame = true;
        } else {
          elo[i] = elo[i-1];
        }
      }
      if (hasGame) {
        var r = Math.floor(Math.random()*256);
        var g = Math.floor(Math.random()*256);
        var b = Math.floor(Math.random()*256);
        var dataset = {'label':users[u],'borderColor':'rgb('+r+','+g+','+b+')','data':elo,'fill':false};
        datasets.push(dataset);
      } else {
        $('li:contains('+users[u]+')').addClass('list-group-item-danger');
      }
    }
    chartData = {'labels':labels,'datasets':datasets};
    axes = {'yAxes':[{'scaleLabel':{'display':true,'labelString':'ELO'}}],
            'xAxes':[{'scaleLabel':{'display':true,'labelString':'Games Played'}}]};
    var chartInfo = {'type':'line','data':chartData,'options':{'scales':axes}};
    var canvas = document.getElementById('chart').getContext('2d');
    var chart = new Chart(canvas,chartInfo);
  });
}


$('document').ready(function(){
  if (document.cookie !== '') {
    $.post(window.location.origin + '/token',{'access_token':document.cookie.split('=')[1]},function(data,status){
      $('#logLink').text('Log Out - ' + data);
    })
  }

  $('.panel-body').collapse('toggle');

  $('.panel-heading').click(function(){
    $(this).parent().find('.panel-body').collapse("toggle");
  });

  refreshGraph();

  $('#dataForm').submit(function(e){
    e.preventDefault();
    $('#dataFeedback').html('');
    var list = $('#userList').html();
    var username = $('#dataUser').val();
    if (username.length === 0) {
      $('#dataFeedback').html('<div class="alert alert-danger">Please complete username field.</div>');
    } else if ($('#userList').html().includes(username)) {
      $('#dataFeedback').html('<div class="alert alert-danger">Please enter a unique username.</div>');
    } else {
      list += '<li class="list-group-item">' + username + '</li>';
      $('#userList').html(list);
      $('#dataUser').val('');
      refreshGraph();
    }
  });

  $('#dataClr').click(function(){
    $('#userList').html('');
    refreshGraph();
    $('#dataFeedback').html('<div class="alert alert-success">Successfully cleared graph users.</div>');
  });


});
