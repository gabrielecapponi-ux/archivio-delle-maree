import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, act, restoreGame, inventory, progress, objective, hintsFor } from '../src/game.js';

const itemIds = state => inventory(state).map(item => item.id);
const solutions = { safeDials: [3, 1, 4], mirrors: [3, 1, 2], rings: [4, 3, 1] };

function play() {
  let state = newGame();
  const snapshots = [structuredClone(state)];
  return {
    get state() { return state; },
    snapshots,
    do(type, payload) {
      const before = structuredClone(state);
      const result = act(state, type, payload);
      assert.deepEqual(state, before, `L’azione ${type} non deve mutare lo stato ricevuto`);
      state = result.state;
      snapshots.push(structuredClone(state));
      return result;
    },
    setDials(group, values = solutions[group]) {
      for (const [index, value] of values.entries()) {
        for (let step = 0; step < value; step++) {
          assert.equal(this.do('dial', { group, index }).success, true);
        }
      }
    },
  };
}

function reach(stage) {
  const game = play();
  game.do('start');
  if (stage === 'start') return game;
  game.do('letter');
  if (stage === 'letter') return game;
  game.do('key');
  if (stage === 'key') return game;
  game.setDials('safeDials'); game.do('safe');
  if (stage === 'safe') return game;
  game.setDials('mirrors'); game.do('projection');
  if (stage === 'projection') return game;
  game.setDials('rings'); game.do('astrolabe');
  if (stage === 'astrolabe') return game;
  game.do('door');
  return game;
}

test('una nuova partita non eredita oggetti, avanzamento o array da altre partite', () => {
  const first = newGame(); const second = newGame();
  assert.equal(progress(first), 0);
  assert.deepEqual(itemIds(first), []);
  first.safeDials[0] = 4;
  assert.deepEqual(second.safeDials, [0, 0, 0]);
  assert.match(objective(second), /lettera/i);
});

test('le soluzioni già impostate non permettono di saltare i prerequisiti', () => {
  const locked = { ...newGame(), safeDials: [3, 1, 4], mirrors: [3, 1, 2], rings: [4, 3, 1] };
  for (const type of ['key', 'safe', 'projection', 'astrolabe', 'door', 'lens']) {
    const result = act(locked, type);
    assert.equal(result.success, false, type);
    assert.deepEqual(result.state, locked, type);
    assert.deepEqual(itemIds(result.state), []);
  }
  for (const group of ['safeDials', 'mirrors', 'rings']) {
    assert.deepEqual(act(locked, 'dial', { group, index: 0 }).state, locked);
  }
  const beforeLetter = reach('start');
  assert.equal(beforeLetter.do('key').success, false);
  const beforeLens = reach('letter');
  assert.equal(beforeLens.do('lens').success, false);
});

test('la sequenza completa assegna e consuma gli oggetti corretti e termina il capitolo', () => {
  const game = play();
  assert.equal(game.do('start').success, true);
  assert.equal(game.state.started, true);
  game.do('letter');
  assert.deepEqual(itemIds(game.state), ['key']);
  assert.equal(progress(game.state), 1);
  game.do('key');
  assert.deepEqual(itemIds(game.state), []);
  game.setDials('safeDials');
  assert.equal(game.do('safe').success, true);
  assert.deepEqual(itemIds(game.state), ['lens']);
  assert.equal(progress(game.state), 2);
  assert.equal(game.do('lens').success, true);
  assert.equal(game.state.lensOn, true);
  game.setDials('mirrors');
  assert.equal(game.do('projection').success, true);
  assert.deepEqual(itemIds(game.state), ['lens', 'chart']);
  assert.equal(progress(game.state), 3);
  game.setDials('rings');
  assert.equal(game.do('astrolabe').success, true);
  assert.deepEqual(itemIds(game.state), ['lens', 'chart', 'seal']);
  assert.equal(progress(game.state), 4);
  assert.equal(game.do('door').success, true);
  assert.equal(progress(game.state), 5);
  assert.equal(game.state.door, true);
  assert.equal(game.state.lensOn, false);
  assert.deepEqual(itemIds(game.state), ['lens', 'chart']);
  assert.match(objective(game.state), /aperto/i);
});

test('i tentativi errati non assegnano premi, non consumano oggetti e spiegano il fallimento', () => {
  for (const [stage, action] of [['key', 'safe'], ['safe', 'projection'], ['projection', 'astrolabe']]) {
    const game = reach(stage);
    const before = structuredClone(game.state);
    const result = game.do(action);
    assert.equal(result.success, false, action);
    assert.notEqual(result.message.trim(), '', action);
    assert.deepEqual(game.state, before, action);
    assert.deepEqual(itemIds(game.state), itemIds(before), action);
  }
});

test('gli oggetti già raccolti e gli enigmi risolti non vengono premiati due volte', () => {
  const game = reach('door');
  const completed = structuredClone(game.state);
  for (const action of ['letter', 'key', 'safe', 'projection', 'astrolabe', 'door']) {
    assert.equal(game.do(action).success, false, action);
    assert.deepEqual(game.state, completed, action);
  }
  for (const group of ['safeDials', 'mirrors', 'rings']) {
    assert.equal(game.do('dial', { group, index: 1 }).success, false);
    assert.deepEqual(game.state, completed);
  }
});

