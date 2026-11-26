import { gamePath } from '@/paths';

describe('gamePath', () => {
  it('points to the root without an id', () => {
    expect(gamePath()).toBe('/');
  });

  it('points to the game with an id', () => {
    expect(gamePath('abc-123')).toBe('/abc-123');
  });
});
