var ldrPage = 0;
var gamesPage = 0;

function sortPairs(pairs) {
  function compare(a,b) {
    if (a[1] === b[1]) {
      return 0;
    } else if (a[1] <= b[1]) {
      return 1;
    }
    return -1;
  }
  pairs.sort(compare)
  return pairs;
}

function refreshLeaderboard() {
  console.log('Refreshing Leaderboard...');
  $('#leaderboard').html('');

  const perPage = 5;

  $.get(window.location.origin + "/people", function(data){
    var html = '';
    var pairs = []
    for (var i = 0; i < data.length; i++) {
      pairs.push([data[i].username,data[i].elo]);
    }

    pairs = sortPairs(pairs);

    while (ldrPage*perPage >= data.length && ldrPage > 0) {
      ldrPage -= 1;
    }

    var end = Math.min(data.length,(ldrPage+1)*perPage)

    for (var i = ldrPage*perPage; i < end; i++) {
      entry = '<li class="list-group-item"><span class="label label-primary"># %1%</span> %2% - %3%</li>'
      entry = entry.replace('%1%',i+1);
      entry = entry.replace('%2%',pairs[i][1]);
      entry = entry.replace('%3%',pairs[i][0]);
      html += entry;
    }

    if (ldrPage === 0) {
      $('#ldrBack').hide()
    } else {
      $('#ldrBack').show()
    }

    if (data.length > (ldrPage+1)*perPage) {
      $('#ldrFwd').show()
    } else {
      $('#ldrFwd').hide()
    }

    $('#leaderboard').html(html);
  });
}

function refreshGames(userA='',userB='') {
  console.log('Refreshing Games...');
  $('#games').html('');
  var address = window.location.origin + "/games";
  if (userA.length > 0) {
    address += "/" + userA;
  }
  if (userB.length > 0) {
    address += "/" + userB;
  }
  $.get(address,function(data){
    const perPage = 10;
    var html = '';
    data = data.reverse();
    while (gamesPage*perPage >= data.length && gamesPage > 0) {
      gamesPage -= 1;
    }
    var end = Math.min(data.length,(gamesPage+1)*perPage);
    for (var i = gamesPage*perPage; i < end; i++) {
      entry = '<li class="list-group-item"><span class="label label-%1%">W (%2%%3%)</span> %4% VS %5% <span class="label label-%6%">B (%7%%8%)</span></li>'
      if (data[i].result === 'white') {
        entry = entry.replace('%1%','success');
        entry = entry.replace('%6%','danger');
      } else if (data[i].result == 'black') {
        entry = entry.replace('%1%','danger');
        entry = entry.replace('%6%','success');
      } else {
        entry = entry.replace('%1%','warning');
        entry = entry.replace('%6%','warning');
      }
      if (data[i].result === 'white' || data[i].result === 'draw_white') {
        entry = entry.replace('%3%','+' + data[i].elo_change);
        entry = entry.replace('%8%','-' + data[i].elo_change);
      } else {
        entry = entry.replace('%3%','-' + data[i].elo_change);
        entry = entry.replace('%8%','+' + data[i].elo_change);
      }
      entry = entry.replace('%2%',data[i].elo_white);
      entry = entry.replace('%7%',data[i].elo_black);
      entry = entry.replace('%4%',data[i].white);
      entry = entry.replace('%5%',data[i].black);
      html += entry
    }
    $('#games').html(html);
    if (gamesPage === 0) {
      $('#gamesBack').hide()
    } else {
      $('#gamesBack').show()
    }

    if (data.length > (gamesPage+1)*perPage) {
      $('#gamesFwd').show()
    } else {
      $('#gamesFwd').hide()
    }
  });
}

$('document').ready(function(){
  if (document.cookie !== '') {
    $.post(window.location.origin + '/token',{'access_token':document.cookie.split('=')[1]},function(data,status){
      $('#logLink').text('Log Out - ' + data);
    })
  }

  refreshLeaderboard()
  refreshGames();

  var filterUserA = '';
  var filterUserB = '';

  $('.panel-body').collapse('toggle');

  $('.panel-heading').click(function(){
    $(this).parent().find('.panel-body').collapse("toggle");
  })

  $('#ldrBack').click(function(){
    ldrPage = Math.max(ldrPage-1,0);
    refreshLeaderboard();
  });

  $('#ldrFwd').click(function(){
    ldrPage++;
    refreshLeaderboard();
  });

  $('#gamesBack').click(function(){
    gamesPage = Math.max(gamesPage-1,0);
    refreshGames(filterUserA,filterUserB);
  });

  $('#gamesFwd').click(function(){
    gamesPage++;
    refreshGames(filterUserA,filterUserB);
  });

  $('#gamesFormClr').click(function(){
    $('#filterUserA').val('');
    $('#filterUserB').val('');
    $('#gamesForm').submit();
    $('#gamesForm button').attr('class','btn btn-default');
  });

  $('#gamesForm').submit(function(e){
    e.preventDefault();
    gamesPage = 0;
    filterUserA = $('#filterUserA').val();
    filterUserB = $('#filterUserB').val();
    if (filterUserA.length > 0 || filterUserB > 0) {
      $('#gamesForm button').attr('class','btn btn-info');
    } else {
      $('#gamesForm button').attr('class','btn btn-default');
    }
    refreshGames(filterUserA,filterUserB);
  });

  $('#findForm').submit(function(e){
    e.preventDefault();
    var element = '';
    $('#findResult').html('');
    var username = $('#findUsername').val();
    if (username.length === 0) {
      $('#findResult').html('<div class="alert alert-danger">Please enter a user to search for.</div>');
      return;
    }
    $.get(window.location.origin + '/people/'+username,function(data,status){
      element = '<div class="well">'+
                '<strong>Username:</strong> %1%<br>'+
                '<strong>Forename:</strong> %2%<br>'+
                '<strong>Surname:</strong> %3%<br>'+
                '<strong>ELO:</strong> %4%<br>'+
                '<strong>Rank:</strong> %5%<br></div>';
      element = element.replace('%1%',data.username);
      element = element.replace('%2%',data.forename);
      element = element.replace('%3%',data.surname);
      element = element.replace('%4%',data.elo);
      $('#findResult').html(element);
      $.get(window.location.origin + '/people',function(data,status){
        var people = []
        for (var i = 0; i < data.length; i++) {
          people.push([data[i].username,data[i].elo]);
        }
        people = sortPairs(people);
        console.log(people);
        for (var i = 0; i < data.length; i++) {
          if (people[i][0] === username) {
            console.log(username);
            console.log(i+1);
            $('#findResult').html($('#findResult').html().replace('%5%','#'+(i+1)));
            return;
          }
        }
      });
    });
    if ($('#findResult').html() === '') {
      $('#findResult').html('<div class="alert alert-danger">Unable to find user with matching username.</div>');
    }
  })

});
