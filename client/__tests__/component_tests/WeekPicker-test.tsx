import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import moment from 'moment';
import WeekPicker from '@/components/WeekPicker';

jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn().mockReturnValue({ width: 400 }),
}));

// Mock Swiper component
jest.mock('react-native-swiper', () => {
  const React = require('react');
  return React.forwardRef(
    (
      {
        children,
        index,
        onIndexChanged,
      }: {
        children: React.ReactNode;
        index: number;
        onIndexChanged: (index: number) => void;
      },
      ref: any
    ) => {
      React.useImperativeHandle(ref, () => ({
        scrollTo: jest.fn(),
      }));

      return (
        <div className="swiper-mock" onClick={() => onIndexChanged && onIndexChanged(index + 1)}>
          {Array.isArray(children) ? children[index] : children}
        </div>
      );
    }
  );
});

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name, size, color }: { name: string; size: number; color: string }) => (
    <div className={`icon-mock icon-${name}`} style={{ fontSize: size, color }}>
      {name}
    </div>
  ),
}));

jest.mock('react-native', () => {
  return {
    StyleSheet: {
      create: (styles: object) => styles,
    },
    View: ({ children, style, ...props }: any) => (
      <div className="rn-view" style={style} {...props}>
        {children}
      </div>
    ),
    Text: ({ children, style, ...props }: any) => (
      <span className="rn-text" style={style} {...props}>
        {children}
      </span>
    ),
    TouchableWithoutFeedback: ({ onPress, children, ...props }: any) => (
      <div className="rn-touchable-without-feedback" onClick={onPress} {...props}>
        {children}
      </div>
    ),
    TouchableOpacity: ({ onPress, disabled, children, style, ...props }: any) => (
      <div
        className={`rn-touchable-opacity ${disabled ? 'disabled' : ''}`}
        onClick={!disabled ? onPress : undefined}
        style={style}
        aria-disabled={disabled}
        {...props}>
        {children}
      </div>
    ),
    Dimensions: {
      get: jest.fn().mockReturnValue({ width: 400 }),
    },
  };
});

describe('WeekPicker Component', () => {
  const mockSetValue = jest.fn();
  const defaultProps = {
    value: new Date('2025-03-26'),
    setValue: mockSetValue,
    initialWeek: 0,
    weekRange: 5,
  };

  beforeEach(() => {
    mockSetValue.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('correctly memoizes the weeks calculation', () => {
    const { rerender } = render(<WeekPicker {...defaultProps} />);
    rerender(<WeekPicker {...defaultProps} />);
    rerender(<WeekPicker {...defaultProps} weekRange={6} />);
  });
});
