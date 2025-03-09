import LocalLocations from '@/services/LocalLocations';
import { Location } from '@/modules/map/Types';

// Mock the Location type for testing
const mockLocation: Location = {
  name: 'Test Location',
  coordinates: [0, 0],
};

describe('TrieNode', () => {
  test('constructor initializes with default values', () => {
    const trie = LocalLocations.getInstance().trie;
    const node = trie.root;

    expect(node.children).toEqual({});
    expect(node.isEndOfWord).toBe(false);
    expect(node.getLocation).toBeUndefined();
  });
});

describe('Trie', () => {
  beforeEach(() => {
    LocalLocations.getInstance().clear();
  });
  test('constructor initializes with root node', () => {
    const trie = LocalLocations.getInstance().trie;

    expect(trie.root).toBeDefined();
    expect(trie.root.children).toEqual({});
    expect(trie.root.isEndOfWord).toBe(false);
  });

  test('insert adds a word to the trie', () => {
    const trie = LocalLocations.getInstance().trie;
    const getLocation = (name: string): Location => ({ ...mockLocation, name });

    trie.insert('A123', getLocation);

    expect(trie.root.children['A']).toBeDefined();
    expect(trie.root.children['A'].children['1']).toBeDefined();
    expect(trie.root.children['A'].children['1'].children['2']).toBeDefined();
    expect(trie.root.children['A'].children['1'].children['2'].children['3']).toBeDefined();
    expect(trie.root.children['A'].children['1'].children['2'].children['3'].isEndOfWord).toBe(
      true
    );
    expect(trie.root.children['A'].children['1'].children['2'].children['3'].getLocation).toBe(
      getLocation
    );
  });

  test('buildFromArray inserts multiple words', () => {
    const trie = LocalLocations.getInstance().trie;
    const getLocation = (name: string): Location => ({ ...mockLocation, name });

    trie.buildFromArray(['A123', 'B456'], getLocation);

    expect(trie.root.children['A']).toBeDefined();
    expect(trie.root.children['B']).toBeDefined();
    expect(trie.root.children['A'].children['1'].children['2'].children['3'].isEndOfWord).toBe(
      true
    );
    expect(trie.root.children['B'].children['4'].children['5'].children['6'].isEndOfWord).toBe(
      true
    );
  });

  test('search returns matching locations', () => {
    const trie = LocalLocations.getInstance().trie;
    const getLocation = (name: string): Location => ({ ...mockLocation, name });

    trie.insert('A123', getLocation);
    trie.insert('A124', getLocation);

    const results = trie.search('A12');

    expect(results).toHaveLength(2);
    expect(results[0].name).toBe('A123');
    expect(results[1].name).toBe('A124');
  });

  test('search returns empty array for non-existent prefix', () => {
    const trie = LocalLocations.getInstance().trie;
    const getLocation = (name: string): Location => ({ ...mockLocation, name });

    trie.insert('A123', getLocation);

    const results = trie.search('B');

    expect(results).toEqual([]);
  });

  test('_collectWords gathers all words with the given prefix', () => {
    const trie = LocalLocations.getInstance().trie;
    const getLocation = (name: string): Location => ({ ...mockLocation, name });

    trie.insert('A123', getLocation);
    trie.insert('A124', getLocation);

    const results: Location[] = [];
    trie._collectWords(trie.root.children['A'], 'A', results);

    expect(results).toHaveLength(2);
    expect(results[0].name).toBe('A123');
    expect(results[1].name).toBe('A124');
  });
});

describe('LocalLocations', () => {
  beforeEach(() => {
    LocalLocations.getInstance().clear();
  });

  test('getInstance returns a singleton instance', () => {
    const instance1 = LocalLocations.getInstance();
    const instance2 = LocalLocations.getInstance();

    expect(instance1).toBe(instance2);
  });

  test('constructor initializes with empty trie', () => {
    const localLocations = new LocalLocations();

    expect(localLocations.trie).toBeDefined();
    expect(localLocations.trie.root.children).toEqual({});
  });

  test('add inserts a location into the trie', () => {
    const localLocations = LocalLocations.getInstance();
    const getLocation = (name: string): Location => ({ ...mockLocation, name });

    localLocations.add('A123', getLocation);

    const results = localLocations.autocomplete('A');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('A123');
  });

  test('addAll inserts multiple locations', () => {
    const localLocations = LocalLocations.getInstance();
    const getLocation = (name: string): Location => ({ ...mockLocation, name });

    localLocations.addAll(['B123', 'B456'], getLocation);

    const results = localLocations.autocomplete('B');
    expect(results).toHaveLength(2);
    expect(results.map((loc) => loc.name)).toContain('B123');
    expect(results.map((loc) => loc.name)).toContain('B456');
  });

  test('autocomplete returns matching locations', () => {
    const localLocations = LocalLocations.getInstance();
    const getLocation = (name: string): Location => ({ ...mockLocation, name });

    localLocations.add('C123', getLocation);
    localLocations.add('C124', getLocation);

    const results = localLocations.autocomplete('C12');

    expect(results).toHaveLength(2);
    expect(results.map((loc) => loc.name)).toContain('C123');
    expect(results.map((loc) => loc.name)).toContain('C124');
  });
});
