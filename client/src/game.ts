import * as config from './config';
import * as utils from './utils';
import { Player } from './entities/Player';

let players = [new Player('Player 1')];
let playerIndex = 0;

let inputGrid: HTMLDivElement[][] = [];
let historyGrid: HTMLDivElement[][] = [];

let headingBox = <HTMLHeadingElement>document.getElementById('heading');
let detailBox = <HTMLParagraphElement>document.getElementById('detail');
let contentBox = <HTMLDivElement>document.getElementById('content');
let boardsBox = <HTMLDivElement>document.getElementById('boards');

function initGrid(grid: HTMLDivElement[][], title: string, { handleClick, handleMouseEnter, handleMouseLeave}: IEventHandlers, getClass?: (x: number, y: number) => string) {
    let boardDiv = document.createElement('div');
    boardDiv.className = 'board';
    let h3 = document.createElement('h3');
    h3.innerText = title;
    h3.className = 'mt-0';
    boardDiv.appendChild(h3);
    for (let y = 0; y < config.SIZE_Y; y++) {
        let row: HTMLDivElement[] = [];
        let rowDiv = document.createElement('div');
        rowDiv.className = 'row';
        for (let x = 0; x < config.SIZE_X; x++) {
            let div = document.createElement('div');
            div.className = 'square';
            if (getClass) {
                div.classList.add(getClass(x, y));
            }
            div.onclick = handleClick ? handleClick.bind(null, x, y, div) : null;
            div.onmouseenter = handleMouseEnter ? () => handleMouseEnter(x, y, div) : null;
            div.onmouseleave = handleMouseLeave ? () => handleMouseLeave(x, y, div) : null;
            rowDiv.appendChild(div);
            row.push(div);
        }
        boardDiv.appendChild(rowDiv);
        grid.push(row);
    }
    boardsBox.appendChild(boardDiv);
}

async function runGame() {
    let playerMode = await playerModeSequence();
    players.push(new Player('Player 2', playerMode === 'computer'));

    initGrid(inputGrid, 'Ship Grid', {
        handleClick: null,
        handleMouseEnter: null,
        handleMouseLeave: null
    });

    await placementSequence();
    await battleSequence();
}

function resetGrid(grid: HTMLDivElement[][], { handleClick, handleMouseEnter, handleMouseLeave}: IEventHandlers, getClass?: (x: number, y: number) => string) {
    grid.forEach((row, y) => {
        row.forEach((div, x) => {
            div.className = 'square';
            if (getClass) {
                let c = getClass(x,y);
                if (c) {
                    div.classList.add(getClass(x, y));
                }
            }
            div.onclick = handleClick ? () => handleClick(x, y, div) : null;
            div.onmouseenter = handleMouseEnter ? () => handleMouseEnter(x, y, div) : null;
            div.onmouseleave = handleMouseLeave ? () => handleMouseLeave(x, y, div) : null;
        });
    });
}

