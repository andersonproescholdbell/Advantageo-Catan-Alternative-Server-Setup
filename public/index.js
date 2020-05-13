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

  if (last) {
    for (let i = 1; i < arr.length; i++) {
      if (arr[i].length >= max) {
        maxIndex = i;
        max = arr[i].length;
      }
    }
  }else {
    for (let i = 1; i < arr.length; i++) {
      if (arr[i].length > max) {
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

function getVertApoth(map, w, h) {
  let mapData = getMapData(map);

  if (w > h) {
    //start off assuming height is limitting factor
    var vertToVert = (h*0.9)/(mapData.rows-(0.25*(mapData.rows-1)));
    var apothem = vertToVert/4 * Math.tan(Math.PI/3);

    if (indexLongest(map) != indexLongest(map, true)) {
      var maxW = apothem + map[mapData.longest].length*2*apothem;
    }else {
      var maxW = map[mapData.longest].length*2*apothem;
    }

    if (maxW > w) { //width limitted
      apothem = w/(2*mapData.columns);
      vertToVert = 4*apothem/Math.tan(Math.PI/3);
      h = map.length*vertToVert - (map.length-1)*apothem*Math.tan(Math.PI/6); 
    }else { //height limitted
      vertToVert = h/(mapData.rows-(0.25*(mapData.rows-1)));
      apothem = vertToVert/4 * Math.tan(Math.PI/3);
      if (indexLongest(map) != indexLongest(map, true)) {
        w = apothem + map[mapData.longest].length*2*apothem;
      }else {
        w = map[mapData.longest].length*2*apothem;
      }
    }
  }else { //width limitted
    if (indexLongest(map) != indexLongest(map, true)) {
      var apothem = w/(1+map[mapData.longest].length*2)
    }else {
      var apothem = w/(2*mapData.columns);
    }
    var vertToVert = 4*apothem/Math.tan(Math.PI/3);
    h = map.length*vertToVert - (map.length-1)*apothem*Math.tan(Math.PI/6);
  }
  return {vertToVert: vertToVert*0.95, apothem: apothem*0.95, w: w, h: h};
}

function genCoords(map, w, h) {
  let data = getVertApoth(map, w, h);
  let vertToVert = data.vertToVert;
  let apothem = data.apothem;
  let tip = apothem*Math.tan(Math.PI/6);
  
  let midx = w/2;
  let midy = h/2;
  let coords = [];
  if (indexLongest(map) != indexLongest(map, true)) {
    var left = midx - (map[0].length-0.5)*apothem;
  }else {
    var left = midx - (map[0].length-1)*apothem;
  } 
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
      let terrain = map[row][col].terrain;
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

function redraw(map) {
  let can = document.getElementById('canvas');
  let ctx = can.getContext('2d');
  let w = window.innerWidth;//screen.width*1.0;
  let h = window.innerHeight;//screen.height*1.0;

  let wh = getVertApoth(map, w, h);
  can.width = wh.w;
  can.height = wh.h;

  let coordsData = genCoords(map, wh.w, wh.h);
  drawMap(map, coordsData.coords, coordsData.vertToVert, ctx);
}

function main(map) {
  redraw(map);

  let resizeTimer;
  window.onresize = function() {
    this.clearTimeout(resizeTimer);
    this.resizeTimer = setTimeout(doneResizing, 1000/60);
  }
  let oldW = window.innerWidth;
  let oldH = window.innerHeight;
  function doneResizing() {
    let currW = window.innerWidth, currH = window.innerHeight;
    if (currW > oldW*1.333 || currW < oldW*0.666 || currH > oldH*1.333 || currH < oldH*0.666) {
      redraw(map);
      oldW = currW, oldH = currH;
    }
  }
}

let socket = io();

socket.on('connect', () => {
  console.log('connected to server');
});

socket.on('map', (map) => {
  window.map = map;
  main(map);
});

socket.on('disconnect', () => {
  console.log('disconnected from server');
});