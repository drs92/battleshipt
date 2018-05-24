import * as config from './config';

export function boundedMap<T,R>(collection: T[], predicate: (value: T, index: number, collection: T[]) => R, startIndex: number, endIndex?: number): R[] {
    let len = collection.length;
    if (endIndex && endIndex < len) {
        len = endIndex;
    }
    let result: R[] = [];
    for (let i = startIndex; i < len; i++) {
        result.push(predicate(collection[i], i, collection));
    }
    return result;
}

export function boundedSome<T>(collection: T[], predicate: (value: T, index: number, collection: T[]) => boolean, startIndex: number, endIndex?: number): boolean {
    let len = collection.length;
    if (endIndex && endIndex < len) {
        len = endIndex;
    }
    let result = false;
    for (let i = startIndex; i < len; i++) {
        if (predicate(collection[i], i, collection)) {
            return true;
        }
    }
    return result;
}

export function boundedEvery<T>(collection: T[], predicate: (value: T, index: number, collection: T[]) => boolean, startIndex: number, endIndex?: number): boolean {
    let len = collection.length;
    if (endIndex && endIndex < len) {
        len = endIndex;
    }
    let result = true;
    for (let i = startIndex; i < len; i++) {
        if (!predicate(collection[i], i, collection)) {
            return false;
        }
    }
    return result;
}

export function boundedForEach<T>(collection: T[], predicate: (value: T, index: number, collection: T[]) => void, startIndex: number, endIndex?: number): void {
    let len = collection.length;
    if (endIndex && endIndex < len) {
        len = endIndex;
    }
    for (let i = startIndex; i < len; i++) {
        predicate(collection[i], i, collection);
    }
}

export function emptyElement(el: HTMLElement) {
    while (el.hasChildNodes()) {
        el.removeChild(el.lastChild);
    }
}

export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function random(upper: number, lower = 0) {
    return Math.floor(Math.random() * (upper - lower)) + lower;
}