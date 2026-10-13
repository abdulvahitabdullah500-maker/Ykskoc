import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, space, radius, type, TRACKS } from '../theme';
import { Screen, Header, Card, Btn } from '../ui';
import { useNav } from '../nav';
import { useStore } from '../store';
import { countTopics, countSubtopics } from '../data';

export default function Tracks() {
  const nav = useNav();
  const store = useStore();
  const aktif = store.state.profile.track;

  return (
    <Screen>
      <Header title="Alan seçimi" subtitle="Hangi sınava hazırlanıyorsun?" onBack={() => nav.pop()} />
      <View style={{ padding: space.lg }}>
        <Text style={s.info}>
          TYT herkes için ortaktır. AYT puan türüne göre farklı dersleri kapsar; alanını değiştirdiğinde ders listesi ve konu takibi ona göre güncellenir.
        </Text>
        {TRACKS.map((t) => {
          const secili = aktif === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              activeOpacity={0.85}
              onPress={() => store.setProfile({ track: t.id })}
              style={[s.card, secili && { borderColor: t.color, backgroundColor: t.color + '12' }]}
            >
              <View style={s.rowTop}>
                <Text style={{ fontSize: 26 }}>{t.icon}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={s.name}>{t.name}</Text>
                  <Text style={s.desc}>{t.desc}</Text>
                </View>
                {secili ? <Text style={[s.aktif, { color: t.color }]}>AKTİF</Text> : null}
              </View>
              <Text style={s.long}>{t.long}</Text>
              <View style={s.metaRow}>
                <Text style={s.meta}>{t.questions} soru</Text>
                <Text style={s.meta}>{t.minutes} dakika</Text>
                <Text style={s.meta}>{countTopics(t.id)} konu</Text>
                <Text style={s.meta}>{countSubtopics(t.id)} alt başlık</Text>
              </View>
              {secili ? (
                <Btn label="Derslere git" onPress={() => nav.push('Subjects')} style={{ marginTop: 12 }} />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  info: { ...type.small, lineHeight: 20, marginBottom: space.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: space.lg, marginBottom: space.md, borderWidth: 1.5, borderColor: colors.line },
  rowTop: { flexDirection: 'row', alignItems: 'center' },
  name: { ...type.h3, fontSize: 16.5 },
  desc: { ...type.small, marginTop: 2 },
  aktif: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  long: { ...type.small, marginTop: 12, lineHeight: 19 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  meta: { fontSize: 11.5, color: colors.inkSoft, backgroundColor: colors.surface2, paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill, fontWeight: '700' },
});
