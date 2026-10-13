import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { colors, space, radius, type } from '../theme';
import { Screen, Header, Empty, Pill } from '../ui';
import { useNav } from '../nav';
import { getSubjects, questionsForSubject } from '../data';
import SORULAR from '../data/sorular.json';

function normalize(t) {
  return (t || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i').replace(/İ/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g')
    .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/â/g, 'a');
}

export default function Search() {
  const nav = useNav();
  const [q, setQ] = useState('');
  const [sekme, setSekme] = useState('konu');

  const tumDersler = useMemo(() => {
    const hepsi = [];
    ['tyt', 'ayt-say', 'ayt-ea', 'ayt-soz'].forEach((t) => getSubjects(t).forEach((s) => hepsi.push(s)));
    const benzersiz = [];
    const gorulen = new Set();
    hepsi.forEach((s) => {
      const anahtar = s.name;
      if (!gorulen.has(anahtar)) { gorulen.add(anahtar); benzersiz.push(s); }
    });
    return benzersiz;
  }, []);

  const nq = normalize(q);

  const konuSonuc = useMemo(() => {
    if (nq.length < 2) return [];
    const out = [];
    tumDersler.forEach((s) => {
      (s.topics || []).forEach((t) => {
        const altEslesme = t.subs.filter((sb) => normalize(sb).includes(nq));
        if (normalize(t.name).includes(nq) || altEslesme.length) {
          out.push({ subject: s, topic: t, altEslesme });
        }
      });
    });
    return out.slice(0, 40);
  }, [nq, tumDersler]);

  const soruSonuc = useMemo(() => {
    if (nq.length < 3) return [];
    return SORULAR.filter((x) => normalize(x.text).includes(nq) || normalize(x.topic).includes(nq)).slice(0, 25);
  }, [nq]);

  const dersSonuc = useMemo(() => {
    if (nq.length < 2) return [];
    return tumDersler.filter((s) => normalize(s.name).includes(nq));
  }, [nq, tumDersler]);

  return (
    <Screen>
      <Header title="Ara" subtitle="Konu, alt başlık, ders veya soru" onBack={() => nav.pop()} />
      <View style={{ padding: space.lg }}>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Örn. logaritma, paragraf, üçgende açılar…"
          placeholderTextColor={colors.muted}
          autoFocus
          style={s.input}
        />

        <View style={s.tabs}>
          {[{ id: 'konu', label: 'Konular' }, { id: 'soru', label: 'Sorular' }].map((t) => (
            <TouchableOpacity key={t.id} onPress={() => setSekme(t.id)} style={[s.tab, sekme === t.id && s.tabActive]}>
              <Text style={[s.tabTxt, sekme === t.id && { color: colors.ink }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {nq.length < 2 ? (
          <Empty icon="🔍" title="Aramaya başla" desc="En az iki harf yaz. Türkçe karakterler olmadan da arayabilirsin: 'olcu' yazdığında 'ölçü' sonuçlarını da bulur." />
        ) : sekme === 'konu' ? (
          <>
            {dersSonuc.length ? (
              <>
                <Text style={s.groupTitle}>Dersler</Text>
                {dersSonuc.map((s2) => (
                  <TouchableOpacity key={s2.id} onPress={() => nav.push('SubjectDetail', { subjectId: s2.id, trackId: s2.track })} style={s.row}>
                    <Text style={s.rowIcon}>{s2.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.rowTitle}>{s2.name}</Text>
                      <Text style={s.rowSub}>{(s2.topics || []).length} konu</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            ) : null}

            <Text style={s.groupTitle}>Konular ({konuSonuc.length})</Text>
            {konuSonuc.length === 0 ? (
              <Empty icon="🤷" title="Sonuç yok" desc="Farklı bir kelime dene veya Türkçe karakter kullanmadan ara." />
            ) : (
              konuSonuc.map((r, i) => (
                <TouchableOpacity key={r.topic.id + i} onPress={() => nav.push('TopicDetail', { subjectId: r.subject.id, topicId: r.topic.id, trackId: r.subject.track })} style={s.row}>
                  <View style={[s.dot, { backgroundColor: r.subject.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.rowTitle}>{r.topic.name}</Text>
                    <Text style={s.rowSub}>{r.subject.name}</Text>
                    {r.altEslesme.length ? <Text style={s.rowAlt}>• {r.altEslesme.slice(0, 2).join('  •  ')}</Text> : null}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        ) : (
          <>
            <Text style={s.groupTitle}>Sorular ({soruSonuc.length})</Text>
            {nq.length < 3 ? (
              <Empty icon="✏️" title="Biraz daha yaz" desc="Soru araması için en az üç harf gir." />
            ) : soruSonuc.length === 0 ? (
              <Empty icon="🤷" title="Eşleşen soru yok" desc="Farklı bir kelime dene." />
            ) : (
              soruSonuc.map((x) => (
                <View key={x.id} style={s.qRow}>
                  <Pill label={x.subjectName} color={colors.primary} bg={colors.primarySoft} />
                  <Text style={s.qText} numberOfLines={3}>{x.text}</Text>
                  <Text style={s.qTopic}>{x.topic}</Text>
                </View>
              ))
            )}
          </>
        )}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  input: { backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 13, color: colors.ink, borderWidth: 1.5, borderColor: colors.line, fontSize: 15 },
  tabs: { flexDirection: 'row', backgroundColor: colors.surface2, borderRadius: radius.pill, padding: 4, marginTop: space.md, marginBottom: space.md },
  tab: { flex: 1, paddingVertical: 9, borderRadius: radius.pill, alignItems: 'center' },
  tabActive: { backgroundColor: colors.surface },
  tabTxt: { fontSize: 12.5, fontWeight: '700', color: colors.muted },
  groupTitle: { ...type.label, marginTop: space.md, marginBottom: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: space.md, marginBottom: space.sm, borderWidth: 1, borderColor: colors.line },
  rowIcon: { fontSize: 18, marginRight: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  rowTitle: { ...type.h3, fontSize: 14.5 },
  rowSub: { ...type.small, marginTop: 2 },
  rowAlt: { ...type.small, marginTop: 3, color: colors.inkSoft },
  qRow: { backgroundColor: colors.surface, borderRadius: radius.md, padding: space.md, marginBottom: space.sm, borderWidth: 1, borderColor: colors.line },
  qText: { ...type.body, fontSize: 13.5, marginTop: 8, lineHeight: 19 },
  qTopic: { ...type.small, marginTop: 6 },
});