async function battleSequence() {
    let allowAttack = true;
    initGrid(historyGrid, 'Attack Grid', {
        handleClick: null,
        handleMouseEnter: null,
        handleMouseLeave: null
    });
    createSwatches();

    let winner: Player;
    let i = 0;
    while (true) {
        let result: config.ShipStatus;
        if (players[i].isComputer) {
            displayMessage('One Moment', `${players[i].getName()} is planning its attack.`);
            // await utils.delay(3000);
            let [x, y] = [utils.random(config.SIZE_X), utils.random(config.SIZE_Y)];
            allowAttack = true;
            handleAttack(i, x, y);
        } else {
            result = await playerTurn(i, players[i]);
            displayMessage(`${players[i].getName()}, ${statusToMessage(result)}!`, 'Get ready...');
        }
        await utils.delay(3000);
        if (result === config.ShipStatus.WIN) {
            winner = players[i];
            break;
        }
        i++;
        i %= 2;
    }
    displayMessage(`Congratulations, ${winner.getName()}!`, 'You won the game. Great job!');
    resetGrid(inputGrid, {
        handleClick: null,
        handleMouseEnter: null,
        handleMouseLeave: null
    }, (x, y) => winner.inspectBoard(x, y));
    resetGrid(historyGrid, {
        handleClick: null,
        handleMouseEnter: null,
        handleMouseLeave: null
    }, (x, y) => winner.inspectHistory(x, y));

    function statusToMessage(status: config.ShipStatus) {
        switch (status) {
            case config.ShipStatus.ALREADY_TAKEN:
                return "you've already attacked that coordinate";
            case config.ShipStatus.HIT:
                return "you hit the ship";
            case config.ShipStatus.MISS:
                return "you missed the ship";
            case config.ShipStatus.SUNK:
            case config.ShipStatus.WIN:
                return "you sunk the ship";
        }
    }

    function createSwatches() {
        let swatches = document.createElement('div');
        swatches.className = 'row w-100';
        swatches.appendChild(makeSwatch('square ship a-1', 'Your Ship'));
        swatches.appendChild(makeSwatch('square ghost a-1', 'Sunken'));
        swatches.appendChild(makeSwatch('square miss a-1', 'Miss'));
        swatches.appendChild(makeSwatch('square hit a-1', 'Hit'));
        setContentBox([swatches]);

        function makeSwatch(className: string, label: string) {
            let swatchRow = document.createElement('div');
            swatchRow.className = 'row align-items-center';
    
            let swatch = document.createElement('div');
            swatch.className = className;
            let p = document.createElement('p');
            p.innerText = label;
            p.className = 'ml-1';
            swatchRow.appendChild(swatch);
            swatchRow.appendChild(p);
            
            return swatchRow;
        }
    }

    function handleAttack(playerIndex: number, x: number, y: number, div?: HTMLDivElement) {
        if (!allowAttack) return;
        allowAttack = false;
        let player = players[playerIndex];
        let status: config.ShipStatus;
        if (player.inspectHistory(x, y)) {
            status = config.ShipStatus.ALREADY_TAKEN;
        } else {
            status = players[(playerIndex + 1) % 2].receiveAttack(x, y);
        }

        if (status === config.ShipStatus.SUNK) {
            player.recordAttack(x, y, config.ShipStatus.HIT);
        } else if (status !== config.ShipStatus.ALREADY_TAKEN) {
            player.recordAttack(x, y, status);
        }
        if (div) {
            div.className = 'square';
            let r = player.inspectHistory(x, y);
            if (r) {
                div.classList.add(r);
            }
        }
        return status;
    }

    async function playerTurn(i: number, player: Player) {
        allowAttack = true;
        return new Promise<config.ShipStatus>((resolve) => {
            resetGrid(inputGrid, {
                handleClick: null,
                handleMouseEnter: null,
                handleMouseLeave: null
            }, (x, y) => player.inspectBoard(x, y));
            resetGrid(historyGrid, {
                handleClick: (x, y, div) => {
                    resolve(handleAttack(i, x, y, div));
                },
                handleMouseEnter: null,
                handleMouseLeave: null
            }, (x, y) => player.inspectHistory(x, y));

            displayMessage(`${player.getName()}, attack!`, 'Click a square on the attack grid to attack your opponent.');
        });
    }
}

