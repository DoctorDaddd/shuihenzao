import { useEffect, useState, useSyncExternalStore } from 'react';
import { AdventureAudio } from '../lib/adventure-audio';

export function useAdventureAudio() {
  const [engine] = useState(() => new AdventureAudio());
  const state = useSyncExternalStore(engine.subscribe, engine.getSnapshot, engine.getSnapshot);
  useEffect(() => {
    try {
      const volume = (key: string, fallback: number) => {
        const value = localStorage.getItem(key);
        return value === null || !Number.isFinite(Number(value)) ? fallback : Number(value);
      };
      engine.configure(localStorage.getItem('brush-sound') === 'true', volume('brush-music-volume', 35), volume('brush-effects-volume', 60));
    } catch (error) { engine.preferenceError(error); }
    const activate = (event: Event) => {
      // The explicit sound buttons unlock themselves. A pointerdown must not
      // turn "enable" into "mute" before the same user's click is dispatched.
      if (event.target instanceof Element && event.target.closest('[data-sound-control]')) return;
      void engine.unlock();
    };
    const click = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest('.app-shell button:not([data-sound-control])')) engine.play('select');
    };
    const visibility = () => engine.setHidden(document.hidden);
    document.addEventListener('pointerdown', activate);
    document.addEventListener('keydown', activate);
    document.addEventListener('click', click);
    document.addEventListener('visibilitychange', visibility);
    visibility();
    return () => {
      document.removeEventListener('pointerdown', activate); document.removeEventListener('keydown', activate);
      document.removeEventListener('click', click); document.removeEventListener('visibilitychange', visibility);
      engine.dispose();
    };
  }, [engine]);
  function remember(key: string, value: string) {
    try { localStorage.setItem(key, value); } catch (error) { engine.preferenceError(error); }
  }
  function setEnabled(enabled: boolean) {
    engine.setEnabled(enabled);
    remember('brush-sound', String(enabled));
  }
  function setVolume(kind: 'musicVolume' | 'effectsVolume', value: number) {
    engine.setVolume(kind, value);
    remember(kind === 'musicVolume' ? 'brush-music-volume' : 'brush-effects-volume', String(value));
  }
  return { ...state, setEnabled, setVolume, play: engine.play, setScene: engine.setScene, unlock: engine.unlock };
}
