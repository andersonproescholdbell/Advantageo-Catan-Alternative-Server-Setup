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
  let mapi = 'xxxx,xxxxx,xxxxxx,xxxxxx,xxxxx,xxxx';
  //let mapi = 'xxx,xxxx,xxxxx,xxxx,xxx';
  //let mapi = 'xxxxx,xxxxx,xxxxx,xxxxxx,xxxxx,xxxx';
  let terraini = 't,t,t,t,s,s,s,s,w,w,w,w,o,o,o,b,b,b,d'+',t,t,s,s,w,w,o,o,b,b,d,d,b,b,b,b,b,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o';
  let map = genMap(mapi, terraini);

  io.on('connection', (socket) => {
    console.log(socket.id + ' connected.');

    socket.emit('map', map);

    socket.emit('shores', genPorts(map));
  
    socket.on('disconnect', () => {
      console.log(socket.id + ' disconnected.');
    });
  });
}

//right now there are duplicate edges and vertices coordinates, need to rework
//rethink how to add boats

function firstCol(previouses, current, next) {
  if (current > previous) {
    if (next > current) {
      return {shores: 4, edges: {tl: ['sea'], l: ['sea'], bl: [], br: [], r: [], tr: []}}
    }else if (next < current) {
      return {shores: 6, edges: {tl: ['sea'], l: ['sea'], bl: ['sea'], br: [], r: [], tr: []}}
    }else {
      //if ()
      return {shores: 5, edges: {tl: ['sea'], l: ['sea'], bl: [], br: [], r: [], tr: []}}
    }
  }else if (current < previous) {
    if (next > current) {
      shores += 2;
    }else if (next < current) {
      shores += 4;
    }else {
      shores += 3;
    }
  }else {
    if (next > current) {
      shores += 3;
    }else if (next < current) {
      shores += 5;
    }else {
      shores += 4;
    }
  }
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
  }
  for (let i = 0; i < map[map.length-2].length-1; i++) {
    map[map.length-1].push({terrain: 'x',
                            vertices: {t: '', tl: '', bl: '', b: '', br: '', tr: ''},
                            edges: {tl: '', l: '', bl: '', br: '', r: '', tr: ''}});
  }

  return map
}

function genPorts(map) {
  let shores = 0;
  for (let row = 0; row < map.length; row++) {
    if (row == 0 || row == map.length-1) {
      shores += (map[row].length-1)*2;
    }else {
      let previous = map[row-1].length;
      let current = map[row].length;
      let next = map[row+1].length;
      if (row == 1) {
        if (next > current) {
          shores += 2;
        }else if (next < current) {
          shores += 4;
        }else {
          shores += 3;
        }
      }else if (row == map.length-2) {
        if (previous > current) {
          shores += 2;
        }else if (previous < current) {
          shores += 4;
        }else {
          shores += 3;
        }
      }else {
        if (current > previous) {
          if (next > current) {
            shores += 4;
          }else if (next < current) {
            shores += 6;
          }else {
            shores += 5;
          }
        }else if (current < previous) {
          if (next > current) {
            shores += 2;
          }else if (next < current) {
            shores += 4;
          }else {
            shores += 3;
          }
        }else {
          if (next > current) {
            shores += 3;
          }else if (next < current) {
            shores += 5;
          }else {
            shores += 4;
          }
        }
      }
    }
  }
  return Math.floor(shores/(10/3));
}
