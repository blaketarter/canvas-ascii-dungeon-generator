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
    blockSize: 25,
    fontScale: 1,
    fpsInterval: 1000,
    then: null,
    now: null,
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
      letter: '•',
      color: 'grey',
      isAnimated: false,
      // letterOptions: [';', ':', ',', '.'],
      isPassable: true,
    },
    FLOOR: {
      letter: '*',
      color: 'grey',
      isAnimated: false,
      isPassable: true,
    },
    WALL: {
      letter: '#',
      color: 'darkslategray',
      isAnimated: false,
      isPassable: false,
    },
    PATH: {
      letter: '/',
      color: 'grey',
      isAnimated: false,
      isPassable: true,
    },
    WATER: {
      letter: '-',
      color: 'royalblue',
      isAnimated: true,
      steps: ['-', '-', '~'],
      framesPerStep: 25,
      startOnRandomStep: true,
      isPassable: false,
    },
    LAVA: {
      letter: '-',
      color: 'orangered',
      isAnimated: true,
      steps: ['-', '-', '~', '˚', '-', '-', '~'],
      framesPerStep: 15,
      startOnRandomStep: true,
      isPassable: false,
    },
    PLAYER: {
      letter: 'Ϙ',
      color: 'green',
      isAnimated: false,
      isPassable: true,
    },
    DOOR: {
      letter: 'D',
      color: 'peru',
      hasState: true,
      isPassable: false,
      isActionable: true,
      states: {
        OPEN: {
          letter: 'O',
          isPassable: true,
        },
        CLOSED: {
          letter: 'D',
          isPassable: false,
        },
        LOCKED: {
          letter: 'L',
          isPassable: false,
        },
      },
      defaultState: 'CLOSED',
    }
  };

  const LAYER_CELLS = {
    UP: {
      letter: '↑',
      color: 'white',
    },
    DOWN: {
      letter: '↓',
      color: 'white',
    },
    LEFT: {
      letter: '←',
      color: 'white',
    },
    RIGHT: {
      letter: '→',
      color: 'white',
    },
  };

  const WEAPON_CELLS = {
    EMPTY_ATTACK: {
      framesPerStep: 2,
      steps: ['˟', '•'],
      color: 'silver',
    }
  };

  const ACTIONS = {
    OPEN_DOOR: {
      matchingCellType: 'DOOR',
      matchingCellStates: ['CLOSED'],
      nextState: 'OPEN',
    },
    CLOSE_DOOR: {
      matchingCellType: 'DOOR',
      matchingCellStates: ['OPEN'],
      nextState: 'CLOSED',
    }
  };

  const player = {
    cell: null,
    direction: 'RIGHT',
  };

  function getCanvasContext(canvasElement) {
    return canvasElement.getContext('2d');
  }

  function log(...messages) {
    if (window.__DEV__) {
      console.log(...messages);
    }
  }

  function time(...messages) {
    if (window.__DEV__) {
      console.time(...messages);
    }
  }

  function timeEnd(...messages) {
    if (window.__DEV__) {
      console.timeEnd(...messages);
    }
  }

  function randomBetween(from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from);
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

  function getIndex(row, column, columns) {
    return column + (row * columns);
  }

  function getRealX(column, meta) {
    return (column * meta.blockSize) + meta.xOffset;
  }

  function getRealY(row, meta) {
    return (row * meta.blockSize) + meta.yOffset;
  }

  function getCellUp(sourceCell) {
    if (sourceCell.row === 0) {
      log('edge');
      return null;
    }

    return map[sourceCell.index - mapMeta.columns];
  }

  function getCellInFrontOfPlayer() {
    switch (player.direction) {
      case 'UP':
        return getCellUp(player.cell);
      case 'DOWN':
        return getCellDown(player.cell);
      case 'LEFT':
        return getCellLeft(player.cell);
      case 'RIGHT':
        return getCellRight(player.cell);
    }
  }

  function getCellDown(sourceCell) {
    if (sourceCell.row === mapMeta.rows - 1) {
      log('edge');
      return null;
    }

    return map[sourceCell.index + mapMeta.columns];
  }

  function getCellLeft(sourceCell) {
    if (sourceCell.column === 0) {
      log('edge');
      return null;
    }

    return map[sourceCell.index - 1];
  }

  function getCellRight(sourceCell) {
    if (sourceCell.column === mapMeta.columns - 1) {
      log('edge');
      return null;
    }

    return map[sourceCell.index + 1];
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
      animationStep: 0,
      animationStepCounter: 0,
      isAnimated: false,
      isOccupied: false,
      isPlayerOccupied: false,
      shouldRedraw: false,
      state: null,
      hasAnimatedObject: false,
      animatedObjectType: null,
      // animatedObjectStep: 0,
      // animatedObjectCounter: 0,
    };
  }

  function calculateMapPlacement() {
    const xCenter = screen.width / 2;
    const xOffset = xCenter - (options.size.width / 2);
    const yCenter = screen.width / 2;
    const yOffset = yCenter - (options.size.height / 2);

    mapMeta.xOffset = xOffset;
    // mapMeta.yOffset = yOffset;
    mapMeta.yOffset = 100;
  }

  function drawMap(map, meta, ctx) {
    log('ctx', ctx);

    map.forEach(cell => {
      if (window.__DEBUG__) {
        drawCell(
          cell.index,
          cell.column,
          cell.row,
          cellTypes[cell.type].color,
          meta,
          ctx,
          cell,
        );
      } else {
        drawCell(
          cell.isAnimated ? cellTypes[cell.type].steps[cell.animationStep] : cellTypes[cell.type].letter,
          cell.column,
          cell.row,
          cellTypes[cell.type].color,
          meta,
          ctx,
          cell,
        );
      }
    });
  }

  function drawCell(letter, column, row, color, meta, ctx, cell) {
    const realX = getRealX(column, meta);
    const realY = getRealY(row, meta);

    if (cell.isPlayerOccupied) {
      ctx.fillStyle = cellTypes['PLAYER'].color;
      ctx.strokeStyle = cellTypes['PLAYER'].color;
      ctx.fillText(cellTypes['PLAYER'].letter, realX + (meta.blockSize / 2), realY + (meta.blockSize / 2));
      
      if (player.direction) {
        ctx.fillStyle = LAYER_CELLS[player.direction].color;
        ctx.strokeStyle = LAYER_CELLS[player.direction].color;
        ctx.fillText(LAYER_CELLS[player.direction].letter, realX + (meta.blockSize / 2), realY + (meta.blockSize / 2));
      }
    } else {
      let cellType;

      if (cell.hasAnimatedObject) {
        cellType = WEAPON_CELLS[cell.animatedObjectType];
      } else {
        cellType = cellTypes[cell.type];
      }

      ctx.fillStyle = color;
      ctx.strokeStyle = color;

      if (cellType.letterOptions && cellType.letterOptions.length) {
        ctx.fillText(
          cellType.letterOptions[randomBetween(0, cellType.letterOptions.length - 1)],
          realX + (meta.blockSize / 2), realY + (meta.blockSize / 2)
        );
      } else if (cellType.hasState) {
        ctx.fillText(cellType.states[cell.state].letter, realX + (meta.blockSize / 2), realY + (meta.blockSize / 2));
      } else {
        ctx.fillText(letter, realX + (meta.blockSize / 2), realY + (meta.blockSize / 2));
      }
    }

    if (window.__DEBUG__) {
      ctx.strokeRect(realX, realY, meta.blockSize, meta.blockSize);
    }
  }

  function clearCell(column, row, options, meta, ctx) {
    const realX = getRealX(column, meta);
    const realY = getRealY(row, meta);

    ctx.fillStyle = options.background;
    ctx.clearRect(realX, realY, meta.blockSize, meta.blockSize);
    ctx.fillRect(realX - 1, realY - 1, meta.blockSize + 2, meta.blockSize + 2);
  }

  function drawBoxWithRowColumn(columnFrom, rowFrom, columnTo, rowTo, cellType, shouldFill, map, meta) {
    let startIndex = getIndex(rowFrom, columnFrom, meta);
    let endIndex = getIndex(rowTo, columnTo, meta);
    let a, b, c, d;

    if (rowFrom > rowTo && columnFrom > columnTo) {
      a = getIndex(rowTo, columnTo, meta);        // A(end)------B
      b = getIndex(rowTo, columnFrom, meta);      // |           |
      c = getIndex(rowFrom, columnFrom, meta);    // |           |
      d = getIndex(rowFrom, columnTo, meta);      // D-----------C(start)
    } else if (rowFrom < rowTo && columnFrom < columnTo) {
      a = getIndex(rowFrom, columnFrom, meta);    // A(start)----B
      b = getIndex(rowFrom, columnTo, meta);      // |           |
      c = getIndex(rowTo, columnTo, meta);        // |           |
      d = getIndex(rowTo, columnFrom, meta);      // D-----------C(end)
    } else if (rowFrom < rowTo && columnFrom > columnTo) {
      a = getIndex(rowFrom, columnTo, meta);      // A-----------B(start)
      b = getIndex(rowFrom, columnFrom, meta);    // |           |
      c = getIndex(rowTo, columnFrom, meta);      // |           |
      d = getIndex(rowTo, columnTo, meta);        // D(end)------C
    } else if (rowFrom > rowTo && columnFrom < columnTo) {
      a = getIndex(rowTo, columnFrom, meta);      // A-----------B(end)
      b = getIndex(rowTo, columnTo, meta);        // |           |
      c = getIndex(rowFrom, columnTo, meta);      // |           |
      d = getIndex(rowFrom, columnFrom, meta);    // D(start)----C
    } 

    log(`Drawing box from ${startIndex} to ${endIndex}`);
    log(`A - ${a}, B - ${b}, C - ${c}, D - ${d}`);

    if (!shouldFill) {
      drawLineRight(a, b, cellType, map, meta);
      drawLineDown(b, c, cellType, map, meta);
      drawLineLeft(c, d, cellType, map, meta);
      drawLineUp(d, a, cellType, map, meta);
    } else {
      let pointerA = a;
      let pointerB = b;

      while (pointerA !== d) {
        drawLineRight(pointerA, pointerB, cellType, map, meta);

        pointerA += meta.columns;
        pointerB += meta.columns;
      }

      drawLineRight(d, c, cellType, map, meta);
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

  function setCell(cell, newCellType) {
    cell.type = newCellType;

    if (cellTypes[newCellType].isAnimated) {
      initAnimatedCell(cell);
    }
  }

  function drawLineUp(startIndex, endIndex, cellType, map, meta) {
    log(`drawing line UP from ${startIndex} to ${endIndex} of cell type ${cellType}`);

    for (let i = endIndex; i <= startIndex; i += meta.columns) {
      setCell(map[i], cellType);
    }
  }

  function drawLineDown(startIndex, endIndex, cellType, map, meta) {
    log(`drawing line DOWN from ${startIndex} to ${endIndex} of cell type ${cellType}`);

    for (let i = startIndex; i <= endIndex; i += meta.columns) {
      setCell(map[i], cellType);
    }
  }

  function drawLineLeft(startIndex, endIndex, cellType, map, meta) {
    log(`drawing line LEFT from ${startIndex} to ${endIndex} of cell type ${cellType}`);

    for (let i = startIndex; i >= endIndex; i--) {
      setCell(map[i], cellType);
    }
  }

  function drawLineRight(startIndex, endIndex, cellType, map, meta) {
    log(`drawing line RIGHT from ${startIndex} to ${endIndex} of cell type ${cellType}`);

    for (let i = startIndex; i <= endIndex; i++) {
      setCell(map[i], cellType);
    }
  }

  function initAnimatedCell(cell) {
    const animatedCellType = cellTypes[cell.type];
    cell.animationStepCounter = animatedCellType.framesPerStep;
    cell.isAnimated = true;

    if (animatedCellType.startOnRandomStep) {
      const randomStep = randomBetween(0, animatedCellType.steps.length - 1);
      cell.animationStep = randomStep;
    }
  }

  function step(timestamp) {
    requestAnimationFrame(step);

    options.now = timestamp;
    let elapsed = options.now - options.then;

    if (elapsed > options.fpsInterval) {
      options.then = options.now - (elapsed % options.fpsInterval);

      if (window.__DEBUG__) {
        // time('draw');
      }

      draw(map);

      if (window.__DEBUG__) {
        // timeEnd('draw');
      }
    }
  }

  function draw() {
    map
      .filter(cell => cell.isAnimated || cell.shouldRedraw || cell.isOccupied)
      .forEach(cell => {
        if (cell.shouldRedraw) {
          clearCell(cell.column, cell.row, options, mapMeta, canvasContext);
          drawCell(cellTypes[cell.type].letter, cell.column, cell.row, cellTypes[cell.type].color, mapMeta, canvasContext, cell);
          cell.shouldRedraw = false;
          return;
        }

        if (cell.isOccupied && cell.isPlayerOccupied) {
          clearCell(cell.column, cell.row, options, mapMeta, canvasContext);
          drawCell(cellTypes[cell.type].letter, cell.column, cell.row, cellTypes[cell.type].color, mapMeta, canvasContext, cell);
          return;
        }

        let animatedObject;

        if (cell.hasAnimatedObject) {
          animatedObject = WEAPON_CELLS[cell.animatedObjectType];
        } else {
          animatedObject = cellTypes[cell.type];
        }

        if (cell.animationStepCounter <= 0) {
          if (cell.animationStep >= animatedObject.steps.length) {
            cell.animationStep = 0;
          }

          cell.letter = animatedObject.steps[cell.animationStep];

          clearCell(cell.column, cell.row, options, mapMeta, canvasContext);
          drawCell(cell.letter, cell.column, cell.row, animatedObject.color, mapMeta, canvasContext, cell);

          cell.animationStepCounter = animatedObject.framesPerStep;

          cell.animationStep += 1;
          
          if (cell.hasAnimatedObject && cell.animationStep >= animatedObject.steps.length) {
            unsetAnimatedObject(cell);
          }
        } else {
          cell.animationStepCounter -= 1;
        }
      });
  }

  function movePlayer(toCell) {
    if (!toCell.state && !cellTypes[toCell.type].isPassable) {
      log('not passable');
      return;
    }

    if (
      toCell.state &&
      cellTypes[toCell.type].states[toCell.state] &&
      typeof cellTypes[toCell.type].states[toCell.state].isPassable === 'boolean'
      && !cellTypes[toCell.type].states[toCell.state].isPassable
    ) {
      log('not passable because of state');
      return;
    }

    if (player.cell) {
      player.cell.isOccupied = false;
      player.cell.isPlayerOccupied = false;
      player.cell.shouldRedraw = true;
    }

    player.cell = toCell;

    player.cell.isOccupied = true;
    player.cell.isPlayerOccupied = true;
  }

  function movePlayerDir(dir) {
    if (!player) {
      return;
    }

    if (!dir) {
      return;
    }

    switch (dir) {
      case 'UP':
        movePlayerUp();
        break;
      case 'DOWN':
        movePlayerDown();
        break;
      case 'LEFT':
        movePlayerLeft();
        break;
      case 'RIGHT':
        movePlayerRight();
        break;
    }
  }

  function movePlayerUp() {
    if (player.direction !== 'UP') {
      player.direction = 'UP';
      return;
    }

    const currentCell = player.cell;
    const nextCell = getCellUp(currentCell);

    if (nextCell) {
      movePlayer(nextCell);
    }
  }

  function movePlayerDown() {
    if (player.direction !== 'DOWN') {
      player.direction = 'DOWN';
      return;
    }

    const currentCell = player.cell;
    const nextCell = getCellDown(currentCell);

    if (nextCell) {
      movePlayer(nextCell);
    }
  }

  function movePlayerLeft() {
    if (player.direction !== 'LEFT') {
      player.direction = 'LEFT';
      return;
    }

    const currentCell = player.cell;
    const nextCell = getCellLeft(currentCell);

    if (nextCell) {
      movePlayer(nextCell);
    }
  }

  function movePlayerRight() {
    if (player.direction !== 'RIGHT') {
      player.direction = 'RIGHT';
      return;
    }

    const currentCell = player.cell;
    const nextCell = getCellRight(currentCell);

    if (nextCell) {
      movePlayer(nextCell);
    }
  }

  function placeDoor(cell) {
    cell.type = 'DOOR';
    cell.state = cellTypes['DOOR'].defaultState;
    cell.shouldRedraw = true;
  }

  function genericAction() {
    const playerCell = player.cell;
    // const surroundingCells = [
    //   getCellUp(playerCell),
    //   getCellDown(playerCell),
    //   getCellLeft(playerCell),
    //   getCellRight(playerCell),
    // ];

    const surroundingCells = [];

    // switch (player.direction) {
    //   case 'UP':
    //     surroundingCells.push(getCellUp(playerCell));
    //     break;
    //   case 'DOWN':
    //     surroundingCells.push(getCellDown(playerCell));
    //     break;
    //   case 'LEFT':
    //     surroundingCells.push(getCellLeft(playerCell));
    //     break;
    //   case 'RIGHT':
    //     surroundingCells.push(getCellRight(playerCell));
    //     break;
    // }

    surroundingCells.push(getCellInFrontOfPlayer());

    const actionCells = surroundingCells
      .filter(cell => cellTypes[cell.type].isActionable)
      .map(cell => {
        const action = getMatchingAction(cell);
        performAction(cell, action);
        return cell;
      });
    
    if (!actionCells.length) {
      return emptyAttack();
    }
  }

  function emptyAttack() {
    const cellInFrontOfPlayer = getCellInFrontOfPlayer();

    if (!cellTypes[cellInFrontOfPlayer.type].isPassable || cellInFrontOfPlayer.isOccupied) {
      return;
    }

    log('empty attack');

    setAnimatedObjectType(cellInFrontOfPlayer, 'EMPTY_ATTACK');
  }

  function setAnimatedObjectType(cell, type) {
    cell.hasAnimatedObject = true;
    cell.isAnimated = true;
    cell.animatedObjectType = type;
    cell.animationStep = 0;
    cell.animationStepCounter = WEAPON_CELLS[type].framesPerStep;
  }

  function unsetAnimatedObject(cell) {
    cell.hasAnimatedObject = false;
    cell.isAnimated = false;
    cell.animatedObjectType = null;
    cell.animationStep = 0;
    cell.animationStepCounter = 0;
    cell.shouldRedraw = true;
  }

  function getMatchingAction(cell) {
    for (let action in ACTIONS) {
      if (!ACTIONS[action].matchingCellType === cell.type) {
        continue;
      }

      if (ACTIONS[action].matchingCellStates.includes(cell.state)) {
        return ACTIONS[action];
      }
    }
  }

  function performAction(cell, action) {
    log('matching action found for', cell, 'action is', action);
    cell.state = action.nextState;
    cell.shouldRedraw = true;
  }

  function listenForKeyPress(e) {
    const key = e.keyCode || e.which;

    switch (key) {
      case 37: // left arrow
      case 65: // a
        movePlayerDir('LEFT');
        break;
      case 38: // up arrow
      case 87: // w
        movePlayerDir('UP');
        break;
      case 39: // right arrow
      case 68: // d
        movePlayerDir('RIGHT');
        break;
      case 40: // down arrow
      case 83: // s  
        movePlayerDir('DOWN');
        break;
      case 32: // spacebar
        genericAction();
        break;
    }
  }

  const generator = {
    attatch: function attatch(element) {
      canvasElement = element;
      canvasContext = getCanvasContext(canvasElement);
      window.addEventListener('keydown', listenForKeyPress);

      log('attatched!');
    },
    generate: function start() {
      if (window.__DEBUG__) {
        options.fontScale = 0.5;
      }

      time('start');
      getScreenSize(window);
      setupCanvas(canvasElement, canvasContext, screen.height, screen.width, options.background, options.blockSize);
      initMap(options.size.height, options.size.width, options.blockSize, mapMeta);

      const boxFrom = map[74];
      const boxTo = map[116];

      const lineFrom = map[77];
      const lineTo = map[189];

      const waterFrom = map[147];
      const waterTo = map[203];

      const lavaFrom = map[246];
      const lavaTo = map[301];

      drawLineWithRowColumn(lineFrom.column, lineFrom.row, lineTo.column, lineTo.row, 'PATH', map, mapMeta);
      drawBoxWithRowColumn(boxFrom.column, boxFrom.row, boxTo.column, boxTo.row, 'FLOOR', true, map, mapMeta);
      drawBoxWithRowColumn(boxFrom.column, boxFrom.row, boxTo.column, boxTo.row, 'WALL', false, map, mapMeta);
      drawBoxWithRowColumn(waterFrom.column, waterFrom.row, waterTo.column, waterTo.row, 'WATER', true, map, mapMeta);
      drawBoxWithRowColumn(lavaFrom.column, lavaFrom.row, lavaTo.column, lavaTo.row, 'LAVA', true, map, mapMeta);

      movePlayer(map[18]);
      placeDoor(map[71]);

      // initAnimatedCells(map);
      drawMap(map, mapMeta, canvasContext);

      timeEnd('start');
      log('started!');
    },
    animate: function animate(fps) {
      options.fpsInterval = 1000 / fps;
      options.then = window.performance.now();
      step();
    },
  };

  if (!window.generator) {
    window.generator = generator;
  } else {
    window.generatorNoConflict = generator;
  }
})(window, document);
