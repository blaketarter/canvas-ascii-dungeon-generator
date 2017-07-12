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
  return {
    height: parent.innerHeight,
    width: parent.innerWidth,
  };
}

function getIndex({ row, column, columns }) {
  return column + (row * columns);
}

function getRealX({ column, meta, xOffset }) {
  return (column * blockSize) + xOffset;
}

function getRealY({ row, blockSize, yOffset }) {
  return (row * blockSize) + yOffset;
}

export {
  log,
  time,
  timeEnd,
  randomBetween,
  getScreenSize,
  getIndex,
  getRealX,
  getRealY,
};
