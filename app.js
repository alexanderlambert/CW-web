let express = require('express')
let app = express()
let bodyParser = require('body-parser')

var people = [{"username":"doctorwhocomposer","forename":"Delia", "surname":"Derbyshire", "elo":1200},
              {"username":"admin","forename":"Adam", "surname":"Miner", "elo":1200},
              {"username":"grandmaster","forename":"John", "surname":"Chessman", "elo":1200},
              {"username":"bishop","forename":"Jane", "surname":"Doe", "elo":1200},
              {"username":"en_passant","forename":"Jessica", "surname":"Thompson", "elo":1200}];
var games = [];
var pending = [];
var tokens = {"concertina":"admin"};
var passwords = {"doctorwhocomposer":"tardis","admin":"123","grandmaster":"kingsknight","bishop":"8by8","en_passant":"convention"};
var nextPending = 1;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/people', function(req, resp){
  resp.send(people)
})

app.get('/people/:username', function(req, resp){
  username = req.params.username;
  for (var i = 0; i < people.length; i++) {
    if (people[i].username === username) {
      resp.send(people[i]);
      return;
    }
  }
  resp.sendStatus(400);
})

app.get('/games', function(req, resp){
  resp.send(games)
})

app.get('/games/:usernamea', function(req, resp){
  var relgames = [];
  console.log(req.params.usernamea)
  for (var i = 0; i < games.length; i++) {
    if (games[i].white === req.params.usernamea || games[i].black === req.params.usernamea) {
      relgames.push(games[i])
    }
  }
  resp.send(relgames)
})

app.get('/games/:usernamea/:usernameb', function(req, resp){
  var relgames = [];
  console.log(req.params.usernamea)
  console.log(req.params.usernameb)
  for (var i = 0; i < games.length; i++) {
    if ((games[i].white === req.params.usernamea || games[i].black === req.params.usernamea) &&
    (games[i].white === req.params.usernameb || games[i].black === req.params.usernameb)) {
      relgames.push(games[i])
    }
  }
  resp.send(relgames)
})

app.post('/people',function(req, resp){
  if (tokens[req.body.access_token] === "admin") {
    if (req.body.username.length === 0 || req.body.forename === 0 || req.body.surname === 0) {
      resp.sendStatus(400);
      return;
    }
    for (var i = 0; i < people.length; i++) {
      if (people[i].username === req.body.username) {
        resp.sendStatus(400);
        return;
      }
    }
    people.push({"username":req.body.username,"forename":req.body.forename,"surname":req.body.surname,"elo":1200});
    console.log('Added user ' + req.body.username);
    resp.send(req.body.username);
    if(req.body.password) {
      passwords[req.body.username] = req.body.password;
      console.log('Found pwd.')
    } else {
      passwords[req.body.username] = '';
      console.log('No pwd.')
    }
  } else {
    resp.sendStatus(403);
  }
})

app.post('/games',function(req, resp){
  if (tokens[req.body.access_token] === "admin") {
    if (req.body.white === req.body.black) {
      resp.sendStatus(400);
      return;
    } else if (req.body.white.length === 0 || req.body.black.length === 0 || req.body.result.length === 0) {
      resp.sendStatus(400);
      return;
    }
    console.log(req.body);
    var foundW = false;
    var foundB = false;
    for (var i = 0; i < people.length; i++) {
      if (people[i].username === req.body.white) {
        foundW = true;
      } else if (people[i].username === req.body.black) {
        foundB = true;
      }
    }
    if (foundW && foundB) {
      var newGame = {'white':req.body.white,'black':req.body.black,'pending':'white','result':req.body.result,'id':nextPending};
      pending.push(newGame);
      nextPending += 1;
      confirmGame(nextPending-1);
      resp.sendStatus(200);
    } else {
      resp.sendStatus(400);
    }
  } else {
    resp.sendStatus(403);
  }
})

app.post('/login',function(req, resp) {
  var user = req.body.username;
  var pass = req.body.password;
  if (passwords[user] === pass) {
    var token = 'TOKEN' + Math.round(Math.random() * 1000000000);
    tokens[token] = user;
    console.log(token + ' ' + user);
    resp.send(token);
    return;
  }
  resp.sendStatus(400);
})

app.post('/token',function(req,resp) {
  resp.send(tokens[req.body.access_token]);
})

app.get('/pending',function(req,resp) {
  resp.send(pending);
})

app.get('/pending/:username',function(req,resp) {
  pendlist = []
  for (var i = 0; i < pending.length; i++) {
    if (req.params.username === pending[i][pending[i].pending]) {
      pendlist.push(pending[i]);
    }
  }
  resp.send(pendlist);
})

