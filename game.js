'use strict';

class Vector {
  constructor(x=0, y=0) {
    this.x = x;
    this.y = y;
  }

  plus(vector) {
		if (vector instanceof Vector) {
			return new Vector(this.x + vector.x, this.y + vector.y);
		}
		throw new Error('Можно прибавлять к вектору только вектор типа Vector');
	}

	times(n = 1) {
		return new Vector(this.x * n, this.y * n);
	}
}

class Actor {
  constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
    if(pos instanceof Vector && size instanceof Vector && speed instanceof Vector) {
      this.pos = pos;
      this.size = size;
      this.speed = speed;
    } else {
      throw new Error('В качестве аргумента передан не объект типа Vector!!!');
    }
  }

  act() {}

  get left() {return this.pos.x}
  get top() {return this.pos.y;}
  get right() {return this.pos.x + this.size.x}
  get bottom() {return this.pos.y + this.size.y}
  get type() {return 'actor'}

  isIntersect(actor) {
		if (!(actor instanceof Actor) || !actor) {
			throw new Error('Принимает один аргумент — движущийся объект, Actor!!!');
		}

		if (actor === this) {
			return false;
		}

		return this.left < actor.right && this.right > actor.left && this.top < actor.bottom && this.bottom > actor.top;
	}

}

class Level {
  constructor(grid = [], actorsArray = []) {
    this.grid = grid;
    this.actors = actorsArray;
    this.height = grid.length;
    this.width = grid.reduce((acc, el) => el.length > acc ? el.length : acc, 0);
    this.finishDelay = 1;
    this.player = actorsArray.find(el => el.type === 'player');
    this.status = null;
  }

  isFinished() {
    if(this.status != null && this.finishDelay < 0) {
      return true;
    }
    return false;
  }

  actorAt(actor) {
    if (!(actor instanceof Actor) || !actor) {
			throw new Error('Принимает один аргумент — движущийся объект, Actor!!!');
		}
    return this.actors.find(el => el.isIntersect(actor));
  }

  obstacleAt(pos, size){
    if (!(pos instanceof Vector) || !(size instanceof Vector)) {
      throw new Error('Проверте входящие аркументы');
    }
    let startX = Math.floor(pos.x);
    let endX   = Math.ceil(pos.x + size.x);
    let startY = Math.floor(pos.y);
    let endY   = Math.ceil(pos.y + size.y);
    if (startX < 0 || endX > this.width || startY < 0) {
      return 'wall';
    }
    if (endY > this.height) {
      return 'lava';
    }
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        if (this.grid[y][x]) {
          return this.grid[y][x];
        }
      }
    }
  }

  removeActor(actor) {
    // console.dir(actor);
    this.actors = this.actors.filter(item => item !== actor);
  }

  noMoreActors(type) {
		if (this.actors) {
			for (let actor of this.actors) {
				if (actor.type === type) {
					return false;
				}
			}
		}
		return true;
	}

  playerTouched(type, actor) {
		if (this.status === null) {
			if (type === 'lava' || type === 'fireball') {
				this.status = 'lost';
				return this.status;
			}
			if (type === 'coin') {
				this.removeActor(actor);
				if (this.noMoreActors('coin')) {
					this.status = 'won';
				}
			}
		}
	}

}

// ============================
// const grid = [
//   [undefined, undefined],
//   ['wall', 'wall']
// ];
//
// function MyCoin(title) {
//   this.type = 'coin';
//   this.title = title;
// }
// MyCoin.prototype = Object.create(Actor);
// MyCoin.constructor = MyCoin;
//
// const goldCoin = new MyCoin('Золото');
// const bronzeCoin = new MyCoin('Бронза');
// const player = new Actor();
// const fireball = new Actor();
//
// const level = new Level(grid, [ goldCoin, bronzeCoin, player, fireball ]);
//
// level.playerTouched('coin', goldCoin);
// level.playerTouched('coin', bronzeCoin);
//
// if (level.noMoreActors('coin')) {
//   console.log('Все монеты собраны');
//   console.log(`Статус игры: ${level.status}`);
// }
//
// const obstacle = level.obstacleAt(new Vector(1, 1), player.size);
// if (obstacle) {
//   console.log(`На пути препятствие: ${obstacle}`);
// }
//
// const otherActor = level.actorAt(player);
// if (otherActor === fireball) {
//   console.log('Пользователь столкнулся с шаровой молнией');
// }

// Парсер уровня
class LevelParser {
  constructor(dictionary) {
    this.dictionary = dictionary;
  }

  actorFromSymbol(symbol) {
    if(!symbol) {
      return undefined;
    }
    return this.dictionary[symbol];
  }

