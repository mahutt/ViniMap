import { Location } from '@/modules/map/Types';

/**
 * TrieNode class
 * @class
 * @classdesc TrieNode class for Trie data structure
 * @property {Object} children - Children of the node
 * @property {boolean} isEndOfWord - Flag to indicate end of word
 * @property {Function} getLocation - Function to get location for this node
 */
class TrieNode {
  children: { [key: string]: TrieNode } = {};
  isEndOfWord = false;
  getLocation?: (name: string) => Location;

  constructor(getLocation?: (name: string) => Location) {
    this.children = {};
    this.isEndOfWord = false;
    this.getLocation = getLocation;
  }
}

/**
 * Trie class
 * @class
 * @classdesc Trie class for Trie data structure
 * @property {TrieNode} root - Root node of the trie
 */
class Trie {
  root: TrieNode;
  constructor() {
    this.root = new TrieNode();
  }

  insert(roomNumber: string, getLocation: (name: string) => Location) {
    let current = this.root;

    for (const char of roomNumber) {
      if (!current.children[char]) {
        current.children[char] = new TrieNode();
      }
      current = current.children[char];
    }

    current.isEndOfWord = true;
    current.getLocation = getLocation;
  }

  buildFromArray(roomArray: string[], getLocation: (name: string) => Location) {
    for (const room of roomArray) {
      this.insert(room, getLocation);
    }
  }

  search(prefix: string) {
    let current = this.root;

    for (const char of prefix) {
      if (!current.children[char]) {
        return [];
      }
      current = current.children[char];
    }

    const results: Location[] = [];
    this._collectWords(current, prefix, results);
    return results;
  }

  _collectWords(node: TrieNode, prefix: string, results: Location[]) {
    if (node.isEndOfWord && node.getLocation) {
      results.push(node.getLocation(prefix));
    }

    for (const char in node.children) {
      this._collectWords(node.children[char], prefix + char, results);
    }
  }
}

/**
 * LocalLocations class
 * @class
 * @classdesc LocalLocations class for storing
 * local locations (such as indoor rooms, indoor POIs, and custom outdoor POIs)
 * and providing search-based autocomplete functionality
 * @property {Trie} trie - Trie data structure to store locations
 */
class LocalLocations {
  static #instance: LocalLocations;
  static getInstance() {
    if (!LocalLocations.#instance) {
      LocalLocations.#instance = new LocalLocations();
    }
    return LocalLocations.#instance;
  }

  trie: Trie;

  constructor() {
    this.trie = new Trie();
  }

  add(name: string, getLocation: (name: string) => Location) {
    this.trie.insert(name, getLocation);
  }

  addAll(names: string[], getLocation: (name: string) => Location) {
    for (const name of names) {
      this.add(name, getLocation);
    }
  }

  autocomplete(prefix: string) {
    return this.trie.search(prefix);
  }

  clear() {
    this.trie = new Trie();
  }
}

export default LocalLocations;
