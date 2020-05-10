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

let rings = 3;
let hexLine = 50;
let hexes = [{x:cen,y:cen}];
/*
for (var i = 0; i > rings; i++) {
  let total = 0;
  if (i == 0) {
    total = 1;
  }else {
    total = 6*i;
  }
  for (var j = 0; j < total; j++) {
    let data = {};
    data.x = cen - hexDiameter*i;
    data.y = cen;
    hexes.push(data);
  }
}*/

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

for (var i = 0; i < hexes.length; i++) {
  let data = hexes[i];

  ctx.beginPath();
  let coords = rotate(data.x, data.y, data.x+hexLine, data.y, 90)
  ctx.moveTo(coords[0], coords[1]);

  for (var side = 0; side < 7; side++) {
    coords = rotate(data.x, data.y, data.x+hexLine*Math.cos(side*2*Math.PI/6), data.y+hexLine*Math.sin(side*2*Math.PI/6), 90);
    ctx.lineTo(coords[0], coords[1]);
  }

  ctx.fillStyle = "#57157a";
  ctx.fill();
}

