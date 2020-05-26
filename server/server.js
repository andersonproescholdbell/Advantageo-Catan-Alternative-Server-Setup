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
});

function main() {
  //let map = '_-wwww,-wlllw,_wllllw,wlllllw,_wllllw,-wlllw,_-wwww';
  let map = '--wwwww,_-wllllw,-wlllllw,_wllllllw,wllllllw,_wlllllw,-wllllw,_-wwwww';
  //let map = '--wwww,_-wlllw,-wllllw,_wlllllw,wllllllw,_wlllllw,-wllllw,_-wlllw,--wllw';
  let terrain = 'f,f,f,f,s,s,s,s,w,w,w,w,o,o,o,b,b,b,d';
  let ports = 'fsobw3333';
  let baseRolls = '2,3,3,4,4,5,5,6,6,8,8,9,9,10,10,11,11,12';
  map = genMap(map, terrain, ports, baseRolls);

  io.on('connection', (socket) => {
    console.log(socket.id + ' connected.');

    socket.emit('map', map);
  
    socket.on('disconnect', () => {
      console.log(socket.id + ' disconnected.');
    });
  });
}

function genMap(map, terrain, ports, rolls) {
  map = map.split(',');
  terrain = terrain.split(',');
  ports = ports.split('');

  //assigning terrains and ports with plank positions
  let wInFirstRow = 0;
  for (let i = 0; i < map[0].length; i++) {
    if (map[0][i] == 'w') {
      wInFirstRow++;
    }
  }
  let lastPort = '';
  let topRight = false;
  for (let row = 0; row < map.length; row++) {
    map[row] = map[row].split('');
    let wInRow = 0;
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] != '_' && map[row][col] != '-' && map[row][col] != 'w') {
        if (terrain.length == 0) {
          terrain = 'f,f,f,f,s,s,s,s,w,w,w,w,o,o,o,b,b,b,d'.split(',');
        }
        let terrainIndex = Math.floor(Math.random() * terrain.length);
        map[row][col] = {terrain: terrain[terrainIndex]};
        terrain.splice(terrainIndex, 1);
      }else {
        if (map[row][col] == 'w') {
          if (ports.length == 0) {
            ports = 'fsobw3333'.split('');
          }
          let portIndex = Math.floor(Math.random() * ports.length);
          map[row][col] = {terrain: 'x'};
          if (row == 0) {
            if (wInRow%2 == 0) {
              map[row][col] = {terrain: 'p'+ports[portIndex]};
              ports.splice(portIndex, 1);
              if (col < map[row].length-1) {
                map[row][col].plankLoc = 'br';
              }else {
                map[row][col].plankLoc = 'bl';
              }
            }
          }else if (row == map.length-1) {
            if (lastPort == 'r') {
              if (wInRow%2 == 0) {
                map[row][col] = {terrain: 'p'+ports[portIndex]};
                ports.splice(portIndex, 1);
                if (wInRow == 0) {
                  map[row][col].plankLoc = 'tr';
                }else {
                  map[row][col].plankLoc = 'tl';
                }
              }
            }else {
              if (wInRow%2 == 1) {
                map[row][col] = {terrain: 'p'+ports[portIndex]};
                ports.splice(portIndex, 1);
                map[row][col].plankLoc = 'tl';
              }
            }
          }else {
            if (wInRow == 1 && row%2 == 1) {
              if (row == 1) {
                if (wInFirstRow%2 == 0) {
                  map[row][col] = {terrain: 'p'+ports[portIndex]};
                  ports.splice(portIndex, 1);
                  lastPort = 'r';
                  topRight = true;
                  map[row][col].plankLoc = 'l';
                }
              }else {
                map[row][col] = {terrain: 'p'+ports[portIndex]};
                ports.splice(portIndex, 1);
                lastPort = 'r';
                map[row][col].plankLoc = 'l';
              }
            }else if (wInRow == 0) {
              if (row == map.length-2) {
                if (topRight && row%2 == 0) {
                  map[row][col] = {terrain: 'p'+ports[portIndex]};
                  ports.splice(portIndex, 1);
                  lastPort = 'l';
                  map[row][col].plankLoc = 'r';
                }
              }else if (row%2 == 0) {
                map[row][col] = {terrain: 'p'+ports[portIndex]};
                ports.splice(portIndex, 1);
                lastPort = 'l';
                map[row][col].plankLoc = 'r';
              }
            }
          }
          wInRow++;
        }else {
          map[row][col] = {terrain: map[row][col]};
        }
      }
    }
  }

  //assigning rolls
  let guarRolls = rolls.split(',');
  let safeRolls = rolls.replace(/6,/g, '').replace(/8,/g, '').split(',');
  let not68 = [];
  for (let row = 0; row < map.length; row++) {
    let offset = 0;
    let passes = 0;
    not68.push([]);
    if (row < map.length-2) {
      not68.push([]);
    }
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col].terrain == '_') {
        offset += 0.5;
      }else if (['-', 'x', 'p', 'd'].includes(map[row][col].terrain[0])) {
        offset++;
      }else {
        offset++;
        while (true) {
          if (guarRolls.length == 0) {
            guarRolls = rolls.split(',');
          }
          if (passes < 3) {
            var index = Math.floor(Math.random() * guarRolls.length);
            var roll = guarRolls[index];
          }else {
            if (safeRolls.length == 0) {
              safeRolls = rolls.replace(/6,/g, '').replace(/8,/g, '').split(',');
            }
            var roll = safeRolls[Math.floor(Math.random() * safeRolls.length)];
          }
          if (roll == '6' || roll == '8') {
            if (!not68[row].includes(offset)) {
              map[row][col].roll = roll;
              not68[row].push(offset+1);
              if (not68[row+1]) {
                not68[row+1].push(offset-0.5, offset+0.5);
              }
              if (index != undefined && passes < 3) {
                if (guarRolls.length == 1) {
                  guarRolls = [];
                }else {
                  guarRolls.splice(index, 1);
                }
              }
              passes = 0;
              break;
            }else {
              passes++;
            }
          }else {
            map[row][col].roll = roll;
            if (index != undefined && passes < 3) {
              if (guarRolls.length == 1) {
                guarRolls = [];
              }else {
                guarRolls.splice(index, 1);
              }
            }
            passes = 0;
            break;
          }
        }
      }
    }
  }

  return map;
}