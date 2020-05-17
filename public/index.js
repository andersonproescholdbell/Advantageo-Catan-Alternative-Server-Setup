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

function isExtraWide(map) {
  let longest = map[indexLongest(map)].length;
  let longestIndex = -1;
  for (let i = 0; i < map.length; i++) {
    if (map[i].length == longest) {
      if (longestIndex == -1) {
        longestIndex = i;
      }else {
        if (i == longestIndex+1) {
          return true
        }else {
          longestIndex = i;
        }
      }
    }
  }
  return false
}

function rowShift(map) {
  if (isExtraWide(map)) {
    var shift = - (map[0].length-0.5);
  }else {
    var shift = - (map[0].length-1);
  } 

  let lastMove = 'none';
  let shifts = [shift];
  for (let row = 1; row < map.length; row++) { 
    let lastLen = map[row-1].length;
    if (map[row].length > lastLen) {
      shift -= 1;
      lastMove = 'sub';
    }else if (map[row].length < lastLen) {
      shift += 1;
      lastMove = 'add';
    }else {
      if (lastMove == 'add') {
        shift -= 1;
        lastMove = 'sub';
      }else {
        shift += 1;
        lastMove = 'add';
      }      
    }
    shifts.push(shift);
  }
  return shifts;
}

function genCoords(map, vertToVert, apothem, w, h, li, ri, rs) {
  let tip = apothem*Math.tan(Math.PI/6);
  
  let midx = w/2;
  let midy = h/2;
  console.log()
  
  if (isExtraWide(map)) {
    var left = midx - (map[0].length-0.5)*apothem;
  }else {
    var left = midx - (map[0].length-1)*apothem;
  } 
  //console.log(rs[li], rs[ri]);
  console.log(Math.abs(rs[li]-rs[ri]))
  //left += apothem*(rs[li]-rs[ri]);
  if (map.length%2 == 0) {
    var top = midy + 1.5*tip - Math.floor(map.length/2)*apothem*Math.sqrt(3);
  }else {
    var top = midy - Math.floor(map.length/2)*apothem*Math.sqrt(3);
  }

  let coords = {centers: [], edges: [], vertices: []};
  let lastLen = map[0].length;
  let lastMove = 'none';
  for (let row = 0; row < map.length; row++) {
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
    }

    for (let col = 0; col < map[row].length; col++) {
      //used multiple times
      let acp3 = apothem*Math.cos(Math.PI/3);
      let asp3 = apothem*Math.sin(Math.PI/3);
      //centers
      let cx = left + col*2*apothem;
      let cy = top + row*apothem*Math.sqrt(3);
      coords.centers.push({x: cx, y: cy, terrain: map[row][col].terrain});
      //edges
      let ebl = {x: cx - acp3, y: cy + asp3};
      let ebr = {x: cx + acp3, y: cy + asp3};
      let er = {x: cx + apothem, y: cy};
      coords.edges.push(ebl, ebr, er);
      //vertices
      let vbl = {x: cx - apothem, y: cy + apothem/2};
      let vb = {x: cx, y: cy + vertToVert/2};
      coords.vertices.push(vbl, vb);
      if (row == 0) {
        //edges
        let etl = {x: cx - acp3, y: cy - asp3};
        let etr = {x: cx + acp3, y: cy - asp3};
        coords.edges.push(etl, etr);
        //vertices 
        let vtl = {x: cx - apothem, y: cy - apothem/2};
        let vt = {x: cx, y: cy - vertToVert/2};
        coords.vertices.push(vtl, vt);
        if (col == map[row].length-1) {
          let vtr = {x: cx + apothem, y: cy - apothem/2};
          coords.vertices.push(vtr);
        }
      }
      if (col == 0) {
        //edges
        let el = {x: cx - apothem, y: cy};
        coords.edges.push(el);
        if (lastLen < map[row].length) {
          //edges
          let etl = {x: cx - acp3, y: cy - asp3};
          coords.edges.push(etl);
          //vertices
          let vtl = {x: cx - apothem, y: cy - apothem/2};
          coords.vertices.push(vtl);
        }
      }else if (col == map[row].length-1) {
        //vertices
        let vbr = {x: cx + apothem , y: cy + apothem/2}
        coords.vertices.push(vbr);
        if (lastLen < map[row].length) {
          //edges
          let etr = {x: cx + acp3, y: cy - asp3};
          coords.edges.push(etr);
          //vertices
          let vtr = {x: cx + apothem, y: cy - apothem/2};
          coords.vertices.push(vtr);
        }
      }  
    }
    lastLen = map[row].length;
  }
  return coords;
}

