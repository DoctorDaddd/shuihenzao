import test from 'node:test';
import assert from 'node:assert/strict';
import { musicScene, createScore, THEMES, effectScore } from '../lib/adventure-score.ts';
import { AdventureAudio } from '../lib/adventure-audio.ts';
import { musicName, recordedTrack, RECORDED_TRACKS } from '../lib/adventure-tracks.ts';
import { statSync } from 'node:fs';

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
class Media extends EventTarget {
  src = ''; preload = ''; loop = false; currentTime = 0; paused = true; error = null;
  playResult = null; released = false;
  play() { this.paused = false; return this.playResult ?? Promise.resolve(); }
  pause() { this.paused = true; }
  removeAttribute(name) { if (name === 'src') this.src = ''; }
  load() { this.released = true; }
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
  createMediaElementSource() { return new Node(); }
  async resume() { this.state = 'running'; this.dispatchEvent(new Event('statechange')); }
  async suspend() { await Promise.resolve(); this.state = 'suspended'; this.dispatchEvent(new Event('statechange')); }
  async close() { this.state = 'closed'; }
}

test('静音默认不创建音频上下文；手势解锁后音乐和音效复用同一个上下文', async t => {
  let created = 0;
  const context = new Context(), engine = new AdventureAudio(() => { created++; return context; }, () => new Media());
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
  const context = new Context(), engine = new AdventureAudio(() => context, () => new Media());
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

test('首领演出跳过可取消本段音效并恢复音乐，静音时不会创建演出音源', async t => {
  const context = new Context(), engine = new AdventureAudio(() => context, () => new Media());
  t.after(() => engine.dispose());
  engine.configure(true, 35, 60);
  await engine.unlock();
  for (const effect of ['guardian-rise', 'guardian-reveal']) {
    const before = context.sources.length;
    const cancel = engine.play(effect);
    const added = context.sources.slice(before);
    assert(added.length > 0);
    assert.equal(typeof cancel, 'function');
    cancel();
    assert(added.every(source => source.stopTime === 0));
    assert.equal(context.gains[0].gain.value, .35);
    assert.equal(engine.getSnapshot().status, 'playing');
    assert(effectScore(effect).every(n => Number.isFinite(n.pitch) && n.volume > 0 && n.volume <= .25));
  }
  engine.setEnabled(false);
  const mutedCount = context.sources.length;
  engine.play('guardian-rise');
  assert.equal(context.sources.length, mutedCount);
});

test('七首指定曲目对应章节，第4/9/14/19格切关底曲，未指定音乐保留', () => {
  const expected = [['堕天せし者', '究極幻想'], [null, 'Answers'], ['ローカス', 'ライズ'], ['闘争', '逆襲の咆哮'], [null, null]];
  for (let chapter = 0; chapter < 5; chapter++) {
    for (let local = 1; local <= 5; local++) {
      const scene = musicScene(chapter, chapter * 5 + local), name = expected[chapter][local >= 4 ? 1 : 0];
      if (name) assert(musicName(scene).includes(name));
      else { assert.equal(recordedTrack(scene), null); assert.equal(musicName(scene), THEMES[chapter].name); }
    }
  }
  const files = RECORDED_TRACKS.flatMap(t => [t.calm, t.intense]).filter(Boolean);
  assert.equal(files.length, 7);
  for (const file of files) assert(statSync(new URL('../public'+file.src, import.meta.url)).size > 100_000);
});

test('录音按需播放并循环，静音/后台立即停止请求，恢复播放位置且切图没有残留', async t => {
  const context = new Context(), media = [];
  const engine = new AdventureAudio(() => context, () => { const m = new Media(); media.push(m); return m; });
  t.after(() => engine.dispose());
  engine.configure(true, 35, 60); engine.setScene(musicScene(2, 13));
  assert.equal(media.length, 0, '首次真实手势前不创建/下载任何录音');
  await engine.unlock();
  assert.equal(media.length, 1); assert.equal(media[0].loop, true); assert.equal(media[0].preload, 'none');
  assert(media[0].src.includes('locus.')); assert.equal(context.sources.length, 0, '录音不能叠加原合成旋律');
  media[0].currentTime = 42;
  engine.setHidden(true); await Promise.resolve();
  assert(media[0].paused && media[0].released); assert.equal(media[0].src, '');
  engine.setHidden(false); await engine.unlock();
  assert.equal(media[1].currentTime, 42); assert.equal(engine.getSnapshot().status, 'playing');
  engine.setScene(musicScene(2, 14)); await Promise.resolve();
  assert(media[2].src.includes('rise.')); assert.equal(media[2].currentTime, 0);
  engine.setScene(musicScene(1, 9)); await Promise.resolve();
  assert(media[3].src.includes('answers.')); assert(media[1].paused && media[1].released);
  assert.equal(engine.tracks.size, 2, '最多当前轨和一条淡出轨');
  engine.setEnabled(false);
  assert(media.every(m => m.paused && m.released)); assert.equal(engine.tracks.size, 0);
});

test('旧曲延迟播放/拒绝不能覆盖新曲状态；资源错误可见且可重试', async t => {
  const context = new Context(), media = [];
  let rejectOld;
  const engine = new AdventureAudio(() => context, () => {
    const m = new Media();
    if (!media.length) m.playResult = new Promise((_resolve, reject) => { rejectOld = reject; });
    media.push(m); return m;
  });
  t.after(() => engine.dispose());
  engine.configure(true, 35, 60); await engine.unlock();
  assert.equal(engine.getSnapshot().status, 'loading');
  engine.setScene(musicScene(0, 4)); await Promise.resolve();
  rejectOld(new Error('play interrupted by scene change'));
  await Promise.resolve(); await Promise.resolve();
  assert.equal(engine.getSnapshot().status, 'playing');
  const errors = t.mock.method(console, 'error', () => {});
  media[1].error = { code: 4 }; media[1].dispatchEvent(new Event('error'));
  assert.equal(engine.getSnapshot().status, 'error'); assert(engine.getSnapshot().message.includes('重试'));
  assert.equal(errors.mock.callCount(), 1); assert.equal(engine.tracks.size, 0);
  await engine.unlock();
  assert.equal(engine.getSnapshot().status, 'playing'); assert.equal(media.length, 3);
});

test('浏览器拒绝录音播放时报告失败，下一次手势可重试；加载中静音不会漏播', async t => {
  const context = new Context(), media = [];
  const errors = t.mock.method(console, 'error', () => {});
  const engine = new AdventureAudio(() => context, () => {
    const m = new Media();
    if (!media.length) m.playResult = Promise.reject(new Error('NotAllowedError'));
    media.push(m); return m;
  });
  t.after(() => engine.dispose());
  engine.configure(true, 35, 60); await engine.unlock(); await Promise.resolve();
  assert.equal(engine.getSnapshot().status, 'error'); assert.equal(errors.mock.callCount(), 1);
  assert(media[0].released);
  await engine.unlock();
  assert.equal(engine.getSnapshot().status, 'playing');
  let resolvePlay;
  engine.setEnabled(false); await Promise.resolve();
  engine.createMedia = () => {
    const m = new Media(); m.playResult = new Promise(resolve => { resolvePlay = resolve; }); media.push(m); return m;
  };
  engine.setEnabled(true); await engine.unlock();
  assert.equal(engine.getSnapshot().status, 'loading');
  engine.setEnabled(false); resolvePlay(); await Promise.resolve();
  assert.equal(engine.getSnapshot().status, 'off'); assert(media[2].paused && media[2].released);
});
