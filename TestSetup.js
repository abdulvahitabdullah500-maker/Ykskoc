import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, space, radius, type, TRACKS } from '../theme';
import { Screen, Header, Btn, Card, Pill, Empty } from '../ui';
import { useNav } from '../nav';
import { useStore } from '../store';
import { getSubjects, questionsForSubject } from '../data';
import SORULAR from '../data/sorular.json';

const SURE = [10, 20, 30, 40];

export default function TestSetup({ subjectId: baslangicDers, trackId: baslangicTrack, topicName }) {
  const nav = useNav();
  const store = useStore();
  const aktifTrack = baslangicTrack || store.state.profile.track;
  const subjects = useMemo(() => getSubjects(aktifTrack), [aktifTrack]);

  const [ders, setDers] = useState(baslangicDers || (subjects[0] && subjects[0].id) || null);
  const [soruSayisi, setSoruSayisi] = useState(10);
  const [sure, setSure] = useState(0);

  const seciliDers = subjects.find((s) => s.id === ders);
  const dersSorulari = useMemo(() => questionsForSubject(seciliDers), [seciliDers]);

  const basla = () => {
    const havuz = dersSorulari.length ? dersSorulari : SORULAR;
    const secilen = havuz.slice(0, Math.min(soruSayisi, havuz.length));
    nav.push('TestRun', {
      sorular: secilen,
      sure: sure || 0,
      subjectName: seciliDers ? seciliDers.name : 'Genel test',
      subjectId: ders,
      trackId: aktifTrack,
      topicName: topicName || null,
    });
  };

  return (
    <Screen>
      <Header title="Test çöz" subtitle={topicName ? 'Konu: ' + topicName : 'Deneme ve konu testleri'} onBack={nav.canGoBack ? () => nav.pop() : undefined} />
      <View style={{ padding: space.lg }}>
        <Text style={s.step}>1 · Ders seç</Text>
        <View style={s.chips}>
          {subjects.map((sb) => (
            <TouchableOpacity
              key={sb.id}
              onPress={() => setDers(sb.id)}
              style={[s.chip, ders === sb.id && { backgroundColor: sb.color + '22', borderColor: sb.color }]}
            >
              <Text style={[s.chipTxt, ders === sb.id && { color: sb.color }]}>{sb.icon} {sb.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.step}>2 · Soru sayısı</Text>
        <View style={s.chips}>
          {[5, 10, 20, 40].map((n) => (
            <TouchableOpacity key={n} onPress={() => setSoruSayisi(n)} style={[s.chip, soruSayisi === n && s.chipActive]}>
              <Text style={[s.chipTxt, soruSayisi === n && { color: '#fff' }]}>{n} soru</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.step}>3 · Süre</Text>
        <View style={s.chips}>
          {SURE.map((m) => (
            <TouchableOpacity key={m} onPress={() => setSure(m)} style={[s.chip, sure === m && s.chipActive]}>
              <Text style={[s.chipTxt, sure === m && { color: '#fff' }]}>{m} dk</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => setSure(0)} style={[s.chip, sure === 0 && s.chipActive]}>
            <Text style={[s.chipTxt, sure === 0 && { color: '#fff' }]}>Süresiz</Text>
          </TouchableOpacity>
        </View>

        <Card style={{ marginTop: space.xl }}>
          <Text style={s.sumTitle}>Test özeti</Text>
          <View style={s.sumRow}><Text style={s.sumLbl}>Ders</Text><Text style={s.sumVal}>{seciliDers ? seciliDers.name : 'Genel'}</Text></View>
          <View style={s.sumRow}><Text style={s.sumLbl}>Soru sayısı</Text><Text style={s.sumVal}>{Math.min(soruSayisi, dersSorulari.length || SORULAR.length)} soru</Text></View>
          <View style={s.sumRow}><Text style={s.sumLbl}>Süre</Text><Text style={s.sumVal}>{sure ? sure + ' dakika' : 'Süresiz'}</Text></View>
          <View style={s.sumRow}><Text style={s.sumLbl}>Yanlış kuralı</Text><Text style={s.sumVal}>4 yanlış = 1 doğruyu götürür</Text></View>
        </Card>

        {dersSorulari.length === 0 ? (
          <Card tone="accent">
            <Text style={s.warn}>
              Bu derste henüz hazır soru yok. Soru bankası dosyasına (src/data/sorular.json) yeni sorular ekleyerek bankayı sınırsız büyütebilirsin.
            </Text>
          </Card>
        ) : null}

        <Btn label="Testi başlat" kind="success" onPress={basla} style={{ marginTop: space.lg }} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  step: { ...type.label, marginTop: space.lg, marginBottom: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 13, paddingVertical: 10, borderRadius: radius.pill, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.line },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipTxt: { fontSize: 13, fontWeight: '700', color: colors.inkSoft },
  sumTitle: { ...type.h3, marginBottom: space.md },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 },
  sumLbl: { ...type.small },
  sumVal: { ...type.body, color: colors.ink, fontSize: 13.5, fontWeight: '700' },
  warn: { ...type.small, lineHeight: 19 },
});
