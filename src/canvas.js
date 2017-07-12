function getCanvasContext(canvasElement) {
  return canvasElement.getContext('2d');
}

function setupCanvas({
  element,
  context,
  height,
  width,
  background,
  blockSize,
  fontScale,
}) {
  element.height = height;
  element.width = width;

  context.fillStyle = background;
  context.font = `${blockSize * fontScale}px sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillRect(0, 0, width, height);
}

export {
  getCanvasContext,
  setupCanvas,
};
