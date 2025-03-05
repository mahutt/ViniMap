import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';

describe('useBottomTabOverflow', () => {
  it('should return 0 for web and Android platforms', () => {
    const result = useBottomTabOverflow();

    expect(result).toBe(0);
  });

  it('should be defined as a function', () => {
    expect(useBottomTabOverflow).toBeDefined();
    expect(typeof useBottomTabOverflow).toBe('function');
  });

  it('should not require any parameters', () => {
    expect(useBottomTabOverflow.length).toBe(0);
  });
});
