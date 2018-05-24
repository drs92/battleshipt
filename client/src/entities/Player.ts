import * as config from '../config';
import { Ship } from './Ship';
import * as utils from '../utils';

class Player {
    private board: (Ship | number)[][] = [];
    private history: config.ShipStatus[][] = [];
    private shipsRemaining = config.NUM_SHIPS;
    

    constructor(private name: string, public isComputer = false) {
        for (let y = 0; y < config.SIZE_Y; y++) {
            let arr: number[] = [];
            for (let x = 0; x < config.SIZE_X; x++) {
                arr.push(0);
            }
            this.board.push(arr);
        }
        this.history = this.board.map(row => row.map(col => 0));
    }

    canPlace(x: number, y: number, size: number, xDirection: boolean) {
        let fitsInBounds = xDirection ? x + size <= config.SIZE_X : y + size <= config.SIZE_Y;
        if (!fitsInBounds) {
            return false;
        }
        let intersects: boolean;
        if (xDirection) {
            intersects = utils.boundedSome(this.board[y], val => val !== 0, x, size + x);
        } else {
            intersects = utils.boundedSome(this.board, val => val[x] !== 0, y, size + y);
        }
        return !intersects;
    }

    inspectBoard(x: number, y: number) {
        let target = this.board[y][x];
        if (target instanceof Ship) {
            if (target.inspect(x, y)) {
                if (target.isSunk()) {
                    return 'ghost';
                }
                return 'hit';
            }
            return 'ship';
        }
    }

    inspectHistory(x: number, y: number) {
        let historyEntry = this.history[y][x];
        switch (historyEntry) {
            case config.ShipStatus.HIT:
            case config.ShipStatus.WIN:
                return 'hit';
            case config.ShipStatus.MISS:
                return 'miss';
            case config.ShipStatus.SUNK:
                return 'ghost';
        }
        return '';
    }

    place(x: number, y: number, size: number, xDirection: boolean) {
        let ship = new Ship(size);
        if (xDirection) {
            for (let c = x; c < x + size; c++) {
                this.board[y][c] = ship;
            }
        } else {
            for (let r = y; r < y + size; r++) {
                this.board[r][x] = ship;
            }
        }
    }

    receiveAttack(x: number, y: number) {
        // TODO: ALREADY_TAKEN
        let target = this.board[y][x];
        if (target instanceof Ship) {
            let sunk = target.inflictDamage(x, y);
            if (sunk) {
                this.shipsRemaining--;
                if (this.shipsRemaining === 0) {
                    return config.ShipStatus.WIN;
                }
                return config.ShipStatus.SUNK;
            }
            return config.ShipStatus.HIT;
        }
        return config.ShipStatus.MISS;
    }

    recordAttack(x: number, y: number, result: config.ShipStatus) {
        this.history[y][x] = result;
    }

    getName() {
        return this.name;
    }
}

export { Player }
