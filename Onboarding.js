import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, space, radius, type } from '../theme';
import { TRACKS } from '../theme';
import { Btn, Input, Screen } from '../ui';
import { useStore } from '../store';

export default function Onboarding() {
  const store = useStore();
  const [step, setStep] = useState(0);
  const [track, setTrack] = useState(null);
  const [name, setName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [dailyTarget, setDailyTarget] = useState('40');

  const finish = () => {
    store.setProfile({
      track: track || 'tyt',
      name: name.trim(),
      examDate: examDate.trim(),
      dailyTarget: parseInt(dailyTarget, 10) || 40,
      onboarded: true,
    });
  };

  return (
    <Screen scroll>
      <LinearGradient colors={['#16264A', '#0B1220']} style={s.hero}>
        <Text style={s.brand}>YKS KOÇ</Text>
        <Text style={s.title}>Üniversiteye giden yol,{`\n`}planlı çalışmaktan geçer.</Text>
        <Text style={s.sub}>Konu anlatımı, soru bankası, deneme testleri, yanlış defteri ve istatistikler tek uygulamada.</Text>
      </LinearGradient>

      <View style={{ padding: space.lg }}>
        {step === 0 ? (
          <>
            <Text style={s.stepTitle}>Hangi alana hazırlanıyorsun?</Text>
            <Text style={s.stepSub}>Alanını seç, ders listesi ona göre hazırlansın. Sonradan profilden değiştirebilirsin.</Text>
            {TRACKS.map((t) => {
              const active = track === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setTrack(t.id)}
                  activeOpacity={0.85}
                  style={[s.opt, active && { borderColor: t.color, backgroundColor: t.color + '1A' }]}
                >
                  <Text style={s.optIcon}>{t.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.optTitle}>{t.name}</Text>
                    <Text style={s.optSub}>{t.long}</Text>
                  </View>
                  <Text style={[s.check, { color: active ? t.color : colors.muted }]}>{active ? '✓' : '○'}</Text>
                </TouchableOpacity>
              );
            })}
            <Btn label="Devam" onPress={() => setStep(1)} disabled={!track} style={{ marginTop: space.lg }} />
          </>
        ) : step === 1 ? (
          <>
            <Text style={s.stepTitle}>Seni nasıl çağıralım?</Text>
            <Text style={s.stepSub}>İstersen boş bırak, uygulama seni öğrenci olarak selamlar.</Text>
            <Input label="Adın (isteğe bağlı)" placeholder="Örn. Ahmet" value={name} onChangeText={setName} />
            <Input
              label="Hedefin (isteğe bağlı)"
              placeholder="Örn. Bilgisayar Mühendisliği"
              value={store.state.profile.target}
              onChangeText={(v) => store.setProfile({ target: v })}
            />
            <Input label="Sınav tarihi (isteğe bağlı)" placeholder="GG.AA.YYYY" value={examDate} onChangeText={setExamDate} keyboardType="numbers-and-punctuation" />
            <Btn label="Devam" onPress={() => setStep(2)} style={{ marginTop: space.sm }} />
            <Btn label="Geri" kind="ghost" onPress={() => setStep(0)} style={{ marginTop: space.sm }} />
          </>
        ) : (
          <>
            <Text style={s.stepTitle}>Günlük soru hedefin</Text>
            <Text style={s.stepSub}>Gerçekçi bir hedef seç. Küçük ve düzenli çalışma, tek seferlik uzun çalışmadan daha etkilidir.</Text>
            <Input label="Günlük soru hedefi" value={dailyTarget} onChangeText={setDailyTarget} keyboardType="number-pad" />
            <View style={s.chips}>
              {['20', '40', '60', '100'].map((v) => (
                <TouchableOpacity key={v} onPress={() => setDailyTarget(v)} style={[s.chip, dailyTarget === v && s.chipActive]}>
                  <Text style={[s.chipTxt, dailyTarget === v && { color: '#fff' }]}>{v} soru</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Btn label="Başlayalım" kind="success" onPress={finish} style={{ marginTop: space.lg }} />
            <Btn label="Geri" kind="ghost" onPress={() => setStep(1)} style={{ marginTop: space.sm }} />
          </>
        )}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  hero: { paddingTop: 76, paddingBottom: 34, paddingHorizontal: space.lg, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  brand: { ...type.label, color: colors.primary, marginBottom: 14, fontSize: 12 },
  title: { fontSize: 27, fontWeight: '900', color: colors.ink, lineHeight: 34, letterSpacing: -0.5 },
  sub: { ...type.body, marginTop: 10, color: colors.inkSoft },
  stepTitle: { ...type.h2, marginBottom: 6 },
  stepSub: { ...type.small, marginBottom: space.lg, lineHeight: 19 },
  opt: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: space.lg, marginBottom: space.md, borderWidth: 1.5, borderColor: colors.line },
  optIcon: { fontSize: 24, marginRight: 12 },
  optTitle: { ...type.h3 },
  optSub: { ...type.small, marginTop: 2 },
  check: { fontSize: 18, fontWeight: '900' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.line },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipTxt: { fontSize: 13, fontWeight: '700', color: colors.inkSoft },
});
