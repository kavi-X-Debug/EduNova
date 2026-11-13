import { describe, expect, it } from 'vitest';
import { crossedMilestone } from './milestone';

describe('crossedMilestone', () => {
  it('fires once when the star total passes a multiple of 10', () => {
    expect(crossedMilestone(8, 11)).toBe(10);
    expect(crossedMilestone(10, 12)).toBeUndefined();
    expect(crossedMilestone(19, 20)).toBe(20);
  });
  it('does nothing when the total did not grow', () => {
    expect(crossedMilestone(9, 9)).toBeUndefined();
    expect(crossedMilestone(12, 10)).toBeUndefined();
  });
});
