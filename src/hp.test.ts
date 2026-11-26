import { damagePlayer, findPlayer, getMaxHp, healPlayer, restorePlayer, setPlayerHp } from '@/hp';
import { makeDetails, makePlayer } from '@/testUtils';
import { PlayerType } from '@/types';

const setup = (): { details: ReturnType<typeof makeDetails>; id: string } => {
  const hero = makePlayer({ maxHp: 20, hp: 12 });
  const details = makeDetails({
    players: [hero],
    allies: [makePlayer({ type: PlayerType.Ally, maxHp: 5, hp: 5 })],
    enemies: [makePlayer({ type: PlayerType.Enemy, maxHp: 9, hp: 9 })],
  });
  return { details, id: hero.id };
};

describe('getMaxHp', () => {
  it('returns the base maximum', () => {
    expect(getMaxHp(makePlayer({ maxHp: 7 }))).toBe(7);
  });
});

describe('damagePlayer', () => {
  it('lowers hp by part of it', () => {
    const { details, id } = setup();
    expect(findPlayer(damagePlayer(details, id, 5), id)?.hp).toBe(7);
  });

  it('allows exact damage down to 0', () => {
    const { details, id } = setup();
    expect(findPlayer(damagePlayer(details, id, 12), id)?.hp).toBe(0);
  });

  it('never goes below 0', () => {
    const { details, id } = setup();
    expect(findPlayer(damagePlayer(details, id, 99), id)?.hp).toBe(0);
  });

  it('works on allies and enemies', () => {
    const { details } = setup();
    const enemyId = details.enemies[0].id;
    expect(damagePlayer(details, enemyId, 4).enemies[0].hp).toBe(5);
  });

  it('returns the same details for an unknown id', () => {
    const { details } = setup();
    expect(damagePlayer(details, 'nope', 3)).toBe(details);
  });

  it('does not mutate the input', () => {
    const { details, id } = setup();
    const snapshot = structuredClone(details);
    damagePlayer(details, id, 3);
    expect(details).toEqual(snapshot);
  });
});

describe('healPlayer', () => {
  it('raises hp by part of the missing amount', () => {
    const { details, id } = setup();
    expect(findPlayer(healPlayer(details, id, 3), id)?.hp).toBe(15);
  });

  it('is capped at the maximum', () => {
    const { details, id } = setup();
    expect(findPlayer(healPlayer(details, id, 99), id)?.hp).toBe(20);
  });

  it('works from 0 HP', () => {
    const { details, id } = setup();
    const down = damagePlayer(details, id, 99);
    expect(findPlayer(healPlayer(down, id, 4), id)?.hp).toBe(4);
  });

  it('returns the same details for an unknown id', () => {
    const { details } = setup();
    expect(healPlayer(details, 'nope', 3)).toBe(details);
  });
});

describe('restorePlayer', () => {
  it('sets hp to the maximum', () => {
    const { details, id } = setup();
    expect(findPlayer(restorePlayer(details, id), id)?.hp).toBe(20);
  });

  it('returns the same details for an unknown id', () => {
    const { details } = setup();
    expect(restorePlayer(details, 'nope')).toBe(details);
  });

  it('does not mutate the input', () => {
    const { details, id } = setup();
    const snapshot = structuredClone(details);
    restorePlayer(details, id);
    expect(details).toEqual(snapshot);
  });
});

describe('setPlayerHp', () => {
  const player = makePlayer({ maxHp: 10, hp: 10 });

  it('sets both values', () => {
    expect(setPlayerHp(player, { maxHp: 30, hp: 12 })).toMatchObject({ maxHp: 30, hp: 12 });
  });

  it('caps hp at the new maximum', () => {
    expect(setPlayerHp(player, { maxHp: 5, hp: 9 })).toMatchObject({ maxHp: 5, hp: 5 });
  });

  it('raises an invalid maximum to 1', () => {
    expect(setPlayerHp(player, { maxHp: 0, hp: 0 })).toMatchObject({ maxHp: 1, hp: 0 });
    expect(setPlayerHp(player, { maxHp: 2.5, hp: 1 })).toMatchObject({ maxHp: 1, hp: 1 });
  });

  it('floors negative hp at 0 and refills a decimal hp', () => {
    expect(setPlayerHp(player, { maxHp: 10, hp: -3 }).hp).toBe(0);
    expect(setPlayerHp(player, { maxHp: 10, hp: 1.5 }).hp).toBe(10);
  });

  it('does not mutate the input', () => {
    setPlayerHp(player, { maxHp: 3, hp: 1 });
    expect(player).toMatchObject({ maxHp: 10, hp: 10 });
  });
});
