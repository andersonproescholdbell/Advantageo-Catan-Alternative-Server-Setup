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
  let baseRolls = rolls.split(',');

  let rollData = [];
  rolls = [];
  for (let row = 0; row < map.length; row++) {
    rollData.push({});
    let offset = 0;
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] == '_') {
        offset += 0.5;
      }else if (map[row][col] == '-' || map[row][col] == 'w') {
        offset++;
      }else {
        offset++;
        let currLen = Object.keys(rollData[row]).length;
        while (Object.keys(rollData[row]).length == currLen) {
          let roll = baseRolls[Math.floor(Math.random() * baseRolls.length)];
          if (roll == '6' || roll == '8') {
            if (rollData[row][offset-1] != '6' && rollData[row][offset-1] != '8') {
              let above = [];
              for (let i = offset-0.5; i < offset+1; i += 0.5) {
                above.push(rollData[row-1][i]);
              }
              if (!above.includes('6') && !above.includes('8')) {
                rollData[row][offset] = roll;
                rolls.push(roll);
              }
            }
          }else {
            rollData[row][offset] = roll;
            rolls.push(roll);
          }
        }
      }
    }
  }

  let wInFirstRow = 0;
  for (let i = 0; i < map[0].length; i++) {
    if (map[0][i] == 'w') {
      wInFirstRow++;
    }
  }
  let lastPort = '';
  let topRight = false;
  let rollCount = 0;
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
        if (map[row][col].terrain != 'd') {
          map[row][col].roll = rolls[rollCount];
          rollCount++;
        }
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
  return map;
}