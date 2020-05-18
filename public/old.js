function genHexCoords() {
    let rings = 5;
    let length = 50;
    let cenToCen = length*2*Math.cos(Math.PI/6);
  
    let hexes = [{x: cen.x, y: cen.y}];
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
}

let middle = 1;
if (map[longest] == map[longest+1]) {
    middle = 2;
}

function randColor() {
    return Math.floor(Math.random()*16777215).toString(16);
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

function genCenters(map, can) {
    let mapData = getMapData(map);
  
    if (window.innerHeight < window.innerWidth) {
      can.height = window.innerHeight;
      var vertToVert = can.height/(mapData.rows-(0.25*(mapData.rows-1)));
      var apothem = vertToVert/4 * Math.tan(Math.PI/3);
      can.width = apothem*2*mapData.columns;
    }else {
      can.width = window.innerWidth;
      var apothem = can.width/(2*mapData.columns);
      var vertToVert = 4*apothem/Math.tan(Math.PI/3);
      can.height = apothem*2*mapData.columns;
    }
    //currently broken if browser height > width
    //need to make some offset for edges just like top and bottom
    
    let side = vertToVert/2;
    let cenToVert = vertToVert/2;
    let tip = vertToVert/4;
  
    let centers = [];
    let posT = cenToVert;
    for (var i = 0; i < mapData.rows; i++) {
      centers.push([]);
      let posR = can.width;
      let posL = 0;
      if (i > 0) {
        posT += vertToVert-tip;
      }
      for (var j = 0; j < mapData.columns; j++) {
        if (i%2 == 0) {
          if (j == 0) {
            posR -= 2*apothem;
          }else {
            posR -= 2*apothem;
          }
          centers[centers.length-1].push({x: posR, y: posT});
          if (j == mapData.columns-1) {
            posR = can.width;
          }
        }else {
          if (j == 0) {
            posL += apothem;
          }else {
            posL += 2*apothem;
          }
          centers[centers.length-1].push({x: posL, y: posT});
          if (j == mapData.columns-1) {
            posL = 0;
          }
        }
      }
    }
    return {centers: centers, mapData: mapData, vertToVert: vertToVert};
  }

  function hexExists(x, y, hexes) {
    for (let i = 0; i < hexes.length; i++) {
      if (x.toFixed(1) == hexes[i].x.toFixed(1) && y.toFixed(1) == hexes[i].y.toFixed(1)) {
        return true;
      }
    }
    return false;
  }

  //sorting the centers
  /*let sortedCenters = [];
  for (let i = 0; i < centers.length; i++) {
    sortedCenters.push(centers[i].sort(function(a, b) { return parseFloat(a.x) - parseFloat(b.x); }));
  }*/

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


  let lenMid = map[longest].length;
  let numMid = 0;
  for (let i = 0; i < map.length; i++) {
    if (map[i].length == map[longest].length) {
      numMid++;
    }
  }
  let longest = indexLongest(map);
  let lastLongest = indexLongest(map, true);

  console.log(coords);
  for (let row = 0; row < map.length; row++) { 
    for (let col = 0; col < map[row].length; col++) {
      for (let [key, value] of Object.entries(coords[row][col].edges)) {
        let img = new Image;
        img.onload = function(){
          ctx.drawImage(this, coords[row][col].edges[key].x - 15, coords[row][col].edges[key].y - 15, 30, 30);
        };
        img.src = images.brick;
      }
    }
  }

  function genMap(map, terrain) {
    map = map.split(',');
    terrain = terrain.split(',');
    
    //adding terrain and side sea
    let shores = 0;
    let lastLen = map[0].length;
    let lastMove = 'sub';
    for (let row = 0; row < map.length; row++) {
      map[row] = map[row].split('');
      let current = map[row].length;
      let next = map[row+1].length;
      for (let col = 0; col < map[row].length; col++) {
        let terrainIndex = Math.floor(Math.random() * terrain.length);
        let current = map[row][col];
        current.terrain = terrain[terrainIndex];
        current.vertices = {t: [], tl: [], bl: [], b: [], br: [], tr: []};
        terrain.splice(terrainIndex, 1);
  
        if (row == 0) {
          current.edges = {tl: ['sea'], l: [], bl: [], br: [], r: [], tr: ['sea']};
          shores += 2;
        }else if (row == map.length-1) {
          current.edges = {tl: [], l: [], bl: ['sea'], br: ['sea'], r: [], tr: []};
        }else if (col == 0) {
          let data = firstCol(previouses, current, next);
          current.edges = data.edges;
          shores += data.shores;
        }else if (col == map[row].length-1) {
  
        }
        
        
      }
      map[row].unshift({terrain: 'x',
                        vertices: {t: {}, tl: {}, bl: {}, b: {}, br: {}, tr: {}},
                        edges: {tl: {}, l: {}, bl: {}, br: {}, r: {}, tr: {}}});
      map[row].push({terrain: 'x',
                     vertices: {t: {}, tl: {}, bl: {}, b: {}, br: {}, tr: {}},
                     edges: {tl: {}, l: {}, bl: {}, br: {}, r: {}, tr: {}}});
    }
  
    //adding top and bottom sea
    map.unshift([]);
    map.push(([]));
    for (let i = 0; i < map[1].length-1; i++) {
      map[0].push({terrain: 'x',
                   vertices: {t: '', tl: '', bl: '', b: '', br: '', tr: ''},
                   edges: {tl: '', l: '', bl: '', br: '', r: '', tr: ''}});
    }
    for (let i = 0; i < map[map.length-2].length-1; i++) {
      map[map.length-1].push({terrain: 'x',
                              vertices: {t: '', tl: '', bl: '', b: '', br: '', tr: ''},
                              edges: {tl: '', l: '', bl: '', br: '', r: '', tr: ''}});
    }
  
    return map
  }

  /*let resizeTimer;
  window.onresize = function() {
    this.clearTimeout(resizeTimer);
    this.resizeTimer = setTimeout(doneResizing, 1000/60);
  }
  
  function doneResizing() {
    document.getElementById('w1').style.height = window.innerHeight + 'px';
  }*/

  

  /*let widthLimitting = checkWidthLimitting(map);
  let oldWidth = window.innerWidth;
  let oldHeight = window.innerHeight;
  
  let resizeTimer;
  window.onresize = function() {
    this.clearTimeout(resizeTimer);
    this.resizeTimer = setTimeout(doneResizing, 1000/60);
  }
  
  function doneResizing() {

    let isWidthLimitting = checkWidthLimitting(map);
    if (widthLimitting != isWidthLimitting) {
      console.log('1');
      main(map);
      widthLimitting = isWidthLimitting;
    }else {
      let wrapper = document.getElementById('wrapper');
      if (isWidthLimitting) {
        console.log('2');
        wrapper.style.height = window.innerHeight + 'px';
        wrapper.style.width = (window.innerHeight*oldWidth)/oldHeight + 'px';
        oldWidth = window.innerWidth;
        oldHeight = window.innerHeight;
      }else {
        console.log('3');
        wrapper.style.width = window.innerWidth + 'px';
        wrapper.style.height = (window.innerWidth*oldHeight)/oldWidth + 'px';
        oldWidth = window.innerWidth;
        oldHeight = window.innerHeight;
      }
    }*
  }*/

  window.onresize = async function() {
    let w1 = document.getElementById('w1');
    await sleep(500);
    if (w1.style.height > window.innerHeight) {
      w1.style.height = window.innerHeight;
    }
    if (w1.style.width > window.innerWidth) {
      w1.style.width = window.innerWidth;
    }
  }

  function checkWidthLimitting(map) {
    let mapData = getMapData(map);
    if (window.innerWidth > window.innerHeight) {
      var vertToVert = (window.innerHeight*0.9)/(mapData.rows-(0.25*(mapData.rows-1)));
      var apothem = vertToVert/4 * Math.tan(Math.PI/3);
  
      if (indexLongest(map) != indexLongest(map, true)) {
        var maxW = apothem + map[mapData.longest].length*2*apothem;
      }else {
        var maxW = map[mapData.longest].length*2*apothem;
      }
  
      if (maxW > window.innerWidth) {
        return true;
      }else {
        return false;
      }
    }else {
      return true;
    }
  }

  //vertToVert = h/(mapData.rows-(Math.tan(Math.PI/3)*Math.sin(Math.PI/6)*0.25*(mapData.rows-1)));

  for (let i = 0; i < coords.vertices.length; i++) {
    let img = new Image;
    img.onload = function(){
      ctx.drawImage(this, coords.vertices[i].x-10, coords.vertices[i].y-10, 20, 20);
    };
    img.src = images.brick;
  }

  function rotate(cx, cy, x, y, angle) {
  let radians = (Math.PI / 180) * angle,
      cos = Math.cos(radians),
      sin = Math.sin(radians),
      nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
      ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
  return [offset(nx), offset(ny)];
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

function getMapData(map) {
  let mapData = {};
  mapData.longest = indexLongest(map);
  mapData.rows = map.length;
  mapData.columns = map[mapData.longest].length;
  return mapData;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function offset(x) {
  return Math.floor(x)+0.5;
}

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
    let vertToVert = (window.innerHeight)/map.length;
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