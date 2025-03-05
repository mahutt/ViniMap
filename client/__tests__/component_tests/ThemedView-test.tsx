import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

// Mock the useThemeColor hook
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: jest.fn(),
}));

describe('ThemedView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useThemeColor as jest.Mock).mockReturnValue('#testColor');
  });

  it('renders correctly with default props', () => {
    const { getByTestId } = render(<ThemedView testID="themed-view" />);

    const view = getByTestId('themed-view');
    expect(view).toBeTruthy();
    expect(view.props.style).toContainEqual({ backgroundColor: '#testColor' });
  });

  it('passes style prop correctly', () => {
    const customStyle = { margin: 10, padding: 20 };
    const { getByTestId } = render(<ThemedView testID="themed-view" style={customStyle} />);

    const view = getByTestId('themed-view');
    expect(view.props.style).toContainEqual(customStyle);
    expect(view.props.style).toContainEqual({ backgroundColor: '#testColor' });
  });

  it('passes other props to View component', () => {
    const { getByTestId } = render(
      <ThemedView testID="themed-view" accessibilityLabel="Test Label" />
    );

    const view = getByTestId('themed-view');
    expect(view.props.accessibilityLabel).toBe('Test Label');
  });

  it('calls useThemeColor with correct light and dark colors', () => {
    render(<ThemedView lightColor="#lightTest" darkColor="#darkTest" />);

    expect(useThemeColor).toHaveBeenCalledWith(
      { light: '#lightTest', dark: '#darkTest' },
      'background'
    );
  });

  it('sets background color from useThemeColor hook result', () => {
    (useThemeColor as jest.Mock).mockReturnValue('#customBackground');

    const { getByTestId } = render(<ThemedView testID="themed-view" />);

    const view = getByTestId('themed-view');
    expect(view.props.style).toContainEqual({ backgroundColor: '#customBackground' });
  });
});
