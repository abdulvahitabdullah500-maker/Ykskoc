import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, space, radius, type } from '../theme';
import { Screen, Header, Btn, Card } from '../ui';
import { useNav } from '../nav';
import SORULAR from '../data/sorular.json';

const HARFLER = ['A', 'B', 'C', 'D', 'E'];

export default function TestResult({ result }) {
  const nav = useNav();
  const [filtre, setFiltre] = useState('hepsi');

  if (!result) {
    return (
      <Screen>
        <Header title="Sonuç bulunamadı" onBack={() => nav.pop()} />
      </Screen>
    );
  }

  const harita = {};
  SORULAR.forEach((q) => { harita[q.id] = q; });

  const detay = (result.detail || [])
    .map((d) => ({ ...d, q: harita[d.id] }))
    .filter((d) => d.q);

  const goster = detay.filter((d) => {
    if (filtre === 'yanlis') return !d.ok && !d.empty;
    if (filtre === 'bos') return d.empty;
    if (filtre === 'dogru') return d.ok;
    return true;
  });

  const basari = result.total ? (result.correct / result.total) * 100 : 0;

  return (
    <Screen>
      <Header title="Test sonucu" subtitle={result.subjectName} onBack={() => nav.pop()} />
      <View style={{ padding: space.lg }}>
        <Card style={{ alignItems: 'center', paddingVertical: space.xl }}>
          <Text style={[s.net, { color: result.net >= result.total * 0.5 ? colors.success : colors.accent }]}>{result.net.toFixed(2)}</Text>
          <Text style={s.netLbl}>NET</Text>
          <Text style={s.info}>
            {result.total} soruda %{basari.toFixed(0)} doğru oranı. 4 yanlış 1 doğruyu götürdüğü için net, doğru sayısından yanlışın dörtte biri çıkarılarak bulunur.
          </Text>
        </Card>

        <View style={s.grid}>
          <View style={[s.box, { borderColor: colors.success + '55' }]}>
            <Text style={[s.boxVal, { color: colors.success }]}>{result.correct}</Text>
            <Text style={s.boxLbl}>doğru</Text>
          </View>
          <View style={[s.box, { borderColor: colors.danger + '55' }]}>
            <Text style={[s.boxVal, { color: colors.danger }]}>{result.wrong}</Text>
            <Text style={s.boxLbl}>yanlış</Text>
          </View>
          <View style={s.box}>
            <Text style={[s.boxVal, { color: colors.muted }]}>{result.empty}</Text>
            <Text style={s.boxLbl}>boş</Text>
          </View>
          <View style={s.box}>
            <Text style={[s.boxVal, { color: colors.primary }]}>{result.total}</Text>
            <Text style={s.boxLbl}>toplam</Text>
          </View>
        </View>

        <Card tone="primary">
          <Text style={s.cardHead}>Ne yapmalısın?</Text>
          <Text style={s.info}>
            {result.wrong > 0
              ? 'Yanlış yaptığın ' + result.wrong + ' soru yanlış defterine kaydedildi. Bugün ve üç gün sonra bu soruları tekrar çöz; aynı hatayı tekrar yapıyorsan konu anlatımına dön.'
              : 'Yanlışın yok. Soru sayısını artırıp süreyi kısaltarak kendini zorlamaya başlayabilirsin.'}
            {result.empty > 0 ? ' Boş bıraktığın ' + result.empty + ' soru için önce konu eksiğini kapat, sonra tekrar dene.' : ''}
          </Text>
        </Card>

        <View style={s.tabs}>
          {[
            { id: 'hepsi', label: 'Tümü' },
            { id: 'yanlis', label: 'Yanlışlar' },
            { id: 'bos', label: 'Boşlar' },
            { id: 'dogru', label: 'Doğrular' },
          ].map((t) => (
            <TouchableOpacity key={t.id} onPress={() => setFiltre(t.id)} style={[s.tab, filtre === t.id && s.tabActive]}>
              <Text style={[s.tabTxt, filtre === t.id && { color: colors.ink }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {goster.map((d, idx) => (
          <Card key={d.id}>
            <View style={s.qHead}>
              <View style={[s.tag, { backgroundColor: d.ok ? colors.successSoft : d.empty ? colors.surface2 : colors.dangerSoft }]}>
                <Text style={[s.tagTxt, { color: d.ok ? colors.success : d.empty ? colors.muted : colors.danger }]}>
                  {d.ok ? 'DOĞRU' : d.empty ? 'BOŞ' : 'YANLIŞ'}
                </Text>
              </View>
              <Text style={s.topicTxt}>{d.q.topic}</Text>
            </View>
            <Text style={s.qText}>{d.q.text}</Text>
            {d.q.options.map((o, k) => {
              const dogru = k === d.q.answer;
              const secili = d.chosen === k;
              return (
                <View key={k} style={[s.optRow, dogru && { backgroundColor: colors.successSoft }, secili && !dogru && { backgroundColor: colors.dangerSoft }]}>
                  <Text style={[s.harf, dogru && { color: colors.success }, secili && !dogru && { color: colors.danger }]}>{HARFLER[k]}</Text>
                  <Text style={[s.optTxt, dogru && { color: colors.ink, fontWeight: '700' }]}>{o}</Text>
                </View>
              );
            })}
            <View style={s.explain}>
              <Text style={s.explainLabel}>AÇIKLAMA</Text>
              <Text style={s.explainTxt}>{d.q.explain}</Text>
            </View>
          </Card>
        ))}

        <Btn label="Ana sayfaya dön" kind="ghost" onPress={() => nav.reset('Home')} style={{ marginTop: space.md }} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  net: { fontSize: 52, fontWeight: '900', letterSpacing: -2 },
  netLbl: { ...type.label, marginTop: -4, marginBottom: 10 },
  info: { ...type.small, lineHeight: 19, textAlign: 'center' },
  grid: { flexDirection: 'row', gap: 8, marginBottom: space.md },
  box: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.sm, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.line },
  boxVal: { fontSize: 19, fontWeight: '900' },
  boxLbl: { fontSize: 10, color: colors.muted, marginTop: 3, fontWeight: '700' },
  cardHead: { ...type.label, marginBottom: space.sm },
  tabs: { flexDirection: 'row', backgroundColor: colors.surface2, borderRadius: radius.pill, padding: 4, marginBottom: space.md },
  tab: { flex: 1, paddingVertical: 8, borderRadius: radius.pill, alignItems: 'center' },
  tabActive: { backgroundColor: colors.surface },
  tabTxt: { fontSize: 12, fontWeight: '700', color: colors.muted },
  qHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  tagTxt: { fontSize: 10, fontWeight: '900' },
  topicTxt: { ...type.small, flex: 1, textAlign: 'right' },
  qText: { ...type.body, fontSize: 14.5, color: colors.ink, lineHeight: 21, marginBottom: 12 },
  optRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 10, borderRadius: radius.sm, marginBottom: 4 },
  harf: { fontSize: 12.5, fontWeight: '900', color: colors.muted, marginRight: 10, width: 14 },
  optTxt: { ...type.body, flex: 1, fontSize: 13.5, lineHeight: 19 },
  explain: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.line },
  explainLabel: { ...type.label, color: colors.primary, marginBottom: 5 },
  explainTxt: { ...type.body, fontSize: 13.5, lineHeight: 20 },
});
