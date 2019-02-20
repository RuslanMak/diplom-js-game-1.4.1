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
			throw new Error('Принимает один аргумент — движущийся объект типа Actor!!!');
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
}
