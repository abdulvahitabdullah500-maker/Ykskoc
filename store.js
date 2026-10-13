// YKS Koç - yerel veri deposu (AsyncStorage uzerinde calisir)
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'yks.koc.state.v1';

const EMPTY = {
  profile: { track: 'tyt', name: '', target: '', dailyTarget: 40, examDate: '' },
  doneTopics: {},      // { topicId: true }
  results: [],         // { id, date, mode, subject, total, correct, wrong, empty, net, track }
  questionStats: {},   // { questionId: { correct: n, wrong: n } }
  streak: { count: 0, last: '' },
  studyMinutes: 0,
  pomodoro: 0,
};

const StoreContext = createContext(null);

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setState({ ...EMPTY, ...parsed, profile: { ...EMPTY.profile, ...(parsed.profile || {}) } });
        }
      } catch (e) {
        // bozuk veri varsa sifirdan basla
      }
      setReady(true);
    })();
  }, []);

  const persist = useCallback((next) => {
    setState(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const update = useCallback(
    (patch) => {
      setState((prev) => {
        const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch };
        AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    []
  );

  const api = {
    state,
    ready,
    setProfile: (p) => update((s) => ({ ...s, profile: { ...s.profile, ...p } })),
    toggleTopic: (topicId) =>
      update((s) => {
        const done = { ...s.doneTopics };
        if (done[topicId]) delete done[topicId];
        else done[topicId] = true;
        return { ...s, doneTopics: done };
      }),
    markTopics: (ids) =>
      update((s) => {
        const done = { ...s.doneTopics };
        ids.forEach((id) => { done[id] = true; });
        return { ...s, doneTopics: done };
      }),
    saveResult: (result) =>
      update((s) => {
        const today = todayStr();
        let streak = { ...s.streak };
        if (streak.last !== today) {
          const yesterday = new Date(Date.now() - 86400000);
          const y = yesterday.getFullYear() + '-' + String(yesterday.getMonth() + 1).padStart(2, '0') + '-' + String(yesterday.getDate()).padStart(2, '0');
          streak.count = streak.last === y ? streak.count + 1 : 1;
          streak.last = today;
        }
        const qs = { ...s.questionStats };
        (result.detail || []).forEach((d) => {
          const cur = qs[d.id] || { correct: 0, wrong: 0 };
          qs[d.id] = { correct: cur.correct + (d.ok ? 1 : 0), wrong: cur.wrong + (d.ok ? 0 : 1) };
        });
        return {
          ...s,
          streak,
          questionStats: qs,
          results: [{ id: String(Date.now()), date: new Date().toISOString(), ...result }, ...s.results].slice(0, 200),
        };
      }),
    addStudyMinutes: (m) => update((s) => ({ ...s, studyMinutes: s.studyMinutes + m, pomodoro: s.pomodoro + 1 })),
    resetAll: () => persist({ ...EMPTY }),
    resetProgress: () => update((s) => ({ ...s, doneTopics: {}, results: [], questionStats: {}, studyMinutes: 0, pomodoro: 0, streak: { count: 0, last: '' } })),
  };

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('StoreProvider bulunamadi');
  return ctx;
}

export function netHesapla(correct, wrong) {
  return Math.max(0, correct - wrong / 4);
}
