const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '/../public');
const port = process.env.PORT || 3000
let app = express();
let server = http.createServer(app);
let io = socketIO(server);

app.use(express.static(publicPath));

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
  main();
})
;
function main() {
  //let startMap = 'xxxx,xxxxx,xxxxxx,xxxxxx,xxxxx,xxxx';
  let mapi = 'xxx,xxxx,xxxxx,xxxx,xxx';
  //let startMap = 'xxxxx,xxxxxx,xxxxxx,xxxxxx,xxxxx';
  let terraini = 't,t,t,t,s,s,s,s,w,w,w,w,o,o,o,b,b,b,d';//+',t,t,s,s,w,w,o,o,b,b,d,d,b,b,b,b,b,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o';
  let map = genMap(mapi, terraini);

  io.on('connection', (socket) => {
    console.log(socket.id + ' connected.');

    socket.emit('map', map);
  
    socket.on('disconnect', () => {
      console.log(socket.id + ' disconnected.');
    });
  });
}

function genMap(map, terrain) {
  map = map.split(',');
  terrain = terrain.split(',');
  
  //adding terrain and side sea
  for (let row = 0; row < map.length; row++) {
    map[row] = map[row].split('');
    for (let col = 0; col < map[row].length; col++) {
      let terrainIndex = Math.floor(Math.random() * terrain.length);
      map[row][col] = {terrain: terrain[terrainIndex],
                       vertices: {t: '', tl: '', bl: '', b: '', br: '', tr: ''},
                       edges: {tl: '', l: '', bl: '', br: '', r: '', tr: ''}};
      terrain.splice(terrainIndex, 1);
    }
    map[row].unshift({terrain: 'x',
                      vertices: {t: '', tl: '', bl: '', b: '', br: '', tr: ''},
                      edges: {tl: '', l: '', bl: '', br: '', r: '', tr: ''}});
    map[row].push({terrain: 'x',
                   vertices: {t: '', tl: '', bl: '', b: '', br: '', tr: ''},
                   edges: {tl: '', l: '', bl: '', br: '', r: '', tr: ''}});
  }

  //adding top and bottom sea
  map.unshift([]);
  map.push(([]));
  for (let i = 0; i < map[1].length-1; i++) {
    map[0].push({terrain: 'x',
                 vertices: {t: '', tl: '', bl: '', b: '', br: '', tr: ''},
                 edges: {tl: '', l: '', bl: '', br: '', r: '', tr: ''}});
    map[map.length-1].push({terrain: 'x',
                            vertices: {t: '', tl: '', bl: '', b: '', br: '', tr: ''},
                            edges: {tl: '', l: '', bl: '', br: '', r: '', tr: ''}});
  }

  return map
}

function genPorts() {
  //need to know edges that touch sea so we can make ports that are not adjacent

  let shores = 0;
  for (let row = 0; row < map.length; row++) {
    if (row == 0 || row == map.length-1) {
      shores += map[row].length;
    }else {
      shores += 2;
    }  
  }
  let ports = Math.floor(9+(shores-12)/2);
  let portLocs = [];
  while (portLocs.length < ports) {
    let randInt = Math.floor(Math.random() * shores);
    if (!portLocs.includes(randInt)) {
      portLocs.push(randInt);
    }
  }
}
