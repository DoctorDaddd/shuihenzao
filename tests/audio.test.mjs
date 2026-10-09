import test from 'node:test';
import assert from 'node:assert/strict';
import { musicScene, createScore, THEMES, effectScore } from '../lib/adventure-score.ts';
import { AdventureAudio } from '../lib/adventure-audio.ts';

test('每章第4格才转为激昂，浏览未来地图和管理员回退独立计算', () => {
  for (let chapter = 0; chapter < 5; chapter++) {
    for (let local = 0; local <= 5; local++) assert.deepEqual(musicScene(chapter, chapter * 5 + local), { chapter, intense: local >= 4 });
    assert.equal(musicScene(chapter, 0).intense, false);
    assert.equal(musicScene(chapter, 25).intense, true);
  }
  assert.equal(musicScene(3, 19).intense, true);
  assert.equal(musicScene(3, 18).intense, false);
});

test('五套独立旋律均含完整循环，激昂版本加速并增加鼓组', () => {
  const melodies = new Set();
  for (let chapter = 0; chapter < 5; chapter++) {
    const calm = createScore({ chapter, intense: false }), intense = createScore({ chapter, intense: true });
    melodies.add(JSON.stringify(THEMES[chapter].melody));
    assert(intense.bpm > calm.bpm + 30);
    assert(intense.notes.length > calm.notes.length);
    assert(intense.notes.some(n => n.voice === 'snare'));
    for (const score of [calm, intense]) {
      assert.equal(score.beats, 64);
      assert.equal(score.notes[0].beat, 0);
      assert(score.notes.at(-1).beat >= 63);
      for (const note of score.notes) {
        assert(note.beat >= 0 && note.beat < score.beats && Number.isFinite(note.pitch));
        assert(note.duration > 0 && note.volume > 0 && note.volume <= .25);
        assert(note.pan >= -1 && note.pan <= 1);
      }
    }
  }
  assert.equal(melodies.size, 5);
  assert.equal(new Set(['select', 'save', 'chest', 'letter', 'victory'].map(e => JSON.stringify(effectScore(e)))).size, 5);
});

// A controllable Web Audio boundary checks lifecycle and scheduling, not sound quality.
class Param {
  value = 0;
  events = [];
  setValueAtTime(value, time) { this.value = value; this.events.push({ value, time }); }
  linearRampToValueAtTime(value, time) { this.events.push({ value, time }); }
  exponentialRampToValueAtTime(value, time) { this.events.push({ value, time }); }
  setTargetAtTime(value, time) { this.value = value; this.events.push({ value, time }); }
  cancelScheduledValues(time) { this.events = this.events.filter(event => event.time < time); }
}
class Node extends EventTarget {
  gain = new Param(); pan = new Param(); frequency = new Param(); Q = new Param();
  threshold = new Param(); knee = new Param(); ratio = new Param();
  started = false; disconnected = false; stopTime = null;
  connect() {}
  disconnect() { this.disconnected = true; }
  start(time) { assert(Number.isFinite(time) && time >= 0); this.started = true; }
  stop(time = 0) { this.stopTime = time; if (time === 0) this.dispatchEvent(new Event('ended')); }
}
class Context extends EventTarget {
  state = 'suspended'; currentTime = 0; sampleRate = 8000; destination = new Node(); sources = []; gains = [];
  createGain() { const node = new Node(); this.gains.push(node); return node; }
  createStereoPanner() { return new Node(); }
  createBiquadFilter() { return new Node(); }
  createDynamicsCompressor() { return new Node(); }
  createBuffer(_channels, length) { return { getChannelData: () => new Float32Array(length) }; }
  createOscillator() { const node = new Node(); this.sources.push(node); return node; }
  createBufferSource() { return this.createOscillator(); }
  async resume() { this.state = 'running'; this.dispatchEvent(new Event('statechange')); }
  async suspend() { await Promise.resolve(); this.state = 'suspended'; this.dispatchEvent(new Event('statechange')); }
  async close() { this.state = 'closed'; }
}

test('静音默认不创建音频上下文；手势解锁后音乐和音效复用同一个上下文', async t => {
  let created = 0;
  const context = new Context(), engine = new AdventureAudio(() => { created++; return context; });
  t.after(() => engine.dispose());
  engine.setHidden(false); engine.play('chest'); await engine.unlock();
  assert.equal(created, 0);
  engine.configure(true, 35, 60);
  engine.setHidden(false);
  assert.equal(created, 0, '恢复已开启偏好也必须等待首次手势');
  await engine.unlock();
  assert.equal(engine.getSnapshot().status, 'playing');
  const musicSources = context.sources.length;
  engine.play('save'); engine.play('chest');
  assert(context.sources.length > musicSources);
  await engine.unlock(); assert.equal(created, 1);
  engine.setEnabled(false);
  const mutedSources = context.sources.length;
  engine.play('victory');
  assert.equal(context.sources.length, mutedSources);
  assert.equal(engine.getSnapshot().status, 'off');
  assert(context.sources.every(source => source.stopTime === 0));
});

test('快速静音再开启、后台暂停恢复、切图淡化和清理不会遗留多首音乐', async t => {
  const context = new Context(), engine = new AdventureAudio(() => context);
  t.after(() => engine.dispose());
  engine.setEnabled(true); await engine.unlock();
  engine.setEnabled(false); engine.setEnabled(true); await engine.unlock();
  assert.equal(engine.getSnapshot().status, 'playing');
  for (let chapter = 0; chapter < 5; chapter++) engine.setScene({ chapter, intense: true });
  assert.equal(engine.tracks.size, 2, '当前轨和淡出轨最多各一条');
  engine.setHidden(true); await Promise.resolve();
  assert.equal(engine.tracks.size, 0);
  const pausedSources = context.sources.length;
  engine.play('letter'); assert.equal(context.sources.length, pausedSources);
  engine.setHidden(false); await engine.unlock();
  assert.equal(engine.getSnapshot().status, 'playing');
  assert.deepEqual(engine.getSnapshot().scene, { chapter: 4, intense: true });
  engine.setVolume('musicVolume', 0); engine.setVolume('effectsVolume', 200);
  assert.equal(context.gains[0].gain.value, 0);
  assert.equal(engine.getSnapshot().effectsVolume, 100);
  engine.dispose();
  assert.equal(context.state, 'closed'); assert.equal(engine.timer, null); assert.equal(engine.tracks.size, 0);
});
