/**
* @param databasePassword
**/

const express = require('express');
app = express();
const mysql = require('mysql');
const crypto = require('crypto');
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.use(express.static(__dirname + '/public'));

const port = 80;

var validSessions = [];
databasePassword = process.argv[2];

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: databasePassword,
  database: "users",
  multipleStatements: true
});

//test hash, should be a28a9ca63e8460b03dff84b5645c6c2a30f48149c0e5b273525cf4b80fe8a8ca
hash = crypto.createHash('sha256');
hash.update("meme");
console.log(hash.digest('hex'));


con.connect((err)=> {
  if (err) throw err;
  console.log("Connected!");
});

//might be stolen
function makeid(x) {
  var text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < x; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}
var response;
var request;

//some of this socket stuff taken from socket.io chat example
io.on('connection', (socket)=>{
  socket.on('message', (data)=>{
    keys = validSessions.map(x => x[0]);
    keyIndex = keys.indexOf(data.session);
    if (keyIndex != -1 && new Date().getTime() - validSessions[keyIndex][1] <= 420000) {
      validSessions[keyIndex][1] = new Date().getTime();
      time = new Date();
      io.emit('message', validSessions[keyIndex][2]+" @ "+(time.getHours())+":"+((t)=>t<10?"0"+t:""+t)(time.getMinutes())+" : "+ data.message);
    } else {
      console.log("removed at index " + keyIndex + ", " + validSessions.join(", "));
      if(keyIndex != -1) validSessions.splice(keyIndex, 1);
    }
  });
});

//salt length should be 7 characters
app.get('/newUser/:use/:pass/:acKey', (req, res) => {
  response = res;
  request = req;
  for(i=0;i<keywords.length;i++){
    if(req.url.toLowerCase().indexOf(keywords[i])!=-1){
      res.send("oi, fuck off with those SQL keywords (or semicolon, or either apostrophe), if this message isnt for you, please refrain from using full real words, semicolons, or apostrophes in your password/username");
      return false;
    }
  }
  con.query(`SELECT * FROM login; SELECT * FROM accountKeys WHERE auth = '${req.params.acKey}'`, (err, result) => {
    if (err) console.log(err);
    names = result[0].map(x => x.username);
    if (names.includes(request.params.use)){ response.send("account already exists");return false;}``
    if(result[1].length==0){response.send("Invalid account creation key");return false;}
    uses = result[1][0].uses;
    if(result[1].length==0||uses==0){
      if(result[1][0].uses==0) con.query(`DELETE FROM accountKeys WHERE id = '${result[1][0].id}'`);
      response.send("Invalid account creation key");
      return false;
    }
    if(uses != -1) con.query(`UPDATE accountKeys SET uses = ${uses-1} WHERE id = '${result[1][0].id}'`);

      salt = makeid(7);
      hash = crypto.createHash('sha256');
      hash.update(request.params.pass + salt);
      sql = `INSERT INTO login (username, passHash, hashSalt) VALUES ('${request.params.use}', '${hash.digest('hex')}', '${salt}')`;
      con.query(sql, (err, res) => {
        if (err) throw err;
        console.log("new user");
        response.send("account created");
      });

  });
});


var temp;
var keywords= ["delete","insert","drop", ";", "'", '"', "select", "from"];
app.get('/login/:use/:pass', (req, res) => {
  response = res;
  request = req;
  for(i=0;i<keywords.length;i++){
    if(req.url.toLowerCase().indexOf(keywords[i])!=-1){
      res.send({status:false, key:"oi, fuck off with those SQL keywords (or semicolon, or either apostrophe), if this message isnt for you, please refrain from using full real words, semicolons, or apostrophes in your password/username"});
      return false;
    }
  }
  sql = `SELECT * FROM login WHERE username = '${req.params.use}'`;
  con.query(sql, (err, result) => {
    if (err) throw err;
    if (result.length == 0) response.send({status:false,key:"Account does not exist"});
    else {
      hash = crypto.createHash('sha256');
      hash.update(request.params.pass + result[0].hashSalt);
      if (hash.digest('hex') == result[0].passHash) {
        newAuth = makeid(15);
        validSessions.push([newAuth, new Date().getTime(), result[0].username]);
        response.send({
          status: true,
          key: newAuth
        });
      } else response.send({status:false,key:"Invalid password"});
    }
  });
});

app.get("/protected/:key/:page", (req, res) => {
  keys = validSessions.map(x => x[0]);
  keyIndex = keys.indexOf(req.params.key);
  if (keyIndex != -1 && new Date().getTime() - validSessions[keyIndex][1] <= 420000) {
    validSessions[keyIndex][1] = new Date().getTime();
    path = '/protected/' + req.params.page ? req.params.page : 'index.html';
    res.sendFile(path, {
      root: './protected'
    });
  } else {
    console.log("removed at index " + keyIndex + ", " + validSessions.join(", "))
    if(keyIndex != -1) validSessions.splice(keyIndex, 1);
    res.sendFile(__dirname + "/badSession.html");
  }
});

app.get('*', (req, res) => {
  res.sendFile(__dirname + "/404.html");
});

http.listen(port, (err) => {
  if (err) return console.log('error', err);

  console.log('listening on port ' + port);
});