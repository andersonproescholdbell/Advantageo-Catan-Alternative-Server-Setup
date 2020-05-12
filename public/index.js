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
  
  //adding terrain and side sea
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

  //adding top and bottom sea
  map.unshift('x,'.repeat(map[0].length-1).slice(0, -1).split(','));
  map.push('x,'.repeat(map[map.length-1].length-1).slice(0, -1).split(','));

  return map
}

function genCoords(map) {
  let mapData = getMapData(map);
  
  if (window.innerHeight < window.innerWidth) {
    var vertToVert = (window.innerHeight*0.98)/(mapData.rows-(0.25*(mapData.rows-1)));
    var apothem = vertToVert/4 * Math.tan(Math.PI/3);
  }else {
    var apothem = (window.innerWidth*0.98)/(2*mapData.columns);
    var vertToVert = 4*apothem/Math.tan(Math.PI/3);
  }
  let tip = apothem*Math.tan(Math.PI/6);
  
  let midx = window.innerWidth/2;
  let midy = window.innerHeight/2;
  let coords = [];
  let left = midx - (map[0].length-1)*apothem; 
  if (map.length%2 == 0) {
    var top = midy + 1.5*tip - Math.floor(map.length/2)*apothem*Math.sqrt(3);
  }else {
    var top = midy - Math.floor(map.length/2)*apothem*Math.sqrt(3);
  }
  let lastLen = map[0].length;
  let lastMove = 'none';
  for (let row = 0; row < map.length; row++) {
    coords.push([]);

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
      let cx = left + col*2*apothem;
      let cy = top + row*apothem*Math.sqrt(3); 
      let vt = {x: cx, y: cy - vertToVert/2};
      let vtl = {x: cx - apothem, y: cy - apothem/2};
      let vbl = {x: cx - apothem, y: cy + apothem/2};
      let vb = {x: cx, y: cy + vertToVert/2};
      let vbr = {x: cx + apothem , y: cy - apothem/2};
      let vtr = {x: cx + apothem, y: cy - apothem/2};
      let etl = {x: cx - apothem*Math.cos(Math.PI/3), y: cy - apothem*Math.sin(Math.PI/3)};
      let el = {x: cx - apothem, y: cy};
      let ebl = {x: cx - apothem*Math.cos(Math.PI/3), y: cy + apothem*Math.sin(Math.PI/3)};
      let ebr = {x: cx + apothem*Math.cos(Math.PI/3), y: cy + apothem*Math.sin(Math.PI/3)};
      let er = {x: cx + apothem, y: cy};
      let etr = {x: cx + apothem*Math.cos(Math.PI/3), y: cy - apothem*Math.sin(Math.PI/3)};
      coords[coords.length-1].push({centers: {x: cx, y: cy},
                                    vertices: {t: vt, tl: vtl, bl: vbl, b: vb, br: vbr, tr: vtr},
                                    edges: {tl: etl, l: el, bl: ebl, br: ebr, r: er, tr: etr}});
    }
  }
  return {coords: coords, vertToVert: vertToVert};
}

function drawMap(map, coords, vertToVert, ctx) {
  let images = {tree: '/img/tree.svg', ore: '/img/ore.svg', water: '/img/water.svg', brick: '/img/brick.svg',
                sheep: '/img/sheep.svg', wheat: '/img/wheat.svg', desert: '/img/desert.svg'};

  for (let row = 0; row < map.length; row++) { 
    for (let col = 0; col < map[row].length; col++) {
      let x = coords[row][col].centers.x;
      let y = coords[row][col].centers.y;
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
  let coordsData = genCoords(map, can);
  drawMap(map, coordsData.coords, coordsData.vertToVert, ctx);
}

main();

