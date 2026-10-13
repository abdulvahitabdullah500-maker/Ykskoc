import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { colors, space, radius, type, TRACKS } from '../theme';
import { Screen, Header, Card, Btn, Input, ListRow, IconBubble, Divider } from '../ui';
import { useNav } from '../nav';
import { useStore } from '../store';
import { bildirimIzniAl, gunlukHatirlatici, hatirlaticiKapat, notifyAvailable } from '../notify';

export default function Profile() {
  const nav = useNav();
  const store = useStore();
  const { profile, doneTopics, results, studyMinutes } = store.state;

  const [ad, setAd] = useState(profile.name || '');
  const [hedef, setHedef] = useState(profile.target || '');
  const [tarih, setTarih] = useState(profile.examDate || '');
  const [gunluk, setGunluk] = useState(String(profile.dailyTarget || 40));
  const [hatirlatici, setHatirlatici] = useState(false);
  const [kaydedildi, setKaydedildi] = useState(false);

  const kaydet = () => {
    store.setProfile({
      name: ad.trim(),
      target: hedef.trim(),
      examDate: tarih.trim(),
      dailyTarget: parseInt(gunluk, 10) || 40,
    });
    setKaydedildi(true);
    setTimeout(() => setKaydedildi(false), 1800);
  };

  const hatirlaticiDegistir = async (acik) => {
    setHatirlatici(acik);
    if (!notifyAvailable()) {
      Alert.alert('Bildirim kullanılamıyor', 'Bu derlemede bildirim modülü devre dışı. Bildirimleri açmak için expo-notifications paketinin kurulu olduğundan emin ol.');
      return;
    }
    if (acik) {
      const izin = await bildirimIzniAl();
      if (!izin) {
        Alert.alert('İzin verilmedi', 'Bildirim izni verilmediği için hatırlatıcı kurulamadı. Telefon ayarlarından uygulamaya bildirim izni verebilirsin.');
        setHatirlatici(false);
        return;
      }
      const ok = await gunlukHatirlatici(20, 0, 'Bugünkü soru hedefin seni bekliyor.');
      if (ok) Alert.alert('Hatırlatıcı kuruldu', 'Her gün 20:00\'de çalışma hatırlatması gönderilecek.');
    } else {
      await hatirlaticiKapat();
    }
  };

  const sifirla = () => {
    Alert.alert('Tüm veriler silinsin mi?', 'Konu ilerlemen, test sonuçların ve yanlış defterin silinecek. Bu işlem geri alınamaz.', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => store.resetAll() },
    ]);
  };

  const sadeceIlerlemeSifirla = () => {
    Alert.alert('İlerleme sıfırlansın mı?', 'Konu işaretleri ve test sonuçları temizlenecek, profil bilgilerin korunacak.', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sıfırla', style: 'destructive', onPress: () => store.resetProgress() },
    ]);
  };

  const konuSayisi = Object.keys(doneTopics).length;

  return (
    <Screen>
      <Header title="Profil ve ayarlar" subtitle={TRACKS.find((t) => t.id === profile.track)?.name || 'TYT'} onBack={nav.canGoBack ? () => nav.pop() : undefined} />
      <View style={{ padding: space.lg }}>
        <Card>
          <Text style={s.cardHead}>Özet</Text>
          <View style={s.statsRow}>
            <View style={s.stat}><Text style={s.statVal}>{konuSayisi}</Text><Text style={s.statLbl}>konu bitti</Text></View>
            <View style={s.stat}><Text style={s.statVal}>{results.length}</Text><Text style={s.statLbl}>test</Text></View>
            <View style={s.stat}><Text style={s.statVal}>{Math.round(studyMinutes)}</Text><Text style={s.statLbl}>dakika</Text></View>
          </View>
        </Card>

        <Text style={s.section}>Alanım</Text>
        <View style={s.trackGrid}>
          {TRACKS.map((t) => (
            <TouchableOpacity key={t.id} onPress={() => store.setProfile({ track: t.id })} style={[s.trackBtn, profile.track === t.id && { borderColor: t.color, backgroundColor: t.color + '16' }]}>
              <Text style={{ fontSize: 18 }}>{t.icon}</Text>
              <Text style={[s.trackTxt, profile.track === t.id && { color: t.color }]}>{t.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.section}>Bilgilerim</Text>
        <Card>
          <Input label="Adın" value={ad} onChangeText={setAd} placeholder="Örn. Ahmet" />
          <Input label="Hedefin" value={hedef} onChangeText={setHedef} placeholder="Örn. Tıp Fakültesi" />
          <Input label="Sınav tarihi" value={tarih} onChangeText={setTarih} placeholder="GG.AA.YYYY" />
          <Input label="Günlük soru hedefi" value={gunluk} onChangeText={setGunluk} keyboardType="number-pad" />
          <Btn label={kaydedildi ? '✓ Kaydedildi' : 'Bilgileri kaydet'} kind={kaydedildi ? 'success' : 'primary'} onPress={kaydet} />
        </Card>

        <Text style={s.section}>Çalışma hatırlatıcısı</Text>
        <Card>
          <View style={s.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.switchTitle}>Her gün 20:00 hatırlat</Text>
              <Text style={s.switchSub}>Telefon bildirimi olarak gönderilir.</Text>
            </View>
            <Switch value={hatirlatici} onValueChange={hatirlaticiDegistir} trackColor={{ true: colors.primary, false: colors.surface2 }} />
          </View>
        </Card>

        <Text style={s.section}>Veri</Text>
        <ListRow
          title="İlerlemeyi sıfırla"
          subtitle="Konu işaretleri ve test sonuçları silinir"
          left={<IconBubble color={colors.accent} size={40}>↺</IconBubble>}
          onPress={sadeceIlerlemeSifirla}
        />
        <ListRow
          title="Tüm verileri sil"
          subtitle="Profil dahil her şey silinir"
          left={<IconBubble color={colors.danger} size={40}>🗑</IconBubble>}
          onPress={sifirla}
        />

        <Text style={s.section}>Uygulama</Text>
        <Card>
          <Text style={s.aboutTitle}>YKS Koç · Sürüm 1.0.0</Text>
          <Text style={s.about}>
            TYT ve AYT (Sayısal, Eşit Ağırlık, Sözel) alanlarını kapsayan konu anlatımı, soru bankası, deneme testi, yanlış defteri, pomodoro ve istatistik modülleri içerir.
          </Text>
          <Divider style={{ marginVertical: space.md }} />
          <Text style={s.about}>
            Soru bankası src/data/sorular.json dosyasından beslenir. Bu dosyaya yeni soru eklediğinde uygulama güncellenmiş hâlini kullanır.
          </Text>
        </Card>

        <Btn label="Derslere git" kind="ghost" onPress={() => nav.push('Subjects')} style={{ marginTop: space.md }} />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  cardHead: { ...type.label, marginBottom: space.md },
  statsRow: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '900', color: colors.ink },
  statLbl: { fontSize: 10.5, color: colors.muted, marginTop: 3, fontWeight: '700' },
  section: { ...type.label, marginTop: space.xl, marginBottom: space.sm },
  trackGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  trackBtn: { width: '48.5%', flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: space.md, borderWidth: 1.5, borderColor: colors.line },
  trackTxt: { ...type.h3, fontSize: 13.5, marginLeft: 9, color: colors.inkSoft },
  switchRow: { flexDirection: 'row', alignItems: 'center' },
  switchTitle: { ...type.h3, fontSize: 14.5 },
  switchSub: { ...type.small, marginTop: 3 },
  aboutTitle: { ...type.h3, fontSize: 15 },
  about: { ...type.small, marginTop: 8, lineHeight: 19 },
});
