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
    rows: 0,
    columns: 0,
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

  function getIndex(row, column, meta) {
    return column + (row * meta.columns);
  }

  function getRealX(column, meta) {
    return (column * meta.blockSize) + meta.xOffset;
  }

  function getRealY(row, meta) {
    return (row * meta.blockSize) + meta.yOffset;
  }

  function getDirectionFromRowColumn(columnFrom, rowFrom, columnTo, rowTo, meta) {
    if (columnFrom === columnTo) { // UP or DOWN
      if (rowFrom > rowTo) {
        return 'UP';
      }

      return 'DOWN';
    } else if (rowFrom === rowTo) { // LEFT or RIGHT
      if (columnFrom > columnTo) {
        return 'LEFT';
      }

      return 'RIGHT';
    }

    log(`INVALID direction for directionFromIndex ${columnFrom},${rowFrom} to ${columnTo},${rowTo}`);
    return 'INVALID';
  }

  function initMap(height, width, blockSize, meta) {
    const columns = (width / blockSize);
    const rows = (height / blockSize);
    const blockCount = rows * columns;

    mapMeta.columns = columns;
    mapMeta.rows = rows;
    mapMeta.blockSize = blockSize;
    mapMeta.blockCount = blockCount;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        map.push(
          initMapCell(r, c, blockSize, meta)
        );
      }
    }

    calculateMapPlacement();

    log('map initialized', map);
    log('mapMeta', mapMeta);
  }

  function initMapCell(row, column, size, meta) {
    return {
      row,
      column,
      size,
      index: getIndex(row, column, meta),
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
        cell.column,
        cell.row,
        cellTypes[cell.type].color,
        meta,
        ctx
      );
    });
  }

  function drawCell(letter, column, row, color, meta, ctx) {
    const realX = getRealX(column, meta);
    const realY = getRealY(row, meta);

    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.fillText(letter, realX + (meta.blockSize / 2), realY + (meta.blockSize / 2));

    if (window.__DEBUG__) {
      ctx.strokeRect(realX, realY, meta.blockSize, meta.blockSize);
    }
  }

  function drawLineWithRowColumn(columnFrom, rowFrom, columnTo, rowTo, cellType, map, meta) {
    const startIndex = getIndex(rowFrom, columnFrom, meta);
    const endIndex = getIndex(rowTo, columnTo, meta);
    const dir = getDirectionFromRowColumn(columnFrom, rowFrom, columnTo, rowTo, meta);
    
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

    for (let i = endIndex; i <= startIndex; i += meta.columns) {
      map[i].type = cellType;
    }
  }

  function drawLineDown(startIndex, endIndex, cellType, map, meta) {
    log(`drawing line DOWN from ${startIndex} to ${endIndex} of cell type ${cellType}`);

    for (let i = startIndex; i <= endIndex; i += meta.columns) {
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

      const from = map[8];
      const to = map[13];

      log(getDirectionFromRowColumn(from.column, from.row, to.column, to.row, mapMeta));
      drawLineWithRowColumn(from.column, from.row, to.column, to.row, 'PATH', map, mapMeta);
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
