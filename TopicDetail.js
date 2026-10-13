import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, space, radius, type } from '../theme';
import { Screen, Header, Btn, Pill, Card, Empty } from '../ui';
import { useNav } from '../nav';
import { useStore } from '../store';
import { findSubject, questionsForSubject } from '../data';
import KONU_ANLATIMI from '../data/konu_anlatimi.json';
import SORULAR from '../data/sorular.json';

export default function TopicDetail({ subjectId, topicId, trackId }) {
  const nav = useNav();
  const store = useStore();
  const subject = useMemo(() => findSubject(trackId, subjectId), [trackId, subjectId]);
  const topic = useMemo(() => {
    if (!subject || !subject.topics) return null;
    return subject.topics.find((t) => t.id === topicId) || null;
  }, [subject, topicId]);

  const icerik = KONU_ANLATIMI[topicId] || null;
  const sorular = useMemo(() => questionsForSubject(subject), [subject]);
  const ok = !!store.state.doneTopics[topicId];
  const [sekme, setSekme] = useState('anlatim');

  if (!topic || !subject) {
    return (
      <Screen>
        <Header title="Konu bulunamadı" onBack={() => nav.pop()} />
        <Empty icon="🔎" title="Bu konuya ulaşılamadı" desc="Alan veya ders değişmiş olabilir." />
      </Screen>
    );
  }

  const altBasliklar = (icerik && icerik.altbasliklar) || topic.subs;

  return (
    <Screen>
      <Header title={topic.name} subtitle={subject.name} onBack={() => nav.pop()} />
      <View style={{ padding: space.lg }}>
        <View style={s.badges}>
          <Pill label={altBasliklar.length + ' alt başlık'} color={subject.color} bg={subject.color + '22'} />
          <Pill label={sorular.length + ' soru'} color={colors.inkSoft} />
          {ok ? <Pill label="Tamamlandı" color={colors.success} bg={colors.successSoft} /> : null}
        </View>

        <View style={s.tabs}>
          {[
            { id: 'anlatim', label: 'Konu anlatımı' },
            { id: 'plan', label: 'Çalışma planı' },
          ].map((t) => (
            <TouchableOpacity key={t.id} onPress={() => setSekme(t.id)} style={[s.tab, sekme === t.id && s.tabActive]}>
              <Text style={[s.tabTxt, sekme === t.id && { color: colors.ink }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {sekme === 'anlatim' ? (
          <>
            <Card>
              <Text style={s.cardHead}>Alt başlıklar</Text>
              {altBasliklar.map((sb, i) => (
                <View key={i} style={s.bulletRow}>
                  <View style={[s.dot, { backgroundColor: subject.color }]} />
                  <Text style={s.bulletTxt}>{sb}</Text>
                </View>
              ))}
            </Card>

            {icerik && icerik.ozet && icerik.ozet.length ? (
              <Card>
                <Text style={s.cardHead}>Özet bilgi</Text>
                {icerik.ozet.map((o, i) => (
                  <View key={i} style={s.bulletRow}>
                    <Text style={[s.num, { color: subject.color }]}>{i + 1}.</Text>
                    <Text style={s.bulletTxt}>{o}</Text>
                  </View>
                ))}
              </Card>
            ) : null}

            {icerik && icerik.formul && icerik.formul.length ? (
              <Card tone="primary">
                <Text style={s.cardHead}>Bilmen gereken bağıntılar</Text>
                {icerik.formul.map((f, i) => (
                  <View key={i} style={s.formulRow}>
                    <Text style={s.formulTxt}>{f}</Text>
                  </View>
                ))}
              </Card>
            ) : null}

            {icerik && icerik.ornek ? (
              <Card>
                <Text style={s.cardHead}>Çözümlü örnek</Text>
                <Text style={s.ornekSoru}>{icerik.ornek.soru}</Text>
                <View style={s.ornekCozum}>
                  <Text style={s.ornekLabel}>ÇÖZÜM</Text>
                  <Text style={s.ornekCozumTxt}>{icerik.ornek.cozum}</Text>
                </View>
              </Card>
            ) : null}

            {icerik && icerik.puf && icerik.puf.length ? (
              <Card tone="accent">
                <Text style={s.cardHead}>Sınavda dikkat et</Text>
                {icerik.puf.map((p, i) => (
                  <View key={i} style={s.bulletRow}>
                    <Text style={[s.num, { color: colors.accent }]}>!</Text>
                    <Text style={s.bulletTxt}>{p}</Text>
                  </View>
                ))}
              </Card>
            ) : null}
          </>
        ) : (
          <>
            <Card>
              <Text style={s.cardHead}>Bu konuyu bitirme planı</Text>
              {[
                'Konu anlatımını oku ve alt başlıkların altını kendi cümlelerinle not al.',
                'Bilmen gereken bağıntıları ayrı bir karta yaz, her gün 2 dakika gözden geçir.',
                'Bu konudan en az 20 kolay-orta soru çöz, yanlışlarını konu adıyla kaydet.',
                'Yanlış defterindeki soruları 3 gün sonra tekrar çöz.',
                'Konu testini süre tutarak çöz ve netini istatistiklere kaydet.',
              ].map((x, i) => (
                <View key={i} style={s.bulletRow}>
                  <Text style={[s.num, { color: colors.primary }]}>{i + 1}.</Text>
                  <Text style={s.bulletTxt}>{x}</Text>
                </View>
              ))}
            </Card>
            <Card>
              <Text style={s.cardHead}>Önerilen süre</Text>
              <Text style={s.bulletTxt}>
                Konu anlatımı için 30-45 dakika, soru çözümü için 40-60 dakika ayır. Toplam 1,5 saatlik bir blok bu konu için yeterlidir; ancak blok sonunda mutlaka 10 dakika ara ver.
              </Text>
            </Card>
          </>
        )}

        <View style={s.actions}>
          <Btn label={ok ? '✓ Tamamlandı' : 'Tamamlandı olarak işaretle'} kind={ok ? 'success' : 'ghost'} onPress={() => store.toggleTopic(topicId)} style={{ flex: 1, marginRight: 8 }} />
          <Btn label="Soru çöz" kind="primary" onPress={() => nav.push('TestSetup', { subjectId, trackId, topicName: topic.name })} style={{ flex: 1 }} />
        </View>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  badges: { flexDirection: 'row', gap: 8, marginBottom: space.md, flexWrap: 'wrap' },
  tabs: { flexDirection: 'row', backgroundColor: colors.surface2, borderRadius: radius.pill, padding: 4, marginBottom: space.md },
  tab: { flex: 1, paddingVertical: 9, borderRadius: radius.pill, alignItems: 'center' },
  tabActive: { backgroundColor: colors.surface },
  tabTxt: { fontSize: 13, fontWeight: '700', color: colors.muted },
  cardHead: { ...type.label, marginBottom: space.md, color: colors.inkSoft },
  bulletRow: { flexDirection: 'row', marginBottom: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 7, marginRight: 10 },
  bulletTxt: { ...type.body, flex: 1, fontSize: 14, lineHeight: 21 },
  num: { fontSize: 13, fontWeight: '900', marginRight: 9, minWidth: 14 },
  formulRow: { backgroundColor: 'rgba(0,0,0,0.22)', borderRadius: radius.sm, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 8 },
  formulTxt: { color: colors.ink, fontSize: 14, fontWeight: '700', fontFamily: 'monospace' },
  ornekSoru: { ...type.body, fontSize: 14.5, color: colors.ink, lineHeight: 21, marginBottom: 12 },
  ornekCozum: { backgroundColor: colors.surface2, borderRadius: radius.sm, padding: space.md, borderLeftWidth: 3, borderLeftColor: colors.success },
  ornekLabel: { ...type.label, color: colors.success, marginBottom: 6 },
  ornekCozumTxt: { ...type.body, fontSize: 14, lineHeight: 21 },
  actions: { flexDirection: 'row', marginTop: space.sm },
});
