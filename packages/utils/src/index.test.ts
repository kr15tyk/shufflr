import {
  truncate,
  toKebabCase,
  formatDuration,
  clamp,
  shuffle,
  isValidEmail,
  isDefined,
} from './index';

describe('truncate', () => {
  it('returns string unchanged when within maxLength', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  it('truncates and appends ellipsis when too long', () => {
    expect(truncate('hello world', 8)).toBe('hello...');
  });

  it('slices without ellipsis when maxLength <= 3', () => {
    expect(truncate('hello', 2)).toBe('he');
    expect(truncate('hello', 3)).toBe('hel');
  });
});

describe('toKebabCase', () => {
  it('converts camelCase to kebab-case', () => {
    expect(toKebabCase('myVariableName')).toBe('my-variable-name');
  });

  it('converts spaces to hyphens', () => {
    expect(toKebabCase('hello world')).toBe('hello-world');
  });
});

describe('formatDuration', () => {
  it('formats milliseconds to m:ss', () => {
    expect(formatDuration(225000)).toBe('3:45');
  });

  it('pads seconds with leading zero', () => {
    expect(formatDuration(65000)).toBe('1:05');
  });
});

describe('clamp', () => {
  it('clamps below min', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('clamps above max', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('keeps value within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
});

describe('shuffle', () => {
  it('returns array with same elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffle(arr);
    expect(shuffled).toHaveLength(arr.length);
    expect(shuffled.sort()).toEqual([...arr].sort());
  });

  it('does not mutate the original array', () => {
    const arr = [1, 2, 3];
    shuffle(arr);
    expect(arr).toEqual([1, 2, 3]);
  });
});

describe('isValidEmail', () => {
  it('accepts valid email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
  });
});

describe('isDefined', () => {
  it('returns true for non-null values', () => {
    expect(isDefined('hello')).toBe(true);
    expect(isDefined(0)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isDefined(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isDefined(undefined)).toBe(false);
  });
});
