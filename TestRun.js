import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, BackHandler, Alert } from 'react-native';
import { colors, space, radius, type } from '../theme';
import { Screen, Btn, ProgressBar } from '../ui';
import { useNav } from '../nav';
import { useStore, netHesapla } from '../store';

const HARFLER = ['A', 'B', 'C', 'D', 'E'];

export default function TestRun({ sorular, sure, subjectName, subjectId, trackId, topicName }) {
  const nav = useNav();
  const store = useStore();
  const [i, setI] = useState(0);
  const [cevaplar, setCevaplar] = useState({});
  const [kalan, setKalan] = useState(sure ? sure * 60 : 0);
  const [bitti, setBitti] = useState(false);
  const timer = useRef(null);

  const soru = sorular[i];

  useEffect(() => {
    if (!sure) return;
    timer.current = setInterval(() => {
      setKalan((k) => {
        if (k <= 1) {
          clearInterval(timer.current);
          setBitti(true);
          return 0;
        }
        return k - 1;
      });
    }, 1000);
    return () => clearInterval(timer.current);
  }, [sure]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (bitti) return false;
      Alert.alert('Testten çıkılsın mı?', 'Cevapların kaydedilmeyecek.', [
        { text: 'Kal', style: 'cancel' },
        { text: 'Çık', style: 'destructive', onPress: () => nav.pop() },
      ]);
      return true;
    });
    return () => sub.remove();
  }, [bitti, nav]);

  const ozet = useMemo(() => {
    let correct = 0, wrong = 0, empty = 0;
    const detail = [];
    sorular.forEach((q) => {
      const c = cevaplar[q.id];
      if (c === undefined) { empty += 1; detail.push({ id: q.id, ok: false, empty: true }); }
      else if (c === q.answer) { correct += 1; detail.push({ id: q.id, ok: true }); }
      else { wrong += 1; detail.push({ id: q.id, ok: false, chosen: c }); }
    });
    return { correct, wrong, empty, detail, net: netHesapla(correct, wrong) };
  }, [cevaplar, sorular]);

  const bitir = () => {
    clearInterval(timer.current);
    setBitti(true);
  };

  const kaydet = () => {
    const result = {
      mode: sure ? 'sureli' : 'suresiz',
      subject: subjectId,
      subjectName,
      track: trackId,
      topicName: topicName || null,
      total: sorular.length,
      correct: ozet.correct,
      wrong: ozet.wrong,
      empty: ozet.empty,
      net: Number(ozet.net.toFixed(2)),
      detail: ozet.detail,
    };
    store.saveResult(result);
    nav.replace('TestResult', { result });
  };

  if (!soru) {
    return (
      <Screen>
        <View style={{ padding: space.lg }}>
          <Text style={s.done}>Sorular yüklenemedi.</Text>
          <Btn label="Geri dön" onPress={() => nav.pop()} style={{ marginTop: space.lg }} />
        </View>
      </Screen>
    );
  }

  if (bitti) {
    return (
      <Screen>
        <View style={{ padding: space.lg }}>
          <Text style={s.title}>Test tamamlandı</Text>
          <View style={s.scoreCard}>
            <View style={s.scoreBox}><Text style={[s.scoreVal, { color: colors.success }]}>{ozet.correct}</Text><Text style={s.scoreLbl}>doğru</Text></View>
            <View style={s.scoreBox}><Text style={[s.scoreVal, { color: colors.danger }]}>{ozet.wrong}</Text><Text style={s.scoreLbl}>yanlış</Text></View>
            <View style={s.scoreBox}><Text style={[s.scoreVal, { color: colors.muted }]}>{ozet.empty}</Text><Text style={s.scoreLbl}>boş</Text></View>
            <View style={s.scoreBox}><Text style={[s.scoreVal, { color: colors.accent }]}>{ozet.net.toFixed(2)}</Text><Text style={s.scoreLbl}>net</Text></View>
          </View>
          <Text style={s.info}>
            {sure ? 'Süre doldu ya da testi bitirdin. ' : ''}
            Net hesabı: doğru − (yanlış / 4). Sonucu kaydettiğinde istatistiklerine ve yanlış defterine işlenir.
          </Text>
          <Btn label="Sonucu kaydet ve incele" kind="success" onPress={kaydet} style={{ marginTop: space.lg }} />
        </View>
      </Screen>
    );
  }

  const dakika = Math.floor(kalan / 60);
  const saniye = kalan % 60;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={s.top}>
        <TouchableOpacity onPress={() => nav.pop()} style={s.closeBtn}><Text style={s.closeTxt}>✕</Text></TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <ProgressBar value={(i + 1) / sorular.length} height={7} />
        </View>
        {sure ? (
          <View style={[s.timer, { backgroundColor: kalan < 60 ? colors.dangerSoft : colors.surface2 }]}>
            <Text style={[s.timerTxt, kalan < 60 && { color: colors.danger }]}>
              {dakika}:{String(saniye).padStart(2, '0')}
            </Text>
          </View>
        ) : (
          <Text style={s.count}>{i + 1}/{sorular.length}</Text>
        )}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: space.lg, paddingBottom: 120 }}>
        <Text style={s.meta}>{subjectName} · Soru {i + 1} / {sorular.length}</Text>
        <Text style={s.qText}>{soru.text}</Text>
        {soru.options.map((opt, k) => {
          const secili = cevaplar[soru.id] === k;
          return (
            <TouchableOpacity
              key={k}
              onPress={() => setCevaplar((c) => ({ ...c, [soru.id]: k }))}
              activeOpacity={0.85}
              style={[s.opt, secili && s.optActive]}
            >
              <View style={[s.harf, secili && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                <Text style={[s.harfTxt, secili && { color: '#fff' }]}>{HARFLER[k]}</Text>
              </View>
              <Text style={[s.optTxt, secili && { color: colors.ink }]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
        <Text style={s.hint}>Cevabı değiştirmek için başka bir seçeneğe dokun. Boş bırakırsan soru yanlış sayılmaz, boş kalır.</Text>
      </ScrollView>

      <View style={s.bottom}>
        <Btn label="Önceki" kind="ghost" onPress={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0} style={{ flex: 1, marginRight: 8 }} />
        {i === sorular.length - 1 ? (
          <Btn label="Testi bitir" kind="success" onPress={bitir} style={{ flex: 1.2 }} />
        ) : (
          <Btn label="Sonraki" onPress={() => setI((x) => Math.min(sorular.length - 1, x + 1))} style={{ flex: 1.2 }} />
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', paddingTop: 54, paddingHorizontal: space.lg, paddingBottom: 14 },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  closeTxt: { color: colors.inkSoft, fontSize: 15, fontWeight: '900' },
  timer: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill },
  timerTxt: { color: colors.ink, fontWeight: '900', fontSize: 13 },
  count: { ...type.small, fontWeight: '800' },
  meta: { ...type.label, marginBottom: space.md },
  qText: { fontSize: 17, lineHeight: 26, color: colors.ink, fontWeight: '600', marginBottom: space.xl },
  opt: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: space.md, marginBottom: 10, borderWidth: 1.5, borderColor: colors.line },
  optActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  harf: { width: 30, height: 30, borderRadius: 10, borderWidth: 1.5, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  harfTxt: { fontSize: 12.5, fontWeight: '900', color: colors.muted },
  optTxt: { ...type.body, flex: 1, fontSize: 14.5, lineHeight: 21 },
  hint: { ...type.small, marginTop: space.md, lineHeight: 18 },
  bottom: { flexDirection: 'row', padding: space.lg, paddingBottom: 26, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.bgSoft },
  title: { ...type.h2, marginBottom: space.lg },
  scoreCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: space.md, borderWidth: 1, borderColor: colors.line },
  scoreBox: { flex: 1, alignItems: 'center' },
  scoreVal: { fontSize: 22, fontWeight: '900' },
  scoreLbl: { fontSize: 10.5, color: colors.muted, marginTop: 3, fontWeight: '700' },
  info: { ...type.small, marginTop: space.lg, lineHeight: 19 },
  done: { ...type.h3 },
});
