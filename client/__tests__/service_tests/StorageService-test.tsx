import { storage } from '@/services/StorageService';

// Mock the entire react-native-mmkv module
jest.mock('react-native-mmkv', () => {
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      getString: jest.fn(),
      getBoolean: jest.fn(),
      getNumber: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      clearAll: jest.fn(),
      contains: jest.fn(),
      getAllKeys: jest.fn(),
    })),
  };
});

describe('Storage Service', () => {
  it('should export a valid storage instance', () => {
    expect(storage).toBeDefined();
  });

  it('should have required MMKV methods', () => {
    // Test for presence of key methods
    expect(storage.getString).toBeDefined();
    expect(storage.getBoolean).toBeDefined();
    expect(storage.getNumber).toBeDefined();
    expect(storage.set).toBeDefined();
    expect(storage.delete).toBeDefined();
    expect(storage.clearAll).toBeDefined();
    expect(storage.contains).toBeDefined();
    expect(storage.getAllKeys).toBeDefined();
  });
});