function getDimensions(map, vertToVert, apothem, w, h) {
  let tip = apothem*Math.tan(Math.PI/6);
  
  let midx = w/2;
  let midy = h/2;
  
  if (isExtraWide(map)) {
    var left = midx - (map[0].length-0.5)*apothem;
  }else {
    var left = midx - (map[0].length-1)*apothem;
  } 
  if (map.length%2 == 0) {
    var top = midy + 1.5*tip - Math.floor(map.length/2)*apothem*Math.sqrt(3);
  }else {
    var top = midy - Math.floor(map.length/2)*apothem*Math.sqrt(3);
  }
  console.log(top);

  let most = {l: w/2, r: w/2, t: h/2, b: h/2, li: 0, ri: 0};
  let lastLen = map[0].length;
  let lastMove = 'none';
  for (let row = 0; row < map.length; row++) {
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
    }

    for (let col = 0; col < map[row].length; col++) {
      //centers
      let cx = left + col*2*apothem;
      let cy = top + row*apothem*Math.sqrt(3);
      //mosts
      if (cx < most.l) {
        most.l = cx;
        most.li = row;
      }else if (cx > most.r) {
        most.r = cx;
        most.ri = row;
      }
      if (cy < most.t) {
        most.t = cy;
      }else if (cy > most.b) {
        most.b = cy;
      }
    }
    lastLen = map[row].length;
  }
  most.l -= apothem;
  most.r += apothem;
  most.t -= vertToVert/2;
  most.b += vertToVert/2;
  console.log(most);
  return most;
}

function drawMap(coords, vertToVert, ctx) {
  let images = {tree: '/img/tree.svg', ore: '/img/ore.svg', water: '/img/water.svg', brick: '/img/brick.svg',
                sheep: '/img/sheep.svg', wheat: '/img/wheat.svg', desert: '/img/desert.svg'};

  for (let i = 0; i < coords.centers.length; i++) {
    let x = coords.centers[i].x;
    let y = coords.centers[i].y;
    let img = new Image;
    img.onload = function(){
      let sF = this.height/vertToVert;
      ctx.drawImage(this, x - this.width/(2*sF), y - this.height/(2*sF), this.width/(sF*0.98), this.height/(sF*0.98));
    };
    let terrain = coords.centers[i].terrain;
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

function newVertApoth(map) {
  let vertToVert = window.innerHeight/map.length;
  let apothem = vertToVert/2 * Math.sin(Math.PI/3);
  return {v: vertToVert, a: apothem};
}

function redraw(map) {
  let can = document.getElementById('canvas');
  let ctx = can.getContext('2d');
  
  let va = newVertApoth(map);
  let most = getDimensions(map, va.v, va.a, window.innerWidth, window.innerHeight);
  can.width = most.r - most.l;
  can.height = most.b - most.t;

  ctx.fillStyle = "lightblue";
  ctx.fillRect(0, 0, can.width, can.height);

  let rs = rowShift(map);

  let coords = genCoords(map, va.v, va.a, can.width, can.height, most.li, most.ri, rs);
  drawMap(coords, va.v, ctx);
}

function main(mapData) {
  redraw(mapData.map);

  /*let resizeTimer;
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
  }*/
}

let socket = io();

socket.on('connect', () => {
  console.log('connected to server');
});

socket.on('mapData', (mapData) => {
  main(mapData);
});

socket.on('disconnect', () => {
  console.log('disconnected from server');
});