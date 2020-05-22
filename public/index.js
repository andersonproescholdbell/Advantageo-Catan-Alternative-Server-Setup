function getCoords(map, vertToVert, apothem) {
  let coords = {centers: [], edges: [], vertices: []};
  let lastLen = map[0].length;
  for (let row = 0; row < map.length; row++) {
    let top = vertToVert/2;
    let left = apothem;
    if (map[row][0].terrain == '_') {
      left = 0;
    }
    for (let col = 0; col < map[row].length; col++) {
      //used multiple times
      let acp3 = apothem*Math.cos(Math.PI/3);
      let asp3 = apothem*Math.sin(Math.PI/3);
      //centers 
      let cx = left + col*2*apothem;
      let cy = top + row*apothem*Math.sqrt(3);
      if (map[row][col].roll) {
        coords.centers.push({x: cx, y: cy, terrain: map[row][col].terrain, roll: map[row][col].roll});
      }else {
        coords.centers.push({x: cx, y: cy, terrain: map[row][col].terrain});
      }
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

function drawMap(coords, vertToVert, ctx, scale) {
  let images = {forest: '/img/forest.svg', stone: '/img/stone.svg', water: '/img/water.svg', brick: '/img/brick.svg',
                sheep: '/img/sheep.svg', wheat: '/img/wheat.svg', desert: '/img/desert.svg', portramp: '/img/portramp.svg',
                port3to1: '/img/3to1port.svg', brickport: '/img/brickport.svg', lumberport: '/img/lumberport.svg',
                stoneport: '/img/stoneport.svg', wheatport: '/img/wheatport.svg', woolport: '/img/woolport.svg',
                roll2: '/img/roll2.svg', roll3: '/img/roll3.svg', roll4: '/img/roll4.svg', roll5: '/img/roll5.svg', 
                roll6: '/img/roll6.svg', roll8: '/img/roll8.svg', roll9: '/img/roll9.svg', roll10: '/img/roll10.svg', 
                roll11: '/img/roll11.svg', roll12: '/img/roll12.svg'};
  
  let toDraw = [];
  //tiles
  for (let i = 0; i < coords.centers.length; i++) {
    let x = coords.centers[i].x * scale;
    let y = coords.centers[i].y * scale;
    let tile = new Image;
    /*tile.onload = function(){
      let sF = this.height/(vertToVert*scale);
      ctx.drawImage(this, x - this.width/(2*sF), y - this.height/(2*sF), 1.01*this.width/sF, 1.01*this.height/sF);
    };*/
    let terrain = coords.centers[i].terrain;
    if (terrain == 'f') {
      tile.src = images.forest;
    }else if (terrain == 's') {
      tile.src = images.sheep;
    }else if (terrain == 'w') {
      tile.src = images.wheat;
    }else if (terrain == 'o') {
      tile.src = images.stone;
    }else if (terrain == 'b') {
      tile.src = images.brick;
    }else if (terrain == 'd') {
      tile.src = images.desert;
    }else if (terrain == 'x' || terrain[0] == 'p') {
      tile.src = images.water;
    }
    //let sF = 600/(vertToVert*scale);
    //toDraw.push({x: x - 520/(2*sF), y: y - 600/(2*sF), w: 1.01*520/sF, h: 1.01*600/sF, source: tile.src});
  }
  //ports and planks
  for (let i = 0; i < coords.centers.length; i++) {
    let terrain = coords.centers[i].terrain;
    if (terrain[0] == 'p') {
      let x = coords.centers[i].x * scale;
      let y = coords.centers[i].y * scale;
      let port = new Image;
      /*port.onload = function(){
        let sF = 1.75*this.height/(vertToVert*scale);
        ctx.drawImage(this, x - this.width/(2*sF), y - this.height/(2*sF), 1.01*this.width/sF, 1.01*this.height/sF);
      };*/
      if (terrain == 'pf') {
        port.src = images.lumberport;
      }else if (terrain == 'ps') {
        port.src = images.woolport;
      }else if (terrain == 'po') {
        port.src = images.stoneport;
      }else if (terrain == 'pb') {
        port.src = images.brickport;
      }else if (terrain == 'pw') {
        port.src = images.wheatport;
      }else if (terrain == 'p3') {
        port.src = images.port3to1;
      }
      //let sF = 1.75*600/(vertToVert*scale);
      //toDraw.push({x: x - 520/(2*sF), y: y - 600/(2*sF), w: 1.01*520/sF, h: 1.01*600/sF, source: port.src});

      //console.log(x, y);
      //console.log(getClosest(coords, 'edges', x, y));
      /*x = 1;
      y = 1;
      img.onload = function(){
        let sF = 1.75*this.height/(vertToVert*scale);
        ctx.drawImage(this, x - this.width/(2*sF), y - this.height/(2*sF), 1.01*this.width/sF, 1.01*this.height/sF);
      };
      img.src = images.portramp;*/
    }
  }

  function afterLoad(toDraw, loaded) {
    if (loaded == toDraw.length) {
      for (let i = 0; i < toDraw.length; i++) {
        ctx.drawImage(toDraw[i].img, toDraw[i].x, toDraw[i].y, toDraw[i].w, toDraw[i].h);
      }
    }
  }

  //rolls
  let loaded = 0;
  for (let i = 0; i < coords.centers.length; i++) {
    if (coords.centers[i].roll) {
      let x3 = coords.centers[i].x * scale;
      let y3 = (coords.centers[i].y - vertToVert/4) * scale;
      let roll = new Image();
      //roll.onload = ()=> {
        //let sF = 4*this.height/(vertToVert*scale);
        //ctx.drawImage(this, x3 - this.width/(2*sF), y3 - this.height/(2*sF), 1.01*this.width/sF, 1.01*this.height/sF);
      //};
      roll.src = '/img/water.svg';
      roll.onload = function() {
        loaded++;
        afterLoad(toDraw, loaded);
      }
      let sF = 4*600/(vertToVert*scale);
      toDraw.push({img: roll, x: x3 - 520/(2*sF), y: y3 - 600/(2*sF), w: 1.01*520/sF, h: 1.01*600/sF});
    }
  }

  console.log(toDraw);
  console.log(loaded);
}

function getClosest(coords, type, x, y) {
  let closest = [];
  let closestDist = 9999;
  for (let i = 0; i < coords[type].length; i++) {
    let dist = getDist(x, y, coords[type][i].x, coords[type][i].y);
    if (dist < closestDist*1.02) {
      if (dist > closestDist*0.98) {
        closest.push(coords[type][i]);
      }else {
        closest = [coords[type][i]];
        closestDist = dist;
      }
    }
  }
  return closest;
}

function getWHVA(map) {
  let widest = 0;
  for (let row = 0; row < map.length; row++) {
    let isWidest = 0;
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col].terrain == '_') {
        isWidest += 1;
      }else {
        isWidest += 2;
      }
    }
    if (isWidest > widest) {
      widest = isWidest;
    }
  }
  let h = window.innerHeight;
  let vertToVert = h/(map.length-(0.25*(map.length-1)));
  let apothem = vertToVert/2 * Math.sin(Math.PI/3);
  let w = widest*apothem;
  return {h: h, w:w, vtv: vertToVert, apoth: apothem};
}

function getMousePos(canvasDom, mouseEvent, scale) {
  var rect = canvasDom.getBoundingClientRect();
  return {
    x: (mouseEvent.clientX - rect.left) * scale,
    y: (mouseEvent.clientY - rect.top) * scale
  };
}

function getDist(x1, y1, x2, y2) {
  return Math.sqrt((x1-x2)**2 + (y1-y2)**2);
}

function main(map) {
  console.log(map);
  let whva = getWHVA(map);

  let can = document.getElementById('canvas');
  let ctx = can.getContext('2d');
  let scale = 2;
  can.width = whva.w * scale ;
  can.height = whva.h * scale;

  can.addEventListener('click', function (e) {
    let mousePos = getMousePos(can, e, scale);
    //console.log(mousePos);
  });

  let coords = getCoords(map, whva.vtv, whva.apoth);
  console.log(coords);
  drawMap(coords, whva.vtv, ctx, scale);
}


let socket = io();

socket.on('connect', () => {
  console.log('connected to server');
});

socket.on('map', (map) => {
  main(map);
});

socket.on('disconnect', () => {
  console.log('disconnected from server');
});