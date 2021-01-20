import fs from 'fs';
import merge from 'lodash/merge.js';

const { readFile, writeFile } = fs.promises;

const defaultCache = {
  books: {},
  loans: {},
};

class Database {
  // Hashtag indicates that these are private members, and cannot be accessed externally
  #storeFile = null;
  #cache = null;

  constructor(storeFile) {
    if (storeFile) {
      this.#storeFile = storeFile;
      readFile(storeFile)
        .then((data) => {
          try {
            // Try to load cache from the store file
            this.#cache = JSON.parse(data);
          } catch (error) {
            console.error(
              'Store file appears to be corrupt. Backing up and creating empty store.'
            );
            fs.rename(storeFile, `${storeFile}.corruptbak`, () => {});
            this.#cache = defaultCache;
          }
        })
        .catch((error) => {
          if (error) {
            if (error.code === 'ENOENT') {
              // File wasn't found. We'll use default data, and creat the file when we write
              this.#cache = defaultCache;
              this.writeStore();
              return;
            } else {
              // Some unhandled exception occurred
              console.trace(error);
              process.exit(1);
            }
          }
        });
    } else {
      this.#cache = defaultCache;
    }
  }

  getCache() {
    // Immutable copy of cache
    return Object.freeze(this.#cache);
  }

  writeCache(cache) {
    // Update cache with new data
    this.#cache = merge(this.#cache, cache);
    this.writeStore();
  }

  writeStore() {
    // Update the store file
    if (this.#storeFile) {
      writeFile(this.#storeFile, JSON.stringify(this.#cache));
    }
  }
}

export default Database;
