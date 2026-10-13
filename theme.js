// YKS Koç - tasarım sistemi (renkler, boşluklar, tipografi)
export const colors = {
  bg: '#0B1220',
  bgSoft: '#0F1729',
  surface: '#141E33',
  surface2: '#1C2942',
  line: 'rgba(255,255,255,0.08)',
  ink: '#F2F6FF',
  inkSoft: '#C7D3EA',
  muted: '#93A4C4',
  primary: '#4F7CFF',
  primarySoft: 'rgba(79,124,255,0.16)',
  accent: '#FFB020',
  accentSoft: 'rgba(255,176,32,0.16)',
  success: '#35D399',
  successSoft: 'rgba(53,211,153,0.16)',
  danger: '#FF6B6B',
  dangerSoft: 'rgba(255,107,107,0.16)',
  violet: '#A78BFA',
  violetSoft: 'rgba(167,139,250,0.16)',
  white: '#FFFFFF',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 10, md: 16, lg: 22, pill: 999 };

export const type = {
  h1: { fontSize: 26, fontWeight: '800', color: colors.ink, letterSpacing: -0.4 },
  h2: { fontSize: 20, fontWeight: '800', color: colors.ink, letterSpacing: -0.2 },
  h3: { fontSize: 16, fontWeight: '700', color: colors.ink },
  body: { fontSize: 14.5, color: colors.inkSoft, lineHeight: 21 },
  small: { fontSize: 12.5, color: colors.muted },
  label: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.8, textTransform: 'uppercase' },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
};

export const TRACKS = [
  { id: 'tyt', name: 'TYT', desc: 'Temel Yeterlilik Testi', long: 'Türkçe, Temel Matematik, Sosyal ve Fen', color: '#4F7CFF', icon: '🎯', questions: 120, minutes: 165 },
  { id: 'ayt-say', name: 'AYT Sayısal', desc: 'Matematik + Fen Bilimleri', long: 'Matematik, Fizik, Kimya, Biyoloji', color: '#35D399', icon: '📊', questions: 80, minutes: 180 },
  { id: 'ayt-ea', name: 'AYT Eşit Ağırlık', desc: 'Matematik + Edebiyat + Sosyal-1', long: 'Matematik, Edebiyat, Tarih-1, Coğrafya-1', color: '#FFB020', icon: '⚖️', questions: 80, minutes: 180 },
  { id: 'ayt-soz', name: 'AYT Sözel', desc: 'Edebiyat + Sosyal Bilimler', long: 'Edebiyat, Tarih, Coğrafya, Felsefe, Din Kültürü', color: '#A78BFA', icon: '📚', questions: 80, minutes: 180 },
];