function confirmGame(id) {
  var game;
  const k = 32;
  for (var i = 0; i < pending.length; i++) {
    if (pending[i].id == id) {
      game = pending[i];
      pending.splice(i,1);
      break;
    }
  }
  var username_white = game.white;
  var username_black = game.black;
  var user_white; var user_black;
  for (var i = 0; i < people.length; i++) {
    if (people[i].username === username_white) {
      user_white = people[i];
    } else if (people[i].username === username_black) {
      user_black = people[i];
    }
  }
  //Calculate expected white win-rate
  var power = (user_black.elo - user_white.elo) / 400;
  var exp = 1 / (1 + Math.pow(10,power));
  var score;
  if (game.result === 'white') {score = 1;}
  else if (game.result === 'black') {score = 0;}
  else {score = 0.5;}
  diff = Math.round(Math.abs(k*(score - exp)));
  var newGame = {"white":game.white,"black":game.black,"elo_change":diff,"elo_white":user_white.elo,"elo_black":user_black.elo};
  if (game.result === 'white') {
    newGame.result = 'white';
    user_white.elo += diff;
    user_black.elo -= diff;
  } else if (game.result === 'black') {
    newGame.result = 'black';
    user_white.elo -= diff;
    user_black.elo += diff;
  } else {
    if (exp <= 0.5) {
      newGame.result = 'draw_white';
      user_white.elo += diff;
      user_black.elo -= diff;
    } else {
      newGame.result = 'draw_black';
      user_white.elo -= diff;
      user_black.elo += diff;
    }
  }
  games.push(newGame);
}

app.post('/confirm',function(req,resp) {
  var user = tokens[req.body.access_token];
  var count = 0;
  for (var i = 0; i < pending.length; i++) {
    var game = pending[i];
    if (game[game.pending]===user) {
      console.log('will confirm ' + game.id)
      confirmGame(game.id);
      count++;
    }
  }
  if (count > 0) {
    resp.send(count + ' games');
  } else {
  resp.sendStatus(403);
  }
})

app.post('/confirm/:id',function(req,resp){
  var user = tokens[req.body.access_token];
  var game;
  for (var i = 0; i < pending.length; i++) {
    if (pending[i].id == req.params.id) {
      game = pending[i];
      break;
    }
  }
  if (game === undefined) {
    resp.sendStatus(400);
  } else if (game[game.pending] === user) {
    confirmGame(req.params.id);
    resp.sendStatus(200);
  } else {
    resp.sendStatus(403);
  }
})

app.post('/cancel',function(req,resp) {
  var user = tokens[req.body.access_token];
  var willCancel = [];
  for (var i = 0; i < pending.length; i++) {
    var game = pending[i];
    if (game[game.pending]===user) {
      willCancel.push(i);
    }
  }
  for (var i = willCancel.length - 1; i >= 0; i--) {
    pending.splice(willCancel[i],1);
  }
  if(willCancel.length > 0) {
    resp.send(willCancel.length + ' games');
  } else {
    resp.sendStatus(403);
  }
})

app.post('/cancel/:id',function(req,resp){
  var user = tokens[req.body.access_token];
  var game;
  for (var i = 0; i < pending.length; i++) {
    if (pending[i].id == req.params.id) {
      game = pending[i];
      break;
    }
  }
  if (game === undefined) {
    resp.sendStatus(400);
  } else if (game[game.pending] === user) {
    pending.splice(i,1);
    resp.sendStatus(200);
  } else {
    resp.sendStatus(403);
  }
})

app.post('/record',function(req,resp) {
  var user = tokens[req.body.access_token];
  if (user === undefined) {
    resp.sendStatus(400);
  } else {
    var found = false;
    for (var i = 0; i < people.length; i++) {
      if (people[i].username === req.body.username) {
        found = true;
        break;
      }
    }
    if (!found) {
      resp.sendStatus(400);
      return;
    }
    var newGame = {'id':nextPending};
    nextPending++;
    if(req.body.colour === 'white') {
      newGame.white = user;
      newGame.black = req.body.username;
      newGame.pending = 'black';
    } else {
      newGame.black = user;
      newGame.white = req.body.username;
      newGame.pending = 'white';
    }
    if(req.body.color === req.body.result) {
      newGame.result = req.body.colour;
    } else if (req.body.result === 'draw') {
      newGame.result = 'draw';
    } else {
      if (req.body.colour === 'white') {
        newGame.result = 'black';
      } else {
        newGame.result = 'white';
      }
    }
    pending.push(newGame);
    resp.send(newGame);
  }
})

function randomGame() {
  var white = Math.floor(Math.random() * people.length);
  var black;
  do {
    black = Math.floor(Math.random() * people.length);
  } while (black === white);
  var white_user = people[white].username;
  var black_user = people[black].username;
  var game = {'white':white_user,'black':black_user,pending:'white','id':nextPending};
  nextPending++;
  var decider = Math.floor(Math.random() * 3);
  if (decider === 0) {
    game.result = 'white';
  } else if (decider === 1) {
    game.result = 'draw';
  } else {
    game.result = 'black';
  }
  pending.push(game);
  confirmGame(game.id);
}

for (var i = 0; i < 50; i++) {
  randomGame();
}

module.exports = app;
