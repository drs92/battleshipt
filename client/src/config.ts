const SIZE_X = 15;
const SIZE_Y = 15;
const NUM_SHIPS = 5;

enum ShipStatus {
    HIT = 1,
    MISS,
    ALREADY_TAKEN,
    SUNK,
    WIN
}

export {
    SIZE_X,
    SIZE_Y,
    NUM_SHIPS,
    ShipStatus
}