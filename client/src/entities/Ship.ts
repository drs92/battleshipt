class Ship {

    private damage = 0;
    private hits = new Map<string,boolean>();
    private coords: ICood[] = [];

    constructor(private size: number) { }

    getSize() {
        return this.size;
    }

    getDamage() {
        return this.damage;
    }

    inflictDamage(x: number, y: number) {
        this.hits.set(`${x},${y}`, true);
        this.damage++;
        return this.damage >= this.size;
    }

    inspect(x: number, y: number) {
        let hit = this.hits.get(`${x},${y}`);
        return !!hit;
    }

    isSunk() {
        return this.damage >= this.size;
    }
}

interface ICood {
    x: number;
    y: number;
}

export { Ship }
