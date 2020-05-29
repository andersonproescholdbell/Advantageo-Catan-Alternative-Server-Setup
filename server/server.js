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

function genMap(map, terrain, ports, rolls) {
  map = map.split(',');
  let baseTerrain = terrain.split(',');
  let basePorts = ports.split('');

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
        if (baseTerrain.length == 0) {
          baseTerrain = terrain.split(',');
        }
        let terrainIndex = Math.floor(Math.random() * baseTerrain.length);
        map[row][col] = {terrain: baseTerrain[terrainIndex]};
        baseTerrain.splice(terrainIndex, 1);
      }else {
        if (map[row][col] == 'w') {
          if (basePorts.length == 0) {
            basePorts = ports.split('');
          }
          let portIndex = Math.floor(Math.random() * basePorts.length);
          map[row][col] = {terrain: 'x'};
          if (row == 0) {
            if (wInRow%2 == 0) {
              map[row][col] = {terrain: 'p'+basePorts[portIndex]};
              basePorts.splice(portIndex, 1);
              if (col < map[row].length-1) {
                map[row][col].plankLoc = 'br';
              }else {
                map[row][col].plankLoc = 'bl';
              }
            }
          }else if (row == map.length-1) {
            if (lastPort == 'r') {
              if (wInRow%2 == 0) {
                map[row][col] = {terrain: 'p'+basePorts[portIndex]};
                basePorts.splice(portIndex, 1);
                if (wInRow == 0) {
                  map[row][col].plankLoc = 'tr';
                }else {
                  map[row][col].plankLoc = 'tl';
                }
              }
            }else {
              if (wInRow%2 == 1) {
                map[row][col] = {terrain: 'p'+basePorts[portIndex]};
                basePorts.splice(portIndex, 1);
                map[row][col].plankLoc = 'tl';
              }
            }
          }else {
            if (wInRow == 1 && row%2 == 1) {
              if (row == 1) {
                if (wInFirstRow%2 == 0) {
                  map[row][col] = {terrain: 'p'+basePorts[portIndex]};
                  basePorts.splice(portIndex, 1);
                  lastPort = 'r';
                  topRight = true;
                  map[row][col].plankLoc = 'l';
                }
              }else {
                map[row][col] = {terrain: 'p'+basePorts[portIndex]};
                basePorts.splice(portIndex, 1);
                lastPort = 'r';
                map[row][col].plankLoc = 'l';
              }
            }else if (wInRow == 0) {
              if (row == map.length-2) {
                if (topRight && row%2 == 0) {
                  map[row][col] = {terrain: 'p'+basePorts[portIndex]};
                  basePorts.splice(portIndex, 1);
                  lastPort = 'l';
                  map[row][col].plankLoc = 'r';
                }
              }else if (row%2 == 0) {
                map[row][col] = {terrain: 'p'+basePorts[portIndex]};
                basePorts.splice(portIndex, 1);
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

let players = [];
let current_turn = 0;
let timeOut;
let turn = 0;
let wait = 3000;

function next_turn(){
  turn = current_turn++ % players.length;
  players[turn].emit('your_turn');
  console.log("next turn triggered " , turn);
  triggerTimeout();
}

function triggerTimeout() {
  timeOut = setTimeout( () => {
    next_turn();
  }, wait);
}

function resetTimeOut() {
  if (typeof timeOut === 'object') {
    console.log("timeout reset");
    clearTimeout(timeOut);
  }
}

function main() {
  let maps = ['_-wwww,-wlllw,_wllllw,wlllllw,_wllllw,-wlllw,_-wwww',
              '--wwwww,_-wllllw,-wlllllw,_wllllllw,wllllllw,_wlllllw,-wllllw,_-wwwww',
              '--wwww,_-wlllw,-wllllw,_wlllllw,wllllllw,_wlllllw,-wllllw,_-wlllw,--wllw'];
  let terrain = 'f,f,f,f,s,s,s,s,w,w,w,w,o,o,o,b,b,b,d';
  let ports = 'fsobw3333';
  let rolls = '2,3,3,4,4,5,5,6,6,8,8,9,9,10,10,11,11,12';
  let map = genMap(maps[1], terrain, ports, rolls);

  io.on('connection', (socket) => {
    players.push(socket);
    console.log(players.length);
    console.log('turn: ', turn)

    socket.on('pass_turn', function() {
      console.log(turn);
      if (players[turn] == socket) {
        console.log('yes')
        resetTimeOut();
        next_turn();
      }
      console.log('turn');
    });

    socket.emit('map', map);
  
    socket.on('disconnect', () => {
      if (players.length > 1) {
        players.splice(players.indexOf(socket),1);
      }else {
        players = [];
      }
      turn--;
    });
  });
}