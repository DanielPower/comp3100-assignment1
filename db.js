import { readFileSync, writeFileSync } from 'fs';
import merge from 'lodash/merge.js';

export const readDb = () => {
  return JSON.parse(readFileSync('store.json'));
};

export const writeDb = (data) => {
  writeFileSync('store.json', merge(readDb(), data));
};