test('i quadranti girano in entrambi i versi e non superano i rispettivi limiti', () => {
  for (const [stage, group, max] of [['key', 'safeDials', 5], ['safe', 'mirrors', 3], ['projection', 'rings', 5]]) {
    const game = reach(stage);
    game.do('dial', { group, index: 0, delta: -1 });
    assert.equal(game.state[group][0], max, group);
    game.do('dial', { group, index: 0, delta: 1 });
    assert.equal(game.state[group][0], 0, group);
    assert.deepEqual(game.state[group].slice(1), [0, 0]);
  }
});

test('comandi sconosciuti e input non validi non modificano la partita', () => {
  const game = reach('key');
  const before = structuredClone(game.state);
  for (const payload of [undefined, null, {}, { group: 'missing', index: 0 }, { group: 'safeDials', index: -1 }, { group: 'safeDials', index: 3 }, { group: 'safeDials', index: 0.5 }, { group: 'safeDials', index: '0' }, { group: 'safeDials', index: 0, delta: 0 }, { group: 'safeDials', index: 0, delta: 100 }, { group: 'safeDials', index: 0, delta: '1' }]) {
    assert.equal(game.do('dial', payload).success, false);
    assert.deepEqual(game.state, before);
  }
  assert.equal(game.do('unknown').success, false);
  assert.deepEqual(game.state, before);
});

test('salvataggio e ripristino conservano ogni passaggio del percorso e gli enigmi parziali', () => {
  const game = reach('door');
  for (const snapshot of game.snapshots) {
    const restored = restoreGame(JSON.stringify(snapshot));
    assert.deepEqual(restored, snapshot);
    assert.deepEqual(itemIds(restored), itemIds(snapshot));
    assert.equal(progress(restored), progress(snapshot));
    assert.equal(objective(restored), objective(snapshot));
    assert.notStrictEqual(restored.safeDials, snapshot.safeDials);
  }
  const partial = reach('safe');
  partial.do('lens'); partial.do('hint'); partial.do('hint');
  partial.do('dial', { group: 'mirrors', index: 2 });
  assert.deepEqual(restoreGame(JSON.stringify(partial.state)), partial.state);
});

test('salvataggi assenti, JSON corrotto e versioni non supportate avviano una partita pulita', () => {
  for (const raw of [null, undefined, '', '{', 'null', '[]', 'true', '42', '"test"', '{}', '{"version":2}', '{"version":"1"}']) {
    assert.deepEqual(restoreGame(raw), newGame(), String(raw));
  }
});

test('il ripristino scarta campi malformati e limita il contatore degli indizi', () => {
  const broken = { version: 1, started: 'true', letter: 1, keyUsed: [], safe: {}, projection: 'yes', astrolabe: 1, door: 'false', lensOn: 'true', safeDials: [1, 2, 6], mirrors: [0, -1, 2], rings: [1, 2.5, 3], hints: 2.5, arbitrary: 'ignored' };
  assert.deepEqual(restoreGame(JSON.stringify(broken)), newGame());
  for (const badArray of [null, {}, '123', [0, 1], [0, 1, 2, 3], ['0', 1, 2]]) {
    const restored = restoreGame(JSON.stringify({ ...newGame(), safeDials: badArray, mirrors: badArray, rings: badArray }));
    assert.deepEqual(restored.safeDials, [0, 0, 0]);
    assert.deepEqual(restored.mirrors, [0, 0, 0]);
    assert.deepEqual(restored.rings, [0, 0, 0]);
  }
  assert.equal(restoreGame(JSON.stringify({ ...newGame(), hints: -100 })).hints, 0);
  assert.equal(restoreGame(JSON.stringify({ ...newGame(), hints: 5000 })).hints, 999);
});

test('il ripristino elimina gli avanzamenti impossibili dopo un prerequisito mancante', () => {
  const chain = ['letter', 'keyUsed', 'safe', 'projection', 'astrolabe', 'door'];
  const complete = reach('door').state;
  for (let missing = 0; missing < chain.length; missing++) {
    const raw = { ...complete, [chain[missing]]: false, lensOn: true };
    const restored = restoreGame(JSON.stringify(raw));
    for (let i = 0; i < chain.length; i++) assert.equal(restored[chain[i]], i < missing, `${chain[missing]} mancante: ${chain[i]}`);
    assert.equal(restored.lensOn, missing > 2);
  }
});

test('ogni fase incompleta ha un obiettivo e almeno un suggerimento utilizzabile', () => {
  const stages = ['start', 'letter', 'key', 'safe', 'projection', 'astrolabe'];
  for (const stage of stages) {
    const game = reach(stage);
    assert.ok(objective(game.state).length > 10);
    assert.ok(hintsFor(game.state).length >= 1);
    assert.ok(hintsFor(game.state).every(hint => typeof hint === 'string' && hint.length > 10));
    const before = progress(game.state);
    game.do('hint');
    assert.equal(game.state.hints, 1);
    assert.equal(progress(game.state), before);
  }
});
