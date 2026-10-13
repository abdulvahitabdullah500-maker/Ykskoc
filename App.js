import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors, space, radius, type } from './src/theme';
import { NavContext } from './src/nav';
import { StoreProvider, useStore } from './src/store';

import Onboarding from './src/screens/Onboarding';
import Home from './src/screens/Home';
import Tracks from './src/screens/Tracks';
import Subjects from './src/screens/Subjects';
import SubjectDetail from './src/screens/SubjectDetail';
import TopicDetail from './src/screens/TopicDetail';
import TestSetup from './src/screens/TestSetup';
import TestRun from './src/screens/TestRun';
import TestResult from './src/screens/TestResult';
import WrongBook from './src/screens/WrongBook';
import Stats from './src/screens/Stats';
import Pomodoro from './src/screens/Pomodoro';
import Profile from './src/screens/Profile';
import Search from './src/screens/Search';

const ROUTES = {
  Home, Tracks, Subjects, SubjectDetail, TopicDetail, TestSetup, TestRun, TestResult,
  WrongBook, Stats, Pomodoro, Profile, Search,
};

const TABS = [
  { name: 'Home', label: 'Ana Sayfa', icon: '🏠' },
  { name: 'Subjects', label: 'Dersler', icon: '📚' },
  { name: 'TestSetup', label: 'Test', icon: '📝' },
  { name: 'Stats', label: 'İstatistik', icon: '📈' },
  { name: 'Profile', label: 'Profil', icon: '⚙️' },
];

function Shell() {
  const store = useStore();
  const [stack, setStack] = useState([{ route: 'Home', params: {} }]);
  const [tab, setTab] = useState('Home');

  const push = useCallback((route, params = {}) => setStack((s) => [...s, { route, params }]), []);
  const pop = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), []);
  const replace = useCallback((route, params = {}) => setStack((s) => [...s.slice(0, -1), { route, params }]), []);
  const reset = useCallback((route, params = {}) => setStack([{ route, params }]), []);

  const goTab = useCallback((name) => {
    setTab(name);
    setStack([{ route: name, params: {} }]);
  }, []);

  const nav = useMemo(
    () => ({ push, pop, replace, reset, canGoBack: stack.length > 1 }),
    [push, pop, replace, reset, stack.length]
  );

  if (!store.ready) {
    return (
      <View style={s.boot}>
        <Text style={s.bootMark}>YKS</Text>
        <Text style={s.bootTxt}>Koç yükleniyor…</Text>
      </View>
    );
  }

  if (!store.state.profile.track || !store.state.profile.onboarded) {
    return (
      <NavContext.Provider value={nav}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        <Onboarding />
      </NavContext.Provider>
    );
  }

  const current = stack[stack.length - 1];
  const Screen = ROUTES[current.route] || Home;
  const showTabs = stack.length === 1;

  return (
    <NavContext.Provider value={nav}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <Screen {...current.params} />
        {showTabs ? (
          <View style={s.tabbar}>
            {TABS.map((t) => {
              const active = tab === t.name;
              return (
                <TouchableOpacity key={t.name} style={s.tab} onPress={() => goTab(t.name)} accessibilityRole="button">
                  <Text style={[s.tabIcon, { opacity: active ? 1 : 0.5 }]}>{t.icon}</Text>
                  <Text style={[s.tabLabel, { color: active ? colors.primary : colors.muted }]}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}
      </View>
    </NavContext.Provider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  boot: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  bootMark: { fontSize: 42, fontWeight: '900', color: colors.primary, letterSpacing: 4 },
  bootTxt: { ...type.small, marginTop: 8 },
  tabbar: {
    flexDirection: 'row',
    backgroundColor: colors.bgSoft,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 8,
    paddingBottom: 22,
    paddingHorizontal: 4,
  },
  tab: { flex: 1, alignItems: 'center' },
  tabIcon: { fontSize: 18 },
  tabLabel: { fontSize: 10.5, fontWeight: '700', marginTop: 3 },
});
