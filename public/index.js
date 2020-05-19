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

function getPositioning(map) {
   function getShifts(map, longest, start, end, backwards) {
    let lastLen = longest;
    let lastMove = 'none';
    let shift = 0;
    let shifts = [];
    if (backwards) {
      for (let row = start; row > end; row--) {
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
        lastLen = map[row].length;
        shifts.push(shift);
      }
    }else {
      for (let row = start; row < end; row++) {
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
        lastLen = map[row].length;
        shifts.push(shift);
      }
    }
    return shifts;
  }

  let lastLongest = indexLongest(map, true);
  let top = getShifts(map, map[lastLongest].length, lastLongest-1, -1, true).reverse();
  top.push(0);
  let bottom = getShifts(map, map[lastLongest].length, lastLongest+1, map.length, false);
  return {shifts: top.concat(bottom), longestIndex: lastLongest};
}

function getWHVA(map, shifts, longestIndex) {
  let h1 = window.innerHeight;//*0.9;
  let vertToVert = h1/(map.length-(0.25*(map.length-1)));
  let apothem = vertToVert/2 * Math.sin(Math.PI/3);

  let longest = map[longestIndex].length;
  let widthShift = longest*2;
  for (let i = 0; i < shifts.length; i++) {
    let y = Math.abs(shifts[i]) + map[i].length*2;
    if (y > longest*2 && y > widthShift) {
      widthShift = y;
    }
  }
  let w = widthShift*apothem;
  let h = h1*1.004;
  return {w: w, h: h, v: vertToVert, a: apothem};
}

function getCoords(map, shifts, vertToVert, apothem, longest) {
  let coords = {centers: [], edges: [], vertices: []};
  let lastLen = map[0].length;
  let initialDisplacement = 0;
  let top = vertToVert/2;
  for (let row = 0; row < map.length; row++) {
    let left = initialDisplacement + apothem + shifts[row]*apothem;
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

function drawMap(map, coords, vertToVert, ctx) {
  let images = {tree: '/img/forest.svg', ore: '/img/stone.svg', water: '/img/water.svg', brick: '/img/brick.svg',
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

function main(mapData) {
  console.log(mapData.map);
  let posData = getPositioning(mapData.map);
  let whva = getWHVA(mapData.map, posData.shifts, posData.longestIndex);

  let can = document.getElementById('canvas');
  let ctx = can.getContext('2d');
  can.width = whva.w;
  can.height = whva.h;

  let coords = getCoords(mapData.map, posData.shifts, whva.v, whva.a, mapData.map[posData.longestIndex].length);
  drawMap(mapData.map, coords, whva.v, ctx);
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