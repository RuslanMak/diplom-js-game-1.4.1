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
