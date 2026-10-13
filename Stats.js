import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, space, radius, type, TRACKS } from '../theme';
import { Screen, Header, Card, Empty, ProgressBar, Btn } from '../ui';
import { useNav } from '../nav';
import { useStore } from '../store';
import { getSubjects, countSubtopics } from '../data';

const GUNLER = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export default function Stats() {
  const nav = useNav();
  const store = useStore();
  const { results, doneTopics, studyMinutes, streak, profile, questionStats } = store.state;
  const [aralik, setAralik] = useState(7);

  const sonuclar = useMemo(() => {
    const sinir = Date.now() - aralik * 86400000;
    return results.filter((r) => new Date(r.date).getTime() >= sinir);
  }, [results, aralik]);

  const toplamSoru = sonuclar.reduce((a, r) => a + r.total, 0);
  const toplamDogru = sonuclar.reduce((a, r) => a + r.correct, 0);
  const toplamYanlis = sonuclar.reduce((a, r) => a + r.wrong, 0);
  const toplamNet = sonuclar.reduce((a, r) => a + r.net, 0);
  const ortalamaNet = sonuclar.length ? toplamNet / sonuclar.length : 0;
  const basari = toplamSoru ? toplamDogru / toplamSoru : 0;

  const gunluk = useMemo(() => {
    const g = {};
    for (let i = aralik - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const key = d.toDateString();
      g[key] = { label: GUNLER[(d.getDay() + 6) % 7], soru: 0, net: 0, date: d };
    }
    results.forEach((r) => {
      const key = new Date(r.date).toDateString();
      if (g[key]) {
        g[key].soru += r.total;
        g[key].net += r.net;
      }
    });
    return Object.values(g);
  }, [results, aralik]);

  const maksSoru = Math.max(10, ...gunluk.map((d) => d.soru));

  const dersPerformans = useMemo(() => {
    const g = {};
    results.forEach((r) => {
      const k = r.subjectName || 'Genel';
      if (!g[k]) g[k] = { total: 0, correct: 0, wrong: 0, net: 0, test: 0 };
      g[k].total += r.total; g[k].correct += r.correct; g[k].wrong += r.wrong; g[k].net += r.net; g[k].test += 1;
    });
    return Object.entries(g)
      .map(([ad, v]) => ({ ad, ...v, basari: v.total ? v.correct / v.total : 0 }))
      .sort((a, b) => b.total - a.total);
  }, [results]);

  const enZayif = useMemo(() => dersPerformans.filter((d) => d.total >= 5).sort((a, b) => a.basari - b.basari)[0] || null, [dersPerformans]);

  const track = TRACKS.find((t) => t.id === profile.track) || TRACKS[0];
  const subjects = useMemo(() => getSubjects(track.id), [track.id]);
  const konuDagilim = subjects.map((s) => {
    const topics = s.topics || [];
    const biten = topics.filter((t) => doneTopics[t.id]).length;
    return { ad: s.name, biten, toplam: topics.length, color: s.color, oran: topics.length ? biten / topics.length : 0 };
  });

  const cozulenSoruSayisi = Object.keys(questionStats).length;

  return (
    <Screen>
      <Header title="İstatistikler" subtitle={aralik + ' günlük görünüm'} onBack={nav.canGoBack ? () => nav.pop() : undefined} />

      <View style={{ padding: space.lg }}>
        <View style={s.tabs}>
          {[7, 30, 90].map((n) => (
            <TouchableOpacity key={n} onPress={() => setAralik(n)} style={[s.tab, aralik === n && s.tabActive]}>
              <Text style={[s.tabTxt, aralik === n && { color: colors.ink }]}>{n} gün</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.grid}>
          <View style={s.kpi}><Text style={s.kpiVal}>{toplamSoru}</Text><Text style={s.kpiLbl}>çözülen soru</Text></View>
          <View style={s.kpi}><Text style={s.kpiVal}>{toplamNet.toFixed(1)}</Text><Text style={s.kpiLbl}>toplam net</Text></View>
          <View style={s.kpi}><Text style={s.kpiVal}>{(basari * 100).toFixed(0)}%</Text><Text style={s.kpiLbl}>doğruluk</Text></View>
          <View style={s.kpi}><Text style={s.kpiVal}>{ortalamaNet.toFixed(1)}</Text><Text style={s.kpiLbl}>test başına net</Text></View>
        </View>

        <Card>
          <Text style={s.cardHead}>Günlük soru grafiği</Text>
          <View style={s.chart}>
            {gunluk.map((d, i) => (
              <View key={i} style={s.barWrap}>
                <Text style={s.barVal}>{d.soru || ''}</Text>
                <View style={[s.bar, { height: Math.max(3, (d.soru / maksSoru) * 100), backgroundColor: d.soru ? colors.primary : colors.surface2 }]} />
                <Text style={s.barLbl}>{d.label}</Text>
              </View>
            ))}
          </View>
          <Text style={s.chartNote}>Toplam {toplamSoru} soru · {toplamYanlis} yanlış</Text>
        </Card>

        <Card>
          <Text style={s.cardHead}>Çalışma serisi</Text>
          <View style={s.rowBetween}>
            <Text style={s.bigVal}>{streak.count || 0} gün</Text>
            <Text style={s.small}>Toplam {Math.round(studyMinutes)} dakika çalışma</Text>
          </View>
          <Text style={[s.small, { marginTop: 8, lineHeight: 18 }]}>
            Seri, her gün en az bir test çözdüğünde artar. Bir gün atlarsan seri baştan başlar; düzen, yoğunluktan daha önemlidir.
          </Text>
        </Card>

        {enZayif ? (
          <Card tone="accent">
            <Text style={s.cardHead}>Öncelikli çalışman gereken ders</Text>
            <Text style={s.bigVal}>{enZayif.ad}</Text>
            <Text style={[s.small, { marginTop: 6, lineHeight: 18 }]}>
              {enZayif.test} testte %{(enZayif.basari * 100).toFixed(0)} doğruluk. Bu derste konu anlatımını tekrar edip günde 20 soru çözerek net artışı sağlayabilirsin.
            </Text>
            <Btn label="Bu dersin konularına git" kind="accent" onPress={() => nav.push('Subjects')} style={{ marginTop: 12 }} />
          </Card>
        ) : null}

        <Card>
          <Text style={s.cardHead}>Derslere göre performans</Text>
          {dersPerformans.length === 0 ? (
            <Text style={s.small}>Henüz test sonucu yok. Test çözüp kaydettiğinde bu tablo dolmaya başlar.</Text>
          ) : (
            dersPerformans.map((d) => (
              <View key={d.ad} style={s.perfRow}>
                <Text style={s.perfName} numberOfLines={1}>{d.ad}</Text>
                <View style={{ flex: 1, marginHorizontal: 10 }}>
                  <ProgressBar value={d.basari} color={d.basari >= 0.6 ? colors.success : d.basari >= 0.4 ? colors.accent : colors.danger} height={6} />
                </View>
                <Text style={s.perfVal}>{d.correct}/{d.total}</Text>
              </View>
            ))
          )}
        </Card>

        <Card>
          <Text style={s.cardHead}>Konu tamamlama durumu</Text>
          {konuDagilim.map((k) => (
            <View key={k.ad} style={s.perfRow}>
              <Text style={s.perfName} numberOfLines={1}>{k.ad}</Text>
              <View style={{ flex: 1, marginHorizontal: 10 }}>
                <ProgressBar value={k.oran} color={k.color} height={6} />
              </View>
              <Text style={s.perfVal}>{k.biten}/{k.toplam}</Text>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={s.cardHead}>Test geçmişi</Text>
          {results.length === 0 ? (
            <Text style={s.small}>Kayıtlı test yok.</Text>
          ) : (
            results.slice(0, 12).map((r) => (
              <View key={r.id} style={s.histRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.histName}>{r.subjectName}</Text>
                  <Text style={s.small}>{new Date(r.date).toLocaleString('tr-TR')}</Text>
                </View>
                <Text style={[s.histNet, { color: r.net >= r.total * 0.5 ? colors.success : colors.accent }]}>{r.net.toFixed(2)}</Text>
              </View>
            ))
          )}
        </Card>

        <Text style={s.foot}>Tekrar denenen soru sayısı: {cozulenSoruSayisi}</Text>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  tabs: { flexDirection: 'row', backgroundColor: colors.surface2, borderRadius: radius.pill, padding: 4, marginBottom: space.md },
  tab: { flex: 1, paddingVertical: 9, borderRadius: radius.pill, alignItems: 'center' },
  tabActive: { backgroundColor: colors.surface },
  tabTxt: { fontSize: 12.5, fontWeight: '700', color: colors.muted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: space.md },
  kpi: { width: '48.5%', backgroundColor: colors.surface, borderRadius: radius.md, padding: space.md, borderWidth: 1, borderColor: colors.line },
  kpiVal: { fontSize: 21, fontWeight: '900', color: colors.ink },
  kpiLbl: { ...type.small, marginTop: 3 },
  cardHead: { ...type.label, marginBottom: space.md },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 128, marginTop: 4 },
  barWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '62%', borderRadius: 4, minHeight: 3 },
  barVal: { fontSize: 9, color: colors.muted, marginBottom: 3, fontWeight: '700' },
  barLbl: { fontSize: 9.5, color: colors.muted, marginTop: 5, fontWeight: '700' },
  chartNote: { ...type.small, marginTop: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  bigVal: { fontSize: 24, fontWeight: '900', color: colors.ink },
  small: { ...type.small },
  perfRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  perfName: { ...type.body, fontSize: 12.5, width: 104 },
  perfVal: { ...type.small, fontWeight: '800', width: 46, textAlign: 'right' },
  histRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.line },
  histName: { ...type.h3, fontSize: 13.5 },
  histNet: { fontSize: 15, fontWeight: '900' },
  foot: { ...type.small, textAlign: 'center', marginTop: space.lg },
});
