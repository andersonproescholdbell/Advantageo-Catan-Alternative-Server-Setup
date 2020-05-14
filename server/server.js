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
  let mapi = 'xxx,xxxx,xxx,xxxx,xxx';
  let terraini = 't,t,t,t,s,s,s,s,w,w,w,w,o,o,o,b,b,b,d'+',t,t,s,s,w,w,o,o,b,b,d,d,b,b,b,b,b,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o';
  let map = genMap(mapi, terraini);

  io.on('connection', (socket) => {
    console.log(socket.id + ' connected.');

    socket.emit('map', map);

    //now that we have number of ports, we need to know where to place them
    //should be done serverside, may have to assume width 1000 and height 1000 and base off of locations
    //to decide where ports go
    
    //map = placePorts(map);
  
    socket.on('disconnect', () => {
      console.log(socket.id + ' disconnected.');
    });
  });
}

function placePorts(map) {
  let portData = getNumPorts(map);
  let portPlacements = [];
  while (portPlacements.length < portData.ports) {
    let rand = Math.floor(Math.random() * Math.floor(portData.shores));
    if (!portPlacements.includes(rand)) {
      portPlacements.push(rand);
    }
  }

  let count = 0;
  let map2 = map;
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      if (portPlacements.includes(count)) {
        if (row == 0) {

        }
      }
      
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
      count++;
    }
  }

  return map;
}

function getNumPorts(map) {
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
  return {shores: shores, ports: Math.floor(shores/(10/3))};
}

function genMap(map, terrain) {
  map = map.split(',');
  terrain = terrain.split(',');
  
  //adding terrain and side sea
  for (let row = 0; row < map.length; row++) {
    map[row] = map[row].split('');
    for (let col = 0; col < map[row].length; col++) {
      let terrainIndex = Math.floor(Math.random() * terrain.length);
      map[row][col] = {terrain: terrain[terrainIndex]};
      terrain.splice(terrainIndex, 1);
    }
    map[row].unshift({terrain: 'x'});
    map[row].push({terrain: 'x'});
  }

  //adding top and bottom sea
  map.unshift([]);
  map.push(([]));
  for (let i = 0; i < map[1].length-1; i++) {
    map[0].push({terrain: 'x'});
  }
  for (let i = 0; i < map[map.length-2].length-1; i++) {
    map[map.length-1].push({terrain: 'x'});
  }

  return map
}