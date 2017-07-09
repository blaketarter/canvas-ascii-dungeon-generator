(function(window, document) {
  let canvasElement = null;
  let canvasContext = null;

  const screen = {
    height: 0,
    width: 0,
  }

  const options = {
    background: 'black',
    size: {
      height: 500,
      width: 400,
    },
    blockSize: 50,
    fontScale: 0.5,
  };

  const map = [];

  const mapMeta = {
    blockCount: 0,
    blockSize: 0,
    xBlocks: 0,
    yBlocks: 0,
    xOffset: 0,
    yOffset: 0,
  };

  const cellTypes = {
    GROUND: {
      letter: '%',
      color: 'grey'
    },
    WALL: {
      letter: '#',
      color: 'darkblue',
    },
    PATH: {
      letter: '/',
      color: 'lightgreen',
    }
  };

  function getCanvasContext(canvasElement) {
    return canvasElement.getContext('2d');
  }

  function log(...messages) {
    if (window.__DEV__) {
      console.log(...messages);
    }
  }

  function getScreenSize(parent) {
    screen.height = parent.innerHeight;
    screen.width = parent.innerWidth;
  }

  function setupCanvas(ele, ctx, height, width, background, blockSize) {
    ele.height = height;
    ele.width = width;

    ctx.fillStyle = background;
    ctx.font = `${blockSize * options.fontScale}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillRect(0, 0, width, height);
  }

  function getIndex(x, y, meta) {
    return x + (y * meta.yBlocks)
  }

  function getRowFromIndex(index, meta) {

  }

  function getColumnFromIndex(index, meta) {
    return meta.xBlocks - (index - (Math.floor(index / meta.yBlocks) * meta.yBlocks)) - 1;
  }

  function getRealX(x, meta) {
    return (x * meta.blockSize) + meta.xOffset;
  }

  function getRealY(y, meta) {
    return (y * meta.blockSize) + meta.yOffset;
  }

  function getDirectionFromIndex(startIndex, endIndex, meta) {
    if (startIndex > endIndex) {
      if (Math.floor(startIndex / meta.yBlocks) === Math.floor(endIndex / meta.yBlocks)) {
        return 'LEFT';
      }
      return 'UP';
    }

    if (Math.floor(startIndex / meta.yBlocks) === Math.floor(endIndex / meta.yBlocks)) {
      return 'RIGHT';
    }
    return 'DOWN';
  }

  function getDirectionFromXY(xFrom, yFrom, xTo, yTo, meta) {
    if (xFrom === xTo) { // LEFT or RIGHT
      if (yFrom > yTo) {
        return 'LEFT';
      }

      return 'RIGHT';
    } else if (yFrom === yTo) { // UP or DOWN
      if (xFrom > xTo) {
        return 'UP';
      }

      return 'DOWN';
    }

    log(`INVALID direction for directionFromIndex ${xFrom},${yFrom} to ${xTo},${yTo}`);
    return 'INVALID';
  }

  window.getDirectionFromIndex = getDirectionFromIndex;

  function initMap(height, width, blockSize, meta) {
    const xBlocks = (width / blockSize);
    const yBlocks = (height / blockSize);
    const blockCount = xBlocks * yBlocks;

    mapMeta.xBlocks = xBlocks;
    mapMeta.yBlocks = yBlocks;
    mapMeta.blockSize = blockSize;
    mapMeta.blockCount = blockCount;

    for (let y = 0; y < yBlocks; y++) {
      for (let x = 0; x < xBlocks; x++) {
        map.push(
          initMapCell(x, y, blockSize, getIndex(x, y, meta))
        );
      }
    }

    calculateMapPlacement();

    log('map initialized', map);
    log('mapMeta', mapMeta);
  }

  function initMapCell(x, y, blockSize, index) {
    return {
      x,
      y,
      size: blockSize,
      index,
      type: 'GROUND',
    };
  }

  function calculateMapPlacement() {
    const xCenter = screen.width / 2;
    const xOffset = xCenter - (options.size.width / 2);
    const yCenter = screen.width / 2;
    const yOffset = yCenter - (options.size.height / 2);

    mapMeta.xOffset = xOffset;
    mapMeta.yOffset = yOffset;
  }

  function drawMap(map, meta, ctx) {
    log('ctx', ctx);

    map.forEach(cell => {
      drawCell(
        // cellTypes[cell.type].letter,
        cell.index,
        cell.x,
        cell.y,
        cellTypes[cell.type].color,
        meta,
        ctx
      );
    });
  }

  function drawCell(letter, x, y, color, meta, ctx) {
    const realX = getRealX(x, meta);
    const realY = getRealY(y, meta);

    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.fillText(letter, realX + (meta.blockSize / 2), realY + (meta.blockSize / 2));

    if (window.__DEBUG__) {
      ctx.strokeRect(realX, realY, meta.blockSize, meta.blockSize);
    }
  }

  function drawLineWithXY(xFrom, yFrom, xTo, yTo, cellType, map, meta) {
    const startIndex = getIndex(xFrom, yFrom, meta);
    const endIndex = getIndex(xTo, yTo, meta);

    drawLineWithIndex(startIndex, endIndex, cellType, map, meta);
  }

  function drawLineWithIndex(startIndex, endIndex, cellType, map, meta) {
    const dir = getDirectionFromIndex(startIndex, endIndex, meta);

    switch (dir) {
      case 'UP':
        drawLineUp(startIndex, endIndex, cellType, map, meta);
        break;
      case 'DOWN':
        drawLineDown(startIndex, endIndex, cellType, map, meta);
        break;
      case 'LEFT':
        drawLineLeft(startIndex, endIndex, cellType, map, meta);
        break;
      case 'RIGHT':
        drawLineRight(startIndex, endIndex, cellType, map, meta);
        break;
    }
  }

  function drawLineUp(startIndex, endIndex, cellType, map, meta) {
    log(`drawing line UP from ${startIndex} to ${endIndex} of cell type ${cellType}`);

    for (let i = endIndex; i <= startIndex; i += meta.yBlocks) {
      map[i].type = cellType;
    }
  }

  function drawLineDown(startIndex, endIndex, cellType, map, meta) {
    log(`drawing line DOWN from ${startIndex} to ${endIndex} of cell type ${cellType}`);

    for (let i = startIndex; i <= endIndex; i += meta.yBlocks) {
      map[i].type = cellType;
    }
  }

  function drawLineLeft(startIndex, endIndex, cellType, map, meta) {
    log(`drawing line LEFT from ${startIndex} to ${endIndex} of cell type ${cellType}`);

    for (let i = startIndex; i >= endIndex; i--) {
      map[i].type = cellType;
    }
  }

  function drawLineRight(startIndex, endIndex, cellType, map, meta) {
    log(`drawing line RIGHT from ${startIndex} to ${endIndex} of cell type ${cellType}`);

    for (let i = startIndex; i <= endIndex; i++) {
      map[i].type = cellType;
    }
  }

  const generator = {
    attatch: function attatch(element) {
      canvasElement = element;
      canvasContext = getCanvasContext(canvasElement);

      log('attatched!');
    },
    start: function start() {
      console.time('start');
      getScreenSize(window);
      setupCanvas(canvasElement, canvasContext, screen.height, screen.width, options.background, options.blockSize);
      initMap(options.size.height, options.size.width, options.blockSize, mapMeta);
      drawLineWithIndex(50, 55, 'PATH', map, mapMeta);
      drawMap(map, mapMeta, canvasContext);

      console.timeEnd('start');
      log('started!');
    }
  };

  if (!window.generator) {
    window.generator = generator;
  } else {
    window.generatorNoConflict = generator;
  }
})(window, document);
