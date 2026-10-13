import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, space, radius, type } from '../theme';
import { Screen, Header, Card, Btn, Empty, Pill, ProgressBar } from '../ui';
import { useNav } from '../nav';
import { useStore } from '../store';
import SORULAR from '../data/sorular.json';

const HARFLER = ['A', 'B', 'C', 'D', 'E'];

export default function WrongBook() {
  const nav = useNav();
  const store = useStore();
  const { questionStats } = store.state;

  const [aktif, setAktif] = useState(null);   // tekrar cozulen soru
  const [secim, setSecim] = useState(null);
  const [sonuc, setSonuc] = useState(null);

  const yanlislar = useMemo(() => {
    return SORULAR.filter((q) => questionStats[q.id] && questionStats[q.id].wrong > 0).map((q) => ({
      ...q,
      stat: questionStats[q.id],
    }));
  }, [questionStats]);

  const cozulenler = useMemo(() => {
    return SORULAR.filter((q) => questionStats[q.id]).map((q) => ({ ...q, stat: questionStats[q.id] }));
  }, [questionStats]);

  const dersGruplari = useMemo(() => {
    const g = {};
    yanlislar.forEach((q) => {
      g[q.subjectName] = (g[q.subjectName] || 0) + 1;
    });
    return Object.entries(g).sort((a, b) => b[1] - a[1]);
  }, [yanlislar]);

  const dogruOran = cozulenler.length
    ? cozulenler.reduce((a, q) => a + q.stat.correct, 0) / cozulenler.reduce((a, q) => a + q.stat.correct + q.stat.wrong, 0)
    : 0;

  if (aktif) {
    return (
      <Screen>
        <Header title="Tekrar çözümü" subtitle={aktif.subjectName + ' · ' + aktif.topic} onBack={() => { setAktif(null); setSecim(null); setSonuc(null); }} />
        <View style={{ padding: space.lg }}>
          <Card>
            <Text style={s.qText}>{aktif.text}</Text>
            {aktif.options.map((o, k) => {
              const dogru = k === aktif.answer;
              const secili = secim === k;
              const goster = sonuc !== null;
              return (
                <TouchableOpacity
                  key={k}
                  disabled={goster}
                  onPress={() => setSecim(k)}
                  style={[
                    s.optRow,
                    secili && !goster && { borderColor: colors.primary, backgroundColor: colors.primarySoft },
                    goster && dogru && { borderColor: colors.success, backgroundColor: colors.successSoft },
                    goster && secili && !dogru && { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
                  ]}
                >
                  <Text style={s.harf}>{HARFLER[k]}</Text>
                  <Text style={s.optTxt}>{o}</Text>
                </TouchableOpacity>
              );
            })}
          </Card>
          {sonuc === null ? (
            <Btn label="Cevabı kontrol et" kind="primary" onPress={() => setSonuc(secim === aktif.answer)} disabled={secim === null} />
          ) : (
            <>
              <Card tone={sonuc ? 'primary' : 'accent'}>
                <Text style={s.resTitle}>{sonuc ? 'Doğru! Bu soruyu artık biliyorsun.' : 'Hâlâ yanlış. Konu anlatımına dönmen gerek.'}</Text>
                <Text style={s.explain}>{aktif.explain}</Text>
              </Card>
              <Btn label="Listeye dön" kind="ghost" onPress={() => { setAktif(null); setSecim(null); setSonuc(null); }} />
            </>
          )}
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Yanlış defteri" subtitle={yanlislar.length + ' soru tekrar bekliyor'} onBack={nav.canGoBack ? () => nav.pop() : undefined} />
      <View style={{ padding: space.lg }}>
        {cozulenler.length ? (
          <Card>
            <Text style={s.cardHead}>Genel doğruluk oranın</Text>
            <View style={s.rowBetween}>
              <Text style={[s.bigPct, { color: dogruOran >= 0.6 ? colors.success : colors.accent }]}>{(dogruOran * 100).toFixed(0)}%</Text>
              <Text style={s.small}>{cozulenler.reduce((a, q) => a + q.stat.correct + q.stat.wrong, 0)} soru denemesi</Text>
            </View>
            <ProgressBar value={dogruOran} color={dogruOran >= 0.6 ? colors.success : colors.accent} style={{ marginTop: 10 }} />
          </Card>
        ) : null}

        {dersGruplari.length ? (
          <Card>
            <Text style={s.cardHead}>Derslere göre yanlış dağılımı</Text>
            {dersGruplari.map(([ad, sayi]) => (
              <View key={ad} style={s.distRow}>
                <Text style={s.distName}>{ad}</Text>
                <View style={{ flex: 1, marginHorizontal: 10 }}>
                  <ProgressBar value={sayi / yanlislar.length} color={colors.danger} height={6} />
                </View>
                <Text style={s.distVal}>{sayi}</Text>
              </View>
            ))}
          </Card>
        ) : null}

        {yanlislar.length === 0 ? (
          <Empty
            icon="🎉"
            title="Yanlış defterin boş"
            desc="Henüz yanlışın yok ya da test çözmedin. Test çözüp sonucu kaydettiğinde yanlışların burada otomatik birikir."
          />
        ) : (
          <>
            <Text style={s.listTitle}>Tekrar edilecek sorular</Text>
            {yanlislar.map((q) => (
              <TouchableOpacity key={q.id} onPress={() => { setAktif(q); setSecim(null); setSonuc(null); }} style={s.qRow} activeOpacity={0.85}>
                <View style={{ flex: 1 }}>
                  <Text style={s.qRowSubject}>{q.subjectName} · {q.topic}</Text>
                  <Text style={s.qRowText} numberOfLines={2}>{q.text}</Text>
                </View>
                <View style={s.badge}>
                  <Text style={s.badgeTxt}>{q.stat.wrong}✗</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  cardHead: { ...type.label, marginBottom: space.md },
  rowBetween: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  bigPct: { fontSize: 30, fontWeight: '900' },
  small: { ...type.small },
  distRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 9 },
  distName: { ...type.body, fontSize: 13, width: 120 },
  distVal: { ...type.small, fontWeight: '800', width: 22, textAlign: 'right' },
  listTitle: { ...type.label, marginTop: space.lg, marginBottom: space.sm },
  qRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: space.md, marginBottom: space.sm, borderWidth: 1, borderColor: colors.line },
  qRowSubject: { ...type.small, color: colors.primary, fontWeight: '700' },
  qRowText: { ...type.body, fontSize: 13.5, marginTop: 4, lineHeight: 19 },
  badge: { marginLeft: 10, backgroundColor: colors.dangerSoft, paddingHorizontal: 9, paddingVertical: 5, borderRadius: radius.pill },
  badgeTxt: { color: colors.danger, fontSize: 11.5, fontWeight: '900' },
  qText: { ...type.body, fontSize: 16, color: colors.ink, lineHeight: 24, marginBottom: space.lg, fontWeight: '600' },
  optRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 12, borderRadius: radius.sm, marginBottom: 8, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.surface2 },
  harf: { fontSize: 12.5, fontWeight: '900', color: colors.muted, marginRight: 10, width: 14 },
  optTxt: { ...type.body, flex: 1, fontSize: 14, lineHeight: 20 },
  resTitle: { ...type.h3, marginBottom: 8 },
  explain: { ...type.body, fontSize: 14, lineHeight: 21 },
});
