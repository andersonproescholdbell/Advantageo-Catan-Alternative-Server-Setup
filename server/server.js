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
  //let mapi = 'xxxx,xxxxx,xxxxxx,xxxxxx,xxxxx,xxxx';
  //let mapi = 'xxx,xxxx,xxxxx,xxxx,xxx';
  //let mapi = 'xxx,xxxx,xxx';
  //let mapi = 'xxxx,xxxxx,xxxx,xxxxx,xxxx';
  let mapi = 'xxx,xxxx,xxxxx,xxxx,xxxx,xxx,xx,xxx,xxxx,xxxxx';
  //let mapi = 'xxx,xxx,xxxx,xxxx';
  /*NEED TO FIX DIMENSIONS FOR let mapi = 'xxx,xxx,xxxx,xxxxx';*/
  let terraini = 't,t,t,t,s,s,s,s,w,w,w,w,o,o,o,b,b,b,d'+',t,t,s,s,w,w,o,o,b,b,d,d,b,b,b,b,b,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o';
  let mapData = genMap(mapi, terraini);

  io.on('connection', (socket) => {
    console.log(socket.id + ' connected.');

    socket.emit('mapData', mapData);
  
    socket.on('disconnect', () => {
      console.log(socket.id + ' disconnected.');
    });
  });
}

function getPortLocs(map) {
  function subAdd(map, row, lastLen) {
    if (map[row].length > lastLen) {
      return 'sub';
    }else if (map[row].length < lastLen) {
      return 'add';
    }else {
      if (lastMove == 'add') {
        return 'sub';
      }else {
        return 'add';
      }      
    }
  }

  let shores = 0;
  let lastMove = 'none';
  for (let row = 1; row < map.length-1; row++) {
    let lastLen = map[row-1].length;
    let currLen = map[row].length;
    let nextLen = map[row+1].length;

    lastMove = subAdd(map, row, lastLen, lastMove);
    let nextMove = subAdd(map, row+1, map[row].length, lastMove);

    let firstRow = 1;
    let lastRow = map.length-2;
    for (let col = 1; col < map[row].length-1; col++) {
      let firstCol = 1;
      let lastCol = map[row].length-2; 

      let thisCol = map[row][col];

      if (row == firstRow) {
        thisCol.sea.push(1,2);
      }else if (row == lastRow) {
        thisCol.sea.push(4,5);
      }
      if (col == firstCol) {
        thisCol.sea.push(3);
      }else if (col == lastCol) {
        thisCol.sea.push(0);
      }

      if (row != firstRow) {
        if (col == firstCol) {
          if (currLen > lastLen) {
            thisCol.sea.push(2);
          }else if (currLen == lastLen) {
            if (lastMove == 'sub') {
              thisCol.sea.push(2);
            }
          }
        }else if (col == lastCol) {
          if (currLen > lastLen) {
            thisCol.sea.push(1);
          }else if (currLen == lastLen) {
            if (lastMove == 'add') {
              thisCol.sea.push(1);
            }
          }
        }
      }
      if (row != lastRow) {
        if (col == firstCol) {
          if (currLen > nextLen) {
            thisCol.sea.push(4);
          }else if (currLen == nextLen) {
            if (nextMove == 'add') {
              thisCol.sea.push(4);
            }
          }
        }else if (col == lastCol) {
          if (currLen > nextLen) {
            thisCol.sea.push(5);
          }else if (currLen == nextLen) {
            if (nextMove == 'sub') {
              thisCol.sea.push(5);
            }
          }
        }
      }
      shores += thisCol.sea.length;
    }
  }
  return {map: map, shores: shores, ports: Math.floor(shores/(10/3))};
}

function genMap(map, terrain) {
  map = map.split(',');
  terrain = terrain.split(',');
  
  //adding terrain and side sea
  for (let row = 0; row < map.length; row++) {
    map[row] = map[row].split('');
    for (let col = 0; col < map[row].length; col++) {
      let terrainIndex = Math.floor(Math.random() * terrain.length);
      map[row][col] = {terrain: terrain[terrainIndex], sea: []};
      terrain.splice(terrainIndex, 1);
    }
    map[row].unshift({terrain: 'x', sea: []});
    map[row].push({terrain: 'x', sea: []});
  }

  //adding top and bottom sea
  map.unshift([]);
  map.push(([]));
  for (let i = 0; i < map[1].length-1; i++) {
    map[0].push({terrain: 'x', sea: []});
  }
  for (let i = 0; i < map[map.length-2].length-1; i++) {
    map[map.length-1].push({terrain: 'x', sea: []});
  }

  return getPortLocs(map);
}