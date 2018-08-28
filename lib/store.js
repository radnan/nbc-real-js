import {Props} from './props.js';

let storage = new Props({});

export const store = storage.proxy;
export const storeAttach = storage.attach.bind(storage);
