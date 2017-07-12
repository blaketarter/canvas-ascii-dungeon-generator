const CELLS = {
  GROUND: {
    letter: '•',
    color: 'grey',
    isAnimated: false,
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

export {
  CELLS,
  LAYER_CELLS,
  WEAPON_CELLS,
  ACTIONS,
};
