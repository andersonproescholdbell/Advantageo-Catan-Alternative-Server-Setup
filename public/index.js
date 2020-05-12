let socket = io();

socket.on('connect', () => {
  console.log('connected to server');
});

socket.on('disconnect', () => {
  console.log('disconnected from server');
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function offset(x) {
  return Math.floor(x)+0.5;
}

function rotate(cx, cy, x, y, angle) {
  let radians = (Math.PI / 180) * angle,
      cos = Math.cos(radians),
      sin = Math.sin(radians),
      nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
      ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
  return [offset(nx), offset(ny)];
}

function indexLongest(arr, last) {
  let max = arr[0].length;
  let maxIndex = 0;

  for (let i = 1; i < arr.length; i++) {
    if (arr[i].length > max) {
      maxIndex = i;
      max = arr[i].length;
    }
  }
  if (last) {
    max = arr[0].length;
    maxIndex = 0;
    for (let i = 1; i < arr.length; i++) {
      if (arr[i].length >= max) {
        maxIndex = i;
        max = arr[i].length;
      }
    }
  }
  return maxIndex;
}

function getMapData(map) {
  let mapData = {};
  mapData.longest = indexLongest(map);
  mapData.rows = map.length;
  mapData.columns = map[mapData.longest].length;
  return mapData;
}

function genMap(map, terrain) {
  map = map.split(',');
  terrain = terrain.split(',');
  for (let row = 0; row < map.length; row++) {
    map[row] = map[row].split('');
    for (let col = 0; col < map[row].length; col++) {
      let terrainIndex = Math.floor(Math.random() * terrain.length);
      map[row][col] = terrain[terrainIndex];
      terrain.splice(terrainIndex, 1);
    }
    map[row].unshift('x');
    map[row].push('x');
  }
  map.unshift('x,'.repeat(map[0].length-1).slice(0, -1).split(','));
  map.push('x,'.repeat(map[map.length-1].length-1).slice(0, -1).split(','));
  return map
}

function genCenters(map) {
  let mapData = getMapData(map);
  let longest = indexLongest(map);
  let lastLongest = indexLongest(map, true);

  let lenMid = map[longest].length;
  let numMid = 0;
  for (let i = 0; i < map.length; i++) {
    if (map[i].length == map[longest].length) {
      numMid++;
    }
  }

  //will need to see how this works if browser height > width
  let vertToVert = (window.innerHeight*0.98)/(mapData.rows-(0.25*(mapData.rows-1)));
  let apothem = vertToVert/4 * Math.tan(Math.PI/3);
  let tip = apothem*Math.tan(Math.PI/6);
  
  let midx = window.innerWidth/2;
  let midy = window.innerHeight/2;
  let centers = [];
  /*if (numMid%2 == 0) {
    if (lenMid%2 == 0) {//numMid even lenMid even
      let top = midy - 1.5*tip + Math.floor(map.length/2)*apothem*Math.sqrt(3);
      for (let row = 0; row < map.length; row++) {
        centers.push([]);
        if (row > (map.length/2 - 1)) {
          var left = midx + apothem/2 - (map[row].length-1)*apothem;
        }else {
          var left = midx - apothem/2 - (map[row].length-1)*apothem;
        }
        for (let col = 0; col < map[row].length; col++) {
          let x = left + col*2*apothem;
          let y = top - row*apothem*Math.sqrt(3);
          centers[centers.length-1].push({x: x, y: y});
        }
      }
    }else {//numMid even lenMid odd
      let top = midy - 1.5*tip + Math.floor(map.length/2)*apothem*Math.sqrt(3);
      for (let row = 0; row < map.length; row++) {
        centers.push([]);
        if (row > (map.length/2 - 1)) {
          var left = midx + apothem/2 - (map[row].length-1)*apothem;
        }else {
          var left = midx - apothem/2 - (map[row].length-1)*apothem;
        }
        for (let col = 0; col < map[row].length; col++) {
          let x = left + col*2*apothem;
          let y = top - row*apothem*Math.sqrt(3);
          centers[centers.length-1].push({x: x, y: y});
        }
      }
    }
  }else {
    if (lenMid%2 == 0) {//numMid odd lenMid even

    }else {//numMid odd lenMid odd
      let top = midy + Math.floor(map.length/2)*apothem*Math.sqrt(3);
      for (let row = 0; row < map.length; row++) {
        centers.push([]);
        //let left = midx - (map[row].length-1)*apothem;
        if (row >= longest && row <= lastLongest) {
          if (row%2 == 0) {
            var left = midx - apothem/2 - (map[row].length-1)*apothem;
          }else {
            var left = midx + apothem/2 - (map[row].length-1)*apothem;
          }
        }else {
          var left = midx + apothem/2 - (map[row].length-1)*apothem;
        }
        for (let col = 0; col < map[row].length; col++) {
          let x = left + col*2*apothem;
          let y = top - row*apothem*Math.sqrt(3);
          centers[centers.length-1].push({x: x, y: y});
        }
      }
    }
  }*/
  /*for (let row = 0; row < map.length; row++) {
    centers.push([]);
    let tiles = map[row].length;
    let top = midy + Math.floor(map.length/2)*apothem*Math.sqrt(3);
    if (tiles%2 == 0) {
      for (let col = 0; col < tiles; col++) {
        if (col <= tiles/2 - 1) {
          let x = midx + apothem - (col+1)*2*apothem;
          let y = top - row*apothem*Math.sqrt(3); 
          centers[centers.length-1].push({x: x, y: y});
        }else {
          let x = midx + apothem + (col-tiles/2)*2*apothem;
          let y = top - row*apothem*Math.sqrt(3); 
          centers[centers.length-1].push({x: x, y: y});
        }
      }
    }else {
      for (let col = 0; col < tiles; col++) {
        if (row%2 == 0) {
          if (col <= tiles/2 - 1) {
            let x = midx - (col+1)*2*apothem;
            let y = top - row*apothem*Math.sqrt(3); 
            centers[centers.length-1].push({x: x, y: y});
          }else {
            let x = midx + apothem + (col-tiles/2)*2*apothem;
            let y = top - row*apothem*Math.sqrt(3); 
            centers[centers.length-1].push({x: x, y: y});
          }
        }else {
          if (col <= tiles/2 - 1) {
            let x = midx - apothem - (col+1)*2*apothem;
            let y = top - row*apothem*Math.sqrt(3); 
            centers[centers.length-1].push({x: x, y: y});
          }else {
            let x = midx + (col-tiles/2)*2*apothem;
            let y = top - row*apothem*Math.sqrt(3); 
            centers[centers.length-1].push({x: x, y: y});
          }
        }
      }
    }
  }*/
  let left = midx - (map[0].length-1)*apothem; 
  if (map.length%2 == 0) {
    var top = midy + 1.5*tip - Math.floor(map.length/2)*apothem*Math.sqrt(3);
  }else {
    var top = midy - Math.floor(map.length/2)*apothem*Math.sqrt(3);
  }
  let lastLen = map[0].length;
  let lastMove = 'none';
  for (let row = 0; row < map.length; row++) {
    centers.push([]);

    if (row != 0) {
      if (map[row].length > lastLen) {
        left -= apothem;
        lastMove = 'sub';
      }else if (map[row].length < lastLen) {
        left += apothem;
        lastMove = 'add';
      }else {
        if (lastMove == 'add') {
          left -= apothem;
          lastMove = 'sub';
        }else {
          left += apothem;
          lastMove = 'add';
        }      
      }
      lastLen = map[row].length;
    }

    for (let col = 0; col < map[row].length; col++) {
      let x = left + col*2*apothem;
      let y = top + row*apothem*Math.sqrt(3); 
      centers[centers.length-1].push({x: x, y: y});
    }
  }
  return {centers: centers, vertToVert: vertToVert};
}

async function drawMap(map, centers, vertToVert, ctx) {
  let images = {tree: '/img/tree.svg', ore: '/img/ore.svg', water: '/img/water.svg', brick: '/img/brick.svg',
                sheep: '/img/sheep.svg', wheat: '/img/wheat.svg', desert: '/img/desert.svg'};

  for (let row = 0; row < map.length; row++) { 
    for (let col = 0; col < map[row].length; col++) {
      let x = centers[row][col].x;
      let y = centers[row][col].y;
      let img = new Image;
      img.onload = function(){
        let sF = this.height/vertToVert;
        ctx.drawImage(this, x - this.width/(2*sF), y - this.height/(2*sF), this.width/(sF*0.98), this.height/(sF*0.98));
      };
      let terrain = map[row][col];
      if (terrain == 't') {
        img.src = images.tree;
      } else if (terrain == 's') {
        img.src = images.sheep;
      } else if (terrain == 'w') {
        img.src = images.wheat;
      } else if (terrain == 'o') {
        img.src = images.ore;
      } else if (terrain == 'b') {
        img.src = images.brick;
      } else if (terrain == 'd') {
        img.src = images.desert;
      } else if (terrain == 'x') {
        img.src = images.water;
      }
    }
  }
}

function main() {
  let can = document.getElementById('canvas');
  let ctx = can.getContext('2d');
  can.height = window.innerHeight;
  can.width = window.innerWidth;

  //let startMap = 'xxxx,xxxxx,xxxxxx,xxxxxx,xxxxx,xxxx';
  let startMap = 'xxx,xxxx,xxxxx,xxxx,xxx';
  //let startMap = 'xxxxx,xxxxxx,xxxxxx,xxxxxx,xxxxx';
  let startTerrain = 't,t,t,t,s,s,s,s,w,w,w,w,o,o,o,b,b,b,d'+',t,t,s,s,w,w,o,o,b,b,d,d,b,b,b,b,b,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o,o';
  let map = genMap(startMap, startTerrain);
  let centerData = genCenters(map, can);
  drawMap(map, centerData.centers, centerData.vertToVert, ctx);
}

main();

