import { readFileSync, writeFileSync } from 'fs';

import merge from 'lodash/merge.js';

const filename = process.env.STOREFILE || 'store.json';
export const readDb = () => JSON.parse(readFileSync(filename));
export const writeDb = (data) =>
  writeFileSync(filename, JSON.stringify(merge(readDb(), data)));
