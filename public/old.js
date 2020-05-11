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