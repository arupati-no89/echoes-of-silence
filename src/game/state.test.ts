import { describe, it, expect } from 'vitest';
import { createInitialState } from './state';
import { scenarios } from './scenarios';

describe('createInitialState', () => {
  it('returns intro phase with empty evidence', () => {
    const state = createInitialState('vampire');
    expect(state.phase).toBe('intro');
    expect(state.unlockedEvidence).toEqual([]);
  });

  it('seeds trustLevels with one entry per character at 0', () => {
    const state = createInitialState('vampire');
    const characters = scenarios.vampire.characters;
    expect(Object.keys(state.trustLevels)).toHaveLength(characters.length);
    for (const c of characters) {
      expect(state.trustLevels[c.id]).toBe(0);
    }
  });

  it('falls back to the vampire scenario for unknown ids', () => {
    const state = createInitialState('does-not-exist');
    expect(state.dialogHistory[0].content).toBe(scenarios.vampire.intro);
  });

  it('records the intro line as the GM speaker', () => {
    const state = createInitialState('vampire');
    expect(state.dialogHistory).toHaveLength(1);
    expect(state.dialogHistory[0].role).toBe('gm');
    expect(state.dialogHistory[0].speaker).toBe('GM');
  });

  it('starts with no choices made', () => {
    const state = createInitialState('vampire');
    expect(state.choices.oxygenFixed).toBeNull();
    expect(state.choices.boxDecision).toBeNull();
  });
});