  obstacleFromSymbol(symbol) {
    if(symbol === 'x') {return 'wall'}
    if(symbol === '!') {return 'lava'}
    return undefined;
  }

  createGrid(arrStrin) {
    return arrStrin.map(item => {
      return item.split('').map(i => this.obstacleFromSymbol(i));
    });
  }

  createActors(plan) {
    let actors = [];
    plan = [].concat(plan).filter(Boolean);

    if (plan.length > 0 && this.dictionary !== undefined) {
      plan.reduce((rowMemo, row, rowIndex) => {
        row.split('').reduce((cellMemo, cell, cellIndex) => {
          if (this.dictionary[cell] === Actor ||
            this.dictionary[cell] !== undefined && this.dictionary[cell].prototype instanceof Actor) {
              actors.push(new this.dictionary[cell](new Vector(cellIndex, rowIndex)));
          }
        }, []);
      }, []);
    }
    return actors;
  }

  parse(strings) {
		const grid = this.createGrid(strings);
		const actors = this.createActors(strings);
		return new Level(grid, actors);
	}
}

// =======================
// const plan = [
//   ' @ ',
//   'x!x'
// ];
//
// const actorsDict = Object.create(null);
// actorsDict['@'] = Actor;
//
// const parser = new LevelParser(actorsDict);
// const level = parser.parse(plan);
//
// level.grid.forEach((line, y) => {
//   line.forEach((cell, x) => console.log(`(${x}:${y}) ${cell}`));
// });
//
// level.actors.forEach(actor => console.log(`(${actor.pos.x}:${actor.pos.y}) ${actor.type}`));

class Fireball extends Actor {
  constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)) {
    super(pos, new Vector(1, 1), speed);
  }

  get type() {
    return 'fireball';
  }

  getNextPosition(time = 1) {
    return new Vector(this.pos.x + this.speed.x * time, this.pos.y + this.speed.y * time);
  }

  handleObstacle() {
    this.speed.x = -this.speed.x;
    this.speed.y = -this.speed.y;
  }

  act(time, level) {
    if (level.obstacleAt(this.getNextPosition(time), this.size)) {
      this.handleObstacle();
    } else {
      this.pos = this.getNextPosition(time);
    }
  }
}

class HorizontalFireball extends Fireball {
  constructor(pos) {
    super(pos);
    this.speed = new Vector(2, 0);
    this.size = new Vector(1, 1);
  }
}

class VerticalFireball extends Fireball {
  constructor(pos) {
    super(pos);
    this.speed = new Vector(0, 2);
    this.size = new Vector(1, 1);
  }
}

class FireRain extends Fireball {
  constructor(pos) {
    super(pos);
    this.speed = new Vector(0, 3);
    this.size = new Vector(1, 1);
    this.currentPos = pos;
  }

  handleObstacle() {
    this.pos = this.currentPos;
  }
}

class Coin extends Actor {
  constructor(pos = new Vector(0, 0)) {
    super(pos.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6));
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * Math.PI * 2;
    this.startPos = new Vector(this.pos.x, this.pos.y);
  }

  get type() {
    return 'coin';
  }

  updateSpring(time = 1) {
    this.spring += this.springSpeed * time;
  }

  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist);
  }

  getNextPosition(time = 1) {
    this.updateSpring(time);
    return this.startPos.plus(this.getSpringVector());
  }

  act(time) {
    this.pos = this.getNextPosition(time);
  }
}

class Player extends Actor {
  constructor(pos) {
    super(pos);
    this.pos = this.pos.plus(new Vector(0, -0.5));
    this.size = new Vector(0.8, 1.5);
    this.speed = new Vector(0, 0);
  }

  get type() {
    return 'player';
  }
}

// ==============================
// ==============================
const schemas = [
  [
    '         ',
    '         ',
    '    =    ',
    '       o ',
    '      xxx',
    ' @       ',
    'xxx!     ',
    '         '
  ],
  [
    '      v  ',
    '         ',
    '  v      ',
    '        o',
    '        x',
    '@   x    ',
    'x        ',
    '         '
  ],
  [
    '                         ',
    '                         ',
    '      v                  ',
    '             x           ',
    '  |                      ',
    '        o                ',
    '        x          o     ',
    '@   x            | x     ',
    'x                =       ',
    ' !!!!!!!!!!!!!!!!!!!!!|  '
  ]
];
const actorDict = {
  '@': Player,
  'v': FireRain,
  '=': HorizontalFireball,
  '|': VerticalFireball,
  'o': Coin
}
const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
  .then(() => alert('Вы выиграли приз!'));

// loadLevels().then(json =>
//   runGame(JSON.parse(json), parser, DOMDisplay))
//     .then(() => alert('Вы выиграли приз!'));