async function placementSequence() {
    await collectPlayerShips(players[0]);
    if (players[1].isComputer) {
        computerPlacement(players[1]);
    } else {
        await collectPlayerShips(players[1]);
    }

    function computerPlacement(player: Player) {
        let placedShips = 0,
            xDirection = true,
            shipSize = 4,
            placementEnabled = false;
        
        let count = 0;
        while (placedShips < config.NUM_SHIPS && count < 1000) {
            xDirection = utils.random(100) % 2 === 0;
            shipSize = utils.random(6, 3);
            let x: number, y: number;
            if (xDirection) {
                x = utils.random(config.SIZE_X - shipSize);
                y = utils.random(config.SIZE_Y);
            } else {
                x = utils.random(config.SIZE_X);
                y = utils.random(config.SIZE_Y - shipSize);
            }

            if (player.canPlace(x, y, shipSize, xDirection)) {
                player.place(x, y, shipSize, xDirection);
                if (xDirection) {
                    utils.boundedForEach(inputGrid[y], div => div.classList.add('ship'), x, x + shipSize);
                } else {
                    utils.boundedForEach(inputGrid, row => row[x].classList.add('ship'), y, y + shipSize);
                }
                placedShips++;
            }
            count++;
        }
    }
    function collectPlayerShips(player: Player) {
        let placedShips = 0,
            xDirection = true,
            shipSize = 4,
            placementEnabled = false;

        displayMessage(`${player.getName()}, place your ships.`, `You will place ${config.NUM_SHIPS} ships of various sizes on the grid. Move your mouse to position a ship, using the buttons below to customize the orientation and size. Click a grid square to place the ship.`);

        let p = document.createElement('p');
        let btn = document.createElement('button');
        btn.innerText = 'Rotate Ship';
        btn.addEventListener('click', () => changeDirection());
        p.appendChild(btn);
        let elements = [p];
    
        p = document.createElement('p');
        p.innerText = 'Change Size';
        for (let i = 3; i < 6; i++) {
            btn = document.createElement('button');
            btn.innerText = `${i}`;
            btn.addEventListener('click', () => changeSize(i));
            if (i === 3) {
                btn.className = 'ml-1';
            }
            p.appendChild(btn);
        }
        elements.push(p);
    
        setContentBox(elements);

        function changeDirection() {
            xDirection = !xDirection;
        }
        
        function changeSize(size: number) {
            shipSize = size;
        }

        return new Promise((resolve) => {
            resetGrid(inputGrid, {
                handleClick: (x, y) => placeShip(x, y),
                handleMouseEnter: (x, y) => drawGhost(x, y),
                handleMouseLeave: (x, y) => clearGhost(x, y)
            });
            function drawGhost(x: number, y: number) {
                placementEnabled = player.canPlace(x, y, shipSize, xDirection);
                if (!placementEnabled) return;
                if (xDirection) {
                    utils.boundedForEach(inputGrid[y], d => d.classList.add('ghost'), x, x + shipSize);
                } else {
                    utils.boundedForEach(inputGrid, r => r[x].classList.add('ghost'), y, y + shipSize);
                }
            }
            function clearGhost(x: number, y: number) {
                if (xDirection) {
                    utils.boundedForEach(inputGrid[y], d => d.classList.remove('ghost'), x, x + shipSize);
                } else {
                    utils.boundedForEach(inputGrid, r => r[x].classList.remove('ghost'), y, y + shipSize);
                }
            }
            
            function placeShip(x: number, y: number) {
                if (!placementEnabled) return;
                player.place(x, y, shipSize, xDirection);
                if (xDirection) {
                    utils.boundedForEach(inputGrid[y], div => div.classList.add('ship'), x, x + shipSize);
                } else {
                    utils.boundedForEach(inputGrid, row => row[x].classList.add('ship'), y, y + shipSize);
                }
                placedShips++;
                if (placedShips === config.NUM_SHIPS) {
                    resolve();
                }
            }
        });
    }
}

function displayMessage(heading: string, message = '') {
    headingBox.innerText = heading;
    detailBox.innerText = message;
}

function setContentBox(elements: HTMLElement[] = []) {
    utils.emptyElement(contentBox);
    elements.forEach(e => contentBox.appendChild(e));
}

function playerModeSequence(): Promise<string> {
    displayMessage('Welcome!', 'Choose whether you want to play against a human or the computer.');
    return new Promise((resolve) => {
        let btn = document.createElement('button');
        btn.innerText = 'Human';
        btn.dataset.mode = 'human';
        btn.addEventListener('click', handleClick);
        let elements = [btn];

        btn = document.createElement('button');
        btn.innerText = 'Computer';
        btn.dataset.mode = 'computer';
        btn.addEventListener('click', handleClick);
        elements.push(btn);

        setContentBox(elements);

        function handleClick(this: HTMLButtonElement, e: MouseEvent) {
            this.removeEventListener('click', handleClick);
            resolve(this.dataset.mode);
        }
    });
}

interface IEventHandlers {
    handleClick: ((x: number, y: number, div: HTMLDivElement) => void) | null,
    handleMouseEnter: ((x: number, y: number, div: HTMLDivElement) => void) | null,
    handleMouseLeave: ((x: number, y: number, div: HTMLDivElement) => void) | null
}

export { runGame }
