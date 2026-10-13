import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, space, radius, type } from '../theme';
import { Screen, Header, Btn, Card, Ring, Pill } from '../ui';
import { useNav } from '../nav';
import { useStore } from '../store';

const MODLAR = {
  odak: { label: 'Odak', dk: 25, color: colors.primary },
  kisa: { label: 'Kısa mola', dk: 5, color: colors.success },
  uzun: { label: 'Uzun mola', dk: 15, color: colors.violet },
};

export default function Pomodoro() {
  const nav = useNav();
  const store = useStore();
  const [mod, setMod] = useState('odak');
  const [kalan, setKalan] = useState(MODLAR.odak.dk * 60);
  const [calisiyor, setCalisiyor] = useState(false);
  const [tur, setTur] = useState(0);
  const ref = useRef(null);

  const toplam = MODLAR[mod].dk * 60;
  const oran = 1 - kalan / toplam;

  useEffect(() => {
    if (!calisiyor) return;
    ref.current = setInterval(() => {
      setKalan((k) => {
        if (k <= 1) {
          clearInterval(ref.current);
          setCalisiyor(false);
          if (mod === 'odak') {
            store.addStudyMinutes(MODLAR.odak.dk);
            setTur((t) => t + 1);
          }
          return 0;
        }
        return k - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [calisiyor, mod]);

  const modSec = (m) => {
    clearInterval(ref.current);
    setCalisiyor(false);
    setMod(m);
    setKalan(MODLAR[m].dk * 60);
  };

  const sifirla = () => {
    clearInterval(ref.current);
    setCalisiyor(false);
    setKalan(toplam);
  };

  const dakika = Math.floor(kalan / 60);
  const saniye = kalan % 60;

  return (
    <Screen>
      <Header title="Pomodoro" subtitle="25 dakika odak · 5 dakika mola" onBack={() => nav.pop()} />
      <View style={{ padding: space.lg, alignItems: 'center' }}>
        <View style={s.modRow}>
          {Object.entries(MODLAR).map(([k, v]) => (
            <TouchableOpacity key={k} onPress={() => modSec(k)} style={[s.mod, mod === k && { backgroundColor: v.color + '22', borderColor: v.color }]}>
              <Text style={[s.modTxt, mod === k && { color: v.color }]}>{v.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginTop: space.xl }}>
          <Ring size={230} stroke={16} progress={oran} color={MODLAR[mod].color}>
            <Text style={s.time}>{dakika}:{String(saniye).padStart(2, '0')}</Text>
            <Text style={s.timeLbl}>{MODLAR[mod].label} süresi</Text>
          </Ring>
        </View>

        <View style={s.btns}>
          <Btn label={calisiyor ? 'Duraklat' : 'Başlat'} kind={calisiyor ? 'accent' : 'success'} onPress={() => setCalisiyor((c) => !c)} style={{ flex: 1, marginRight: 10 }} />
          <Btn label="Sıfırla" kind="ghost" onPress={sifirla} style={{ flex: 1 }} />
        </View>

        <Card style={{ width: '100%', marginTop: space.xl }}>
          <Text style={s.cardHead}>Bugünkü pomodoro</Text>
          <View style={s.rowBetween}>
            <Text style={s.bigVal}>{store.state.pomodoro}</Text>
            <Pill label={'Toplam ' + Math.round(store.state.studyMinutes) + ' dk'} color={colors.primary} bg={colors.primarySoft} />
          </View>
          <Text style={s.note}>
            Tamamlanan her odak turu toplam çalışma süresine eklenir. Bu tur: {tur}
          </Text>
        </Card>

        <Card style={{ width: '100%' }}>
          <Text style={s.cardHead}>Nasıl çalışır?</Text>
          {[
            '25 dakika boyunca yalnızca tek bir konuya odaklan, telefonu ters çevir.',
            '5 dakikalık molada ekrana bakma; su iç, kısa yürüyüş yap.',
            'Dört turdan sonra 15 dakikalık uzun mola ver.',
            'Her turdan sonra kaç soru çözdüğünü not et; bu, hedefini gerçekçi ayarlamanı sağlar.',
          ].map((x, i) => (
            <View key={i} style={s.bulletRow}>
              <Text style={s.num}>{i + 1}.</Text>
              <Text style={s.bulletTxt}>{x}</Text>
            </View>
          ))}
        </Card>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  modRow: { flexDirection: 'row', gap: 8, width: '100%' },
  mod: { flex: 1, paddingVertical: 10, borderRadius: radius.pill, alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.line },
  modTxt: { fontSize: 12, fontWeight: '700', color: colors.inkSoft },
  time: { fontSize: 46, fontWeight: '900', color: colors.ink, letterSpacing: -1.5 },
  timeLbl: { ...type.small, marginTop: 2 },
  btns: { flexDirection: 'row', width: '100%', marginTop: space.xl },
  cardHead: { ...type.label, marginBottom: space.md },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bigVal: { fontSize: 28, fontWeight: '900', color: colors.ink },
  note: { ...type.small, marginTop: 10, lineHeight: 18 },
  bulletRow: { flexDirection: 'row', marginBottom: 9 },
  num: { color: colors.primary, fontWeight: '900', marginRight: 8, fontSize: 12.5 },
  bulletTxt: { ...type.body, flex: 1, fontSize: 13.5, lineHeight: 20 },
});
