function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function offset(x) {
  return Math.floor(x)+0.5;
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

function getVertApoth(map, w, h) {
  let mapData = getMapData(map);
  let extraWide = isExtraWide(map);

  if (w > h) {
    //start off assuming height is limitting factor
    var vertToVert = h/(mapData.rows-(0.25*(mapData.rows-1)));
    var apothem = vertToVert/4 * Math.tan(Math.PI/3);

    if (extraWide) {
      var maxW = apothem + map[mapData.longest].length*2*apothem;
      //only applies if 2 max ones are next to each other
    }else {
      console.log('normal wide');
      var maxW = map[mapData.longest].length*2*apothem;
    }

    if (maxW > w) { //width limitted
      if (extraWide) {
        apothem = w/(1+map[mapData.longest].length*2)
      }else {
        apothem = w/(2*mapData.columns);
      }
      vertToVert = 4*apothem/Math.tan(Math.PI/3);
      h = map.length*vertToVert - (map.length-1)*apothem*Math.tan(Math.PI/6); 
    }else { //height limitted
      console.log('2');
      w = maxW;
    }
  }else { //width limitted
    if (extraWide) {
      var apothem = w/(1+map[mapData.longest].length*2)
    }else {
      var apothem = w/(2*mapData.columns);
    }
    var vertToVert = 4*apothem/Math.tan(Math.PI/3);
    h = map.length*vertToVert - (map.length-1)*apothem*Math.tan(Math.PI/6);
  }
  return {vertToVert: vertToVert*0.95, apothem: apothem*0.95, w: w, h: h};
}

function genCoords(map, vertToVert, apothem, w, h) {
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

function redraw(map) {
  let can = document.getElementById('canvas');
  let ctx = can.getContext('2d');
  let w = window.innerWidth;
  let h = window.innerHeight;

  let vawh = getVertApoth(map, w, h);
  can.width = vawh.w;
  can.height = vawh.h;

  let coords = genCoords(map, vawh.vertToVert, vawh.apothem, vawh.w, vawh.h);
  drawMap(coords, vawh.vertToVert, ctx);
}

function main(map) {
  console.log(map);
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