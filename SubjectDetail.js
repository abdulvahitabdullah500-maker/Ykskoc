import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, space, radius, type } from '../theme';
import { Screen, Header, Btn, ProgressBar, Empty } from '../ui';
import { useNav } from '../nav';
import { useStore } from '../store';
import { findSubject, questionsForSubject } from '../data';

export default function SubjectDetail({ subjectId, trackId }) {
  const nav = useNav();
  const store = useStore();
  const { doneTopics } = store.state;
  const subject = useMemo(() => findSubject(trackId, subjectId), [trackId, subjectId]);
  const [acik, setAcik] = useState({});

  if (!subject) {
    return (
      <Screen>
        <Header title="Ders bulunamadı" onBack={() => nav.pop()} />
        <Empty icon="🔎" title="Bu ders listede yok" desc="Alan değiştirilmiş olabilir. Dersler sekmesinden tekrar deneyin." />
      </Screen>
    );
  }

  const topics = subject.topics || [];
  const biten = topics.filter((t) => doneTopics[t.id]).length;
  const oran = topics.length ? biten / topics.length : 0;
  const altSayi = topics.reduce((a, t) => a + t.subs.length, 0);

  const hepsiniIsaretle = () => store.markTopics(topics.map((t) => t.id));
  const sifirla = () => topics.forEach((t) => { if (doneTopics[t.id]) store.toggleTopic(t.id); });

  return (
    <Screen>
      <Header title={subject.name} subtitle={topics.length + ' konu · ' + altSayi + ' alt başlık'} onBack={() => nav.pop()} />
      <View style={{ padding: space.lg }}>
        <View style={s.summary}>
          <View style={{ flex: 1 }}>
            <Text style={s.summaryTitle}>İlerleme</Text>
            <Text style={s.summarySub}>{biten} / {topics.length} konu tamamlandı</Text>
            <ProgressBar value={oran} color={subject.color} style={{ marginTop: 10 }} height={8} />
          </View>
          <Text style={[s.bigPct, { color: subject.color }]}>{Math.round(oran * 100)}%</Text>
        </View>

        <View style={s.btnRow}>
          <Btn label="Konuları tamamlandı işaretle" kind="ghost" onPress={hepsiniIsaretle} style={{ flex: 1, marginRight: 8, paddingVertical: 11 }} />
          <Btn label="Test çöz" kind="primary" onPress={() => nav.push('TestSetup', { subjectId: subject.id, trackId })} style={{ flex: 1, paddingVertical: 11 }} />
        </View>

        <Text style={s.listTitle}>Konu listesi</Text>
        {topics.map((t, i) => {
          const ok = !!doneTopics[t.id];
          const open = !!acik[t.id];
          return (
            <View key={t.id} style={[s.topicCard, ok && { borderColor: colors.success + '66' }]}>
              <View style={s.topicHead}>
                <TouchableOpacity style={s.topicMain} activeOpacity={0.85} onPress={() => nav.push('TopicDetail', { subjectId: subject.id, topicId: t.id, trackId })}>
                  <View style={[s.num, { backgroundColor: ok ? colors.success + '22' : colors.surface2 }]}>
                    <Text style={[s.numTxt, { color: ok ? colors.success : colors.muted }]}>{ok ? '✓' : String(i + 1)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.topicName}>{t.name}</Text>
                    <Text style={s.topicSub}>{t.subs.length} alt başlık</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setAcik((a) => ({ ...a, [t.id]: !a[t.id] }))} style={s.expandBtn} accessibilityLabel="Alt başlıkları aç">
                  <Text style={s.expandTxt}>{open ? '−' : '+'}</Text>
                </TouchableOpacity>
              </View>
              {open ? (
                <View style={s.subs}>
                  {t.subs.map((sb, k) => (
                    <View key={k} style={s.subRow}>
                      <Text style={s.bullet}>•</Text>
                      <Text style={s.subTxt}>{sb}</Text>
                    </View>
                  ))}
                  <TouchableOpacity onPress={() => store.toggleTopic(t.id)} style={[s.markBtn, ok && { backgroundColor: colors.success + '22', borderColor: colors.success + '55' }]}>
                    <Text style={[s.markTxt, ok && { color: colors.success }]}>{ok ? '✓ Bu konu tamamlandı' : 'Bu konuyu tamamlandı olarak işaretle'}</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  summary: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: space.lg, borderWidth: 1, borderColor: colors.line },
  summaryTitle: { ...type.h3 },
  summarySub: { ...type.small, marginTop: 3 },
  bigPct: { fontSize: 26, fontWeight: '900', marginLeft: 12 },
  btnRow: { flexDirection: 'row', marginTop: space.md },
  listTitle: { ...type.label, marginTop: space.xl, marginBottom: space.sm },
  topicCard: { backgroundColor: colors.surface, borderRadius: radius.md, marginBottom: space.sm, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  topicHead: { flexDirection: 'row', alignItems: 'center', padding: space.md },
  topicMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  num: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  numTxt: { fontSize: 13, fontWeight: '900' },
  topicName: { ...type.h3, fontSize: 14.5 },
  topicSub: { ...type.small, marginTop: 2 },
  expandBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  expandTxt: { color: colors.inkSoft, fontSize: 18, fontWeight: '900', lineHeight: 20 },
  subs: { paddingHorizontal: space.md, paddingBottom: space.md, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: space.md },
  subRow: { flexDirection: 'row', marginBottom: 7 },
  bullet: { color: colors.primary, marginRight: 8, fontSize: 13 },
  subTxt: { ...type.body, flex: 1, fontSize: 13.5, lineHeight: 19 },
  markBtn: { marginTop: 10, paddingVertical: 11, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line, alignItems: 'center', backgroundColor: colors.surface2 },
  markTxt: { fontSize: 12.5, fontWeight: '700', color: colors.inkSoft },
});
