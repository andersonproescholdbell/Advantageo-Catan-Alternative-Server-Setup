const path = require('path');
const express = require('express');

const publicPath = path.join(__dirname, '/../public');
const port = process.env.PORT || 3000
var app = express();

app.use(express.static(publicPath));

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
})

/*var express = require('express');
var router = express();
var serv = require('http').Server(router);

router.get('/', function(req, res) {
  res.sendFile(__dirname + '/client/index.html');
});
router.use('/client', express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 2000);
console.log('Server has started.');
//________________________________________________________________________________________________________________________

var io = require('socket.io')(serv, {});

io.on('connection', socket => {
    setInterval(function(){ socket.emit('hello', 'howdy'); }, 3000);
    console.log(socket.id + ' has connected.');
});*/