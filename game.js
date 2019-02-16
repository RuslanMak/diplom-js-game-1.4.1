'use strict';

class Vector {
  constructor() {

  }
}

class Actor {
  constructor() {

  }
}

class Level {
  constructor() {

  }
}


const grid = [
  new Array(3),
  ['wall', 'wall', 'lava']
];
const level = new Level(grid);
runLevel(level, DOMDisplay);
