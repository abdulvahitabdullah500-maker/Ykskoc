import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, space, radius, type, TRACKS } from '../theme';
import { Screen, Card, Btn, Ring, SectionTitle, ProgressBar, IconBubble } from '../ui';
import { useNav } from '../nav';
import { useStore, netHesapla } from '../store';
import { getSubjects, countTopics, countSubtopics } from '../data';

function gunFarki(tarihStr) {
  if (!tarihStr) return null;
  const parca = tarihStr.split(/[.\/\-]/);
  if (parca.length !== 3) return null;
  const yil = parseInt(parca[2].length === 2 ? '20' + parca[2] : parca[2], 10);
  const ay = parseInt(parca[1], 10) - 1;
  const gun = parseInt(parca[0], 10);
  const hedef = new Date(yil, ay, gun);
  if (isNaN(hedef.getTime())) return null;
  const fark = Math.ceil((hedef - new Date()) / 86400000);
  return fark;
}

export default function Home() {
  const nav = useNav();
  const store = useStore();
  const { profile, doneTopics, results, streak, studyMinutes } = store.state;
  const track = TRACKS.find((t) => t.id === profile.track) || TRACKS[0];

  const subjects = useMemo(() => getSubjects(track.id), [track.id]);
  const toplamKonu = useMemo(() => countTopics(track.id), [track.id]);
  const toplamAlt = useMemo(() => countSubtopics(track.id), [track.id]);

  const tumKonuIdleri = useMemo(() => {
    const ids = [];
    subjects.forEach((s) => (s.topics || []).forEach((t) => ids.push(t.id)));
    return ids;
  }, [subjects]);

  const biten = tumKonuIdleri.filter((id) => doneTopics[id]).length;
  const oran = tumKonuIdleri.length ? biten / tumKonuIdleri.length : 0;

  const bugun = new Date().toDateString();
  const bugunTest = results.filter((r) => new Date(r.date).toDateString() === bugun);
  const bugunSoru = bugunTest.reduce((a, r) => a + (r.total || 0), 0);
  const bugunNet = bugunTest.reduce((a, r) => a + (r.net || 0), 0);
  const hedefOran = profile.dailyTarget ? bugunSoru / profile.dailyTarget : 0;

  const sonTestler = results.slice(0, 3);
  const kalanGun = gunFarki(profile.examDate);

  const yanlisSayisi = results.reduce((a, r) => a + (r.wrong || 0), 0);

  return (
    <Screen>
      <LinearGradient colors={['#17264A', '#0B1220']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
        <View style={s.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={s.hi}>{profile.name ? 'Merhaba, ' + profile.name : 'Merhaba öğrenci'}</Text>
            <Text style={s.heroTitle}>{track.name} hazırlığı</Text>
            <Text style={s.heroSub}>{track.long}</Text>
          </View>
          <TouchableOpacity style={s.searchBtn} onPress={() => nav.push('Search')} accessibilityLabel="Ara">
            <Text style={{ fontSize: 17 }}>🔍</Text>
          </TouchableOpacity>
        </View>

        <View style={s.heroStats}>
          <View style={s.heroStat}>
            <Text style={s.heroStatVal}>{streak.count || 0}</Text>
            <Text style={s.heroStatLbl}>gün seri</Text>
          </View>
          <View style={s.heroDivider} />
          <View style={s.heroStat}>
            <Text style={s.heroStatVal}>{bugunSoru}</Text>
            <Text style={s.heroStatLbl}>bugün soru</Text>
          </View>
          <View style={s.heroDivider} />
          <View style={s.heroStat}>
            <Text style={s.heroStatVal}>{bugunNet.toFixed(1)}</Text>
            <Text style={s.heroStatLbl}>bugün net</Text>
          </View>
          <View style={s.heroDivider} />
          <View style={s.heroStat}>
            <Text style={s.heroStatVal}>{Math.round(studyMinutes)}</Text>
            <Text style={s.heroStatLbl}>dk çalışma</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: space.lg, marginTop: space.lg }}>
        <Card style={s.progressCard}>
          <Ring size={112} stroke={11} progress={oran} color={track.color}>
            <Text style={s.ringVal}>{(oran * 100).toFixed(0)}%</Text>
            <Text style={s.ringLbl}>konu</Text>
          </Ring>
          <View style={{ flex: 1, marginLeft: space.lg }}>
            <Text style={s.cardTitle}>Konu ilerlemen</Text>
            <Text style={s.cardSub}>{biten} / {tumKonuIdleri.length} konu tamamlandı</Text>
            <Text style={[s.cardSub, { marginTop: 8 }]}>
              {toplamAlt} alt başlık, {toplamKonu} ana konu
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 14 }}>
              <Btn label="Konulara git" onPress={() => nav.push('Subjects')} style={{ paddingVertical: 10, paddingHorizontal: 14 }} />
            </View>
          </View>
        </Card>

        <Card>
          <View style={s.rowBetween}>
            <Text style={s.cardTitle}>Günlük soru hedefi</Text>
            <Text style={s.cardSub}>{bugunSoru} / {profile.dailyTarget}</Text>
          </View>
          <ProgressBar value={hedefOran} color={hedefOran >= 1 ? colors.success : colors.accent} style={{ marginTop: 10 }} height={9} />
          <Text style={[s.cardSub, { marginTop: 8 }]}>
            {hedefOran >= 1 ? 'Hedefini tamamladın, harika!' : 'Hedefe ' + Math.max(0, profile.dailyTarget - bugunSoru) + ' soru kaldı.'}
          </Text>
        </Card>

        {kalanGun !== null ? (
          <Card tone="accent">
            <View style={s.rowBetween}>
              <View>
                <Text style={s.cardTitle}>Sınava kalan süre</Text>
                <Text style={s.cardSub}>Hedef tarih: {profile.examDate}</Text>
              </View>
              <Text style={s.bigDays}>{kalanGun > 0 ? kalanGun : 0}</Text>
            </View>
          </Card>
        ) : null}

        <SectionTitle>Hızlı işlemler</SectionTitle>
        <View style={s.grid}>
          {[
            { icon: '📝', label: 'Test çöz', route: 'TestSetup', tone: colors.primary },
            { icon: '❌', label: 'Yanlış defteri', route: 'WrongBook', tone: colors.danger },
            { icon: '⏱️', label: 'Pomodoro', route: 'Pomodoro', tone: colors.accent },
            { icon: '📈', label: 'İstatistik', route: 'Stats', tone: colors.success },
          ].map((x) => (
            <TouchableOpacity key={x.label} style={s.tile} onPress={() => nav.push(x.route)} activeOpacity={0.85}>
              <IconBubble color={x.tone} size={44}>{x.icon}</IconBubble>
              <Text style={s.tileLbl}>{x.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <SectionTitle right={<TouchableOpacity onPress={() => nav.push('Tracks')}><Text style={s.link}>Alan değiştir</Text></TouchableOpacity>}>
          Alanlar
        </SectionTitle>
        <View style={{ paddingHorizontal: space.lg }}>
          {TRACKS.map((t) => (
            <TouchableOpacity key={t.id} style={[s.trackRow, profile.track === t.id && { borderColor: t.color }]} onPress={() => { store.setProfile({ track: t.id }); nav.push('Subjects'); }} activeOpacity={0.85}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>{t.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.trackName}>{t.name}</Text>
                <Text style={s.cardSub}>{t.questions} soru · {t.minutes} dk</Text>
              </View>
              {profile.track === t.id ? <Text style={{ color: t.color, fontWeight: '900' }}>AKTİF</Text> : null}
            </TouchableOpacity>
          ))}
        </View>

        {sonTestler.length ? (
          <>
            <SectionTitle right={<TouchableOpacity onPress={() => nav.push('Stats')}><Text style={s.link}>Tümü</Text></TouchableOpacity>}>
              Son testler
            </SectionTitle>
            <View style={{ paddingHorizontal: space.lg }}>
              {sonTestler.map((r) => (
                <View key={r.id} style={s.resultRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.trackName}>{r.subjectName || 'Genel test'}</Text>
                    <Text style={s.cardSub}>{new Date(r.date).toLocaleDateString('tr-TR')} · {r.total} soru</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[s.netVal, { color: r.net >= r.total * 0.5 ? colors.success : colors.accent }]}>{r.net.toFixed(2)} net</Text>
                    <Text style={s.cardSub}>{r.correct}D {r.wrong}Y {r.empty}B</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {yanlisSayisi > 0 ? (
          <Card tone="primary" style={{ marginTop: space.lg }}>
            <Text style={s.cardTitle}>Tekrar zamanı</Text>
            <Text style={[s.cardSub, { marginTop: 4 }]}>
              Şimdiye kadar {yanlisSayisi} yanlışın kaydedildi. Yanlış defterindeki soruları tekrar çözmek, net artışının en hızlı yoludur.
            </Text>
            <Btn label="Yanlış defterini aç" kind="primary" onPress={() => nav.push('WrongBook')} style={{ marginTop: 12 }} />
          </Card>
        ) : null}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  hero: { paddingTop: 58, paddingBottom: 22, paddingHorizontal: space.lg, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start' },
  hi: { ...type.small, color: colors.inkSoft, marginBottom: 2 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: colors.ink, letterSpacing: -0.4 },
  heroSub: { ...type.small, marginTop: 4 },
  searchBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.10)', alignItems: 'center', justifyContent: 'center' },
  heroStats: { flexDirection: 'row', alignItems: 'center', marginTop: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: radius.md, paddingVertical: 12 },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatVal: { fontSize: 18, fontWeight: '900', color: colors.ink },
  heroStatLbl: { fontSize: 10, color: colors.muted, marginTop: 2, fontWeight: '600' },
  heroDivider: { width: 1, height: 26, backgroundColor: colors.line },
  progressCard: { flexDirection: 'row', alignItems: 'center' },
  ringVal: { fontSize: 22, fontWeight: '900', color: colors.ink },
  ringLbl: { fontSize: 10, color: colors.muted, fontWeight: '700' },
  cardTitle: { ...type.h3, fontSize: 15.5 },
  cardSub: { ...type.small, marginTop: 3, lineHeight: 18 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bigDays: { fontSize: 32, fontWeight: '900', color: colors.accent },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: space.lg, gap: 10 },
  tile: { width: '48%', backgroundColor: colors.surface, borderRadius: radius.md, padding: space.md, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center' },
  tileLbl: { ...type.h3, fontSize: 13.5, marginLeft: 10, flex: 1 },
  link: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  trackRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: space.md, marginBottom: space.sm, borderWidth: 1.5, borderColor: colors.line },
  trackName: { ...type.h3, fontSize: 14.5 },
  resultRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: space.md, marginBottom: space.sm, borderWidth: 1, borderColor: colors.line },
  netVal: { fontSize: 15, fontWeight: '900' },
});
