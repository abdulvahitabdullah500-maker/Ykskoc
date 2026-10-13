import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, space, radius, type, TRACKS } from '../theme';
import { Screen, Header, ProgressBar, Pill } from '../ui';
import { useNav } from '../nav';
import { useStore } from '../store';
import { getSubjects } from '../data';

export default function Subjects() {
  const nav = useNav();
  const store = useStore();
  const { profile, doneTopics } = store.state;
  const track = TRACKS.find((t) => t.id === profile.track) || TRACKS[0];
  const subjects = useMemo(() => getSubjects(track.id), [track.id]);

  return (
    <Screen>
      <Header
        title="Dersler ve konular"
        subtitle={track.name + ' · ' + subjects.length + ' ders'}
        right={
          <TouchableOpacity onPress={() => nav.push('Tracks')} style={s.switchBtn}>
            <Text style={s.switchTxt}>Alan</Text>
          </TouchableOpacity>
        }
      />
      <View style={{ padding: space.lg }}>
        <Text style={s.info}>Bir derse dokunarak konu listesini, konuya dokunarak konu anlatımı ve çalışma planını açabilirsin.</Text>
        {subjects.map((sub) => {
          const topics = sub.topics || [];
          const biten = topics.filter((t) => doneTopics[t.id]).length;
          const oran = topics.length ? biten / topics.length : 0;
          return (
            <TouchableOpacity
              key={sub.id}
              activeOpacity={0.85}
              onPress={() => nav.push('SubjectDetail', { subjectId: sub.id, trackId: track.id })}
              style={s.card}
            >
              <View style={s.row}>
                <View style={[s.badge, { backgroundColor: sub.color + '22' }]}>
                  <Text style={{ fontSize: 20 }}>{sub.icon}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.name}>{sub.name}</Text>
                  <Text style={s.sub}>{topics.length} konu · yaklaşık {sub.questionCount} soru</Text>
                </View>
                <Text style={[s.pct, { color: sub.color }]}>{Math.round(oran * 100)}%</Text>
              </View>
              <ProgressBar value={oran} color={sub.color} style={{ marginTop: 12 }} height={7} />
              <Text style={s.done}>{biten} / {topics.length} konu tamamlandı</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  switchBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.12)' },
  switchTxt: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  info: { ...type.small, lineHeight: 19, marginBottom: space.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: space.lg, marginBottom: space.md, borderWidth: 1, borderColor: colors.line },
  row: { flexDirection: 'row', alignItems: 'center' },
  badge: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  name: { ...type.h3, fontSize: 15.5 },
  sub: { ...type.small, marginTop: 3 },
  pct: { fontSize: 16, fontWeight: '900' },
  done: { ...type.small, marginTop: 8 },
});
