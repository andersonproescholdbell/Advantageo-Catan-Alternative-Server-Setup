let socket = io();

socket.on('connect', () => {
  console.log('connected to server');
});

socket.on('disconnect', () => {
  console.log('disconnected from server');
});

let can = document.getElementById('canvas');
let ctx = can.getContext('2d');

let wh = window.innerHeight;
let ww = window.innerWidth;

if (wh > ww) {
  wh = ww;
} else {
  ww = wh;
}

can.width = ww;
can.height = wh;
let cen = wh/2;

ctx.fillStyle = 'lightblue';
ctx.fillRect(0,0, can.width, can.height);

function offset(x) {
  return Math.floor(x)+0.5;
}

function rotate(cx, cy, x, y, angle) {
  var radians = (Math.PI / 180) * angle,
    cos = Math.cos(radians),
    sin = Math.sin(radians),
    nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
    ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
  return [offset(nx), offset(ny)];
}

function hexExists(x, y, hexes) {
  for (var i = 0; i < hexes.length; i++) {
    if (x.toFixed(1) == hexes[i].x.toFixed(1) && y.toFixed(1) == hexes[i].y.toFixed(1)) {
      return true;
    }
  }
  return false;
}

function genHexCoords() {
  let rings = 2;
  let length = 50;
  let cenToCen = length*2*Math.cos(Math.PI/6);

  let hexes = [{x: cen, y: cen}];
  drawHexes(hexes, length, 'red');

  for (var i = 0; i < rings; i++) {
    let newHexes = [];
    if (i > 0) {
      var fromHex = hexes.length - 1 - 6*i;
      var untilHex = hexes.length;
    }else {
      var fromHex = 0;
      var untilHex = 1;
    }
    for (var j = fromHex; j < untilHex; j++) {
      for (var k = 0; k < 6; k++) {
        let start = hexes[j];
        let coords = {x: start.x+cenToCen*Math.cos(k*Math.PI/3), y: start.y+cenToCen*Math.sin(k*Math.PI/3)};
        if (!hexExists(coords.x, coords.y, hexes)) {
          hexes.push({x: coords.x, y: coords.y});
          newHexes.push({x: coords.x, y: coords.y});
        }
      }
      drawHexes(newHexes, length, 'blue');
    }
  }
  console.log(hexes);
}

function drawHexes(hexes, length, color) {
  for (var i = 0; i < hexes.length; i++) {
    let vertices = [];
    ctx.beginPath();
    let coords = rotate(hexes[i].x, hexes[i].y, hexes[i].x+length, hexes[i].y, 90);
    ctx.moveTo(coords[0], coords[1]);
  
    for (var side = 0; side < 7; side++) {
      coords = rotate(hexes[i].x, hexes[i].y, hexes[i].x+length*Math.cos(side*2*Math.PI/6), hexes[i].y+length*Math.sin(side*2*Math.PI/6), 90);
      ctx.lineTo(coords[0], coords[1]);
      if (side < 6) {
        vertices.push(coords);
      }
    }
    hexes[i].vertices = vertices;
  
    ctx.fillStyle = color;
    ctx.fill();
  }
  return hexes;
}

genHexCoords();


