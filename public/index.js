let socket = io();

socket.on('connect', () => {
  console.log('connected to server');
});

socket.on('disconnect', () => {
  console.log('disconnected from server');
});

let can = document.getElementById('canvas');
let ctx = can.getContext('2d');

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

function indexOfLongest(arr) {
  var max = arr[0].length;
  var maxIndex = 0;

  for (var i = 1; i < arr.length; i++) {
    if (arr[i].length > max) {
      maxIndex = i;
      max = arr[i].length;
    }
  }
  return maxIndex;
}

function hexExists(x, y, hexes) {
  for (var i = 0; i < hexes.length; i++) {
    if (x.toFixed(1) == hexes[i].x.toFixed(1) && y.toFixed(1) == hexes[i].y.toFixed(1)) {
      return true;
    }
  }
  return false;
}

function randColor() {
  return Math.floor(Math.random()*16777215).toString(16);
}

function genMap(map) {
  map = map.split('\n');
  for (var i = 0; i < map.length; i++) {
    if (map[i] == '') {
      map.splice(i, 1);
    }
  }
  let longest = indexOfLongest(map);
  let rows = map.length+2;
  let columns = map[longest].length+2;

  if (window.innerHeight < window.innerWidth) {
    can.height = window.innerHeight;
    var vertToVert = (can.height*0.98)/(rows-(0.25*(rows-1)));
    var apothem = vertToVert/4 * Math.tan(Math.PI/3);
    can.width = apothem*2*columns;
  }else {
    can.width = window.innerWidth;
    var offW = window.innerWidth*0.005;
    var apothem = (can.width*0.99)/(2*columns) - offW;
    var vertToVert = 4*apothem/Math.tan(Math.PI/3);
    can.height = apothem*2*columns;
  }
  //currently broken if browser height > width
  
  let side = vertToVert/2;
  let cenToVert = vertToVert/2;
  let tip = vertToVert/4;

  let centers = [];
  let posT = cenToVert + can.height*0.01 || cenToVert + can.width*0.01;
  for (var i = 0; i < rows; i++) {
    centers.push([]);
    let posR = can.width;
    let posL = 0;
    if (i > 0) {
      posT += vertToVert-tip;
    }
    for (var j = 0; j < columns; j++) {
      if (i%2 == 0) {
        if (j == 0) {
          posR -= 2*apothem;
        }else {
          posR -= 2*apothem;
        }
        centers[centers.length-1].push({x: posR, y: posT});
        if (j == columns-1) {
          posR = can.width;
        }
      }else {
        if (j == 0) {
          posL += apothem;
        }else {
          posL += 2*apothem;
        }
        centers[centers.length-1].push({x: posL, y: posT});
        if (j == columns-1) {
          posL = 0;
        }
      }
    }
  }

  map.unshift('');
  map.push('');
  for (var i = 0; i < rows; i++) {
    let start = Math.floor((columns-map[i].length)/2); 
    if (i == 0 || i == rows-1) {
      var end = map[i].length+2;
    }else {
      var end = map[i].length;
    }
    for (var j = 0; j < end+2; j++) {
      if (i == 0 || i == rows-1) {
        var x = centers[i][start+j-2].x, y = centers[i][start+j-2].y;
      }else {
        var x = centers[i][start+j-1].x, y = centers[i][start+j-1].y;
      }
      if (j == 0 || j == end+1 || i == 0 || i == rows-1) {
        drawHex(x, y, side, 'navy');
      }else {
        drawHex(x, y, side, 'grey');
      }
    }
  }
}

function drawHex(x, y, length, color) {
  ctx.beginPath();

  let coords = rotate(x, y, x+length, y, 90);
  ctx.moveTo(coords[0], coords[1]);

  for (var side = 0; side < 7; side++) {
    coords = rotate(x, y, x+length*Math.cos(side*2*Math.PI/6), y+length*Math.sin(side*2*Math.PI/6), 90);
    ctx.lineTo(coords[0], coords[1]);
  }
  
  ctx.closePath();
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.fill();
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

var testMap = 
`
xxx
xxxx
xxxxx
xxxx
xxx
`
genMap(testMap);

/*
function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  console.log("x: " + x + " y: " + y)
}

can.addEventListener('mousedown', function(e) {
  getCursorPosition(can, e)
});*/
