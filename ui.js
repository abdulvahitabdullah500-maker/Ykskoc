import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { colors, space, radius, type, shadow } from './theme';

export function Screen({ children, scroll = true, style }) {
  const Cmp = scroll ? ScrollView : View;
  return (
    <Cmp
      style={[{ flex: 1, backgroundColor: colors.bg }, style]}
      contentContainerStyle={scroll ? { paddingBottom: 40 } : undefined}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </Cmp>
  );
}

export function Header({ title, subtitle, onBack, right, gradient = ['#1B2A4A', '#0B1220'] }) {
  return (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.header}>
      <View style={s.headerRow}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={s.backBtn} accessibilityLabel="Geri">
            <Text style={s.backTxt}>‹</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 8 }} />
        )}
        <View style={{ flex: 1 }}>
          {subtitle ? <Text style={s.eyebrow}>{subtitle}</Text> : null}
          <Text style={s.headerTitle} numberOfLines={2}>{title}</Text>
        </View>
        {right || null}
      </View>
    </LinearGradient>
  );
}

export function Card({ children, style, onPress, tone = 'default' }) {
  const bg = tone === 'primary' ? colors.primarySoft : tone === 'accent' ? colors.accentSoft : colors.surface;
  const body = (
    <View style={[s.card, { backgroundColor: bg }, style]}>
      {children}
    </View>
  );
  if (!onPress) return body;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} accessibilityRole="button">
      {body}
    </TouchableOpacity>
  );
}

export function SectionTitle({ children, right, style }) {
  return (
    <View style={[s.sectionTitleRow, style]}>
      <Text style={s.sectionTitle}>{children}</Text>
      {right || null}
    </View>
  );
}

export function Btn({ label, onPress, kind = 'primary', style, disabled, icon }) {
  const map = {
    primary: { bg: colors.primary, txt: '#FFFFFF', border: 'transparent' },
    ghost: { bg: 'transparent', txt: colors.inkSoft, border: colors.line },
    accent: { bg: colors.accent, txt: '#22180A', border: 'transparent' },
    success: { bg: colors.success, txt: '#04231A', border: 'transparent' },
    danger: { bg: colors.dangerSoft, txt: colors.danger, border: 'rgba(255,107,107,0.35)' },
  }[kind];
  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      activeOpacity={0.85}
      style={[s.btn, { backgroundColor: map.bg, borderColor: map.border, opacity: disabled ? 0.5 : 1 }, style]}
      accessibilityRole="button"
    >
      {icon ? <Text style={[s.btnTxt, { color: map.txt, marginRight: 6 }]}>{icon}</Text> : null}
      <Text style={[s.btnTxt, { color: map.txt }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Pill({ label, color = colors.muted, bg = colors.surface2, style }) {
  return (
    <View style={[s.pill, { backgroundColor: bg }, style]}>
      <Text style={[s.pillTxt, { color }]}>{label}</Text>
    </View>
  );
}

export function ProgressBar({ value, color = colors.primary, height = 8, style }) {
  const v = Math.max(0, Math.min(1, value || 0));
  return (
    <View style={[s.barBg, { height, borderRadius: height / 2 }, style]}>
      <View style={{ width: (v * 100).toFixed(1) + '%', height, borderRadius: height / 2, backgroundColor: color }} />
    </View>
  );
}

export function Ring({ size = 108, stroke = 10, progress = 0, color = colors.primary, track = 'rgba(255,255,255,0.10)', children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress || 0));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - p)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ alignItems: 'center' }}>{children}</View>
    </View>
  );
}

export function ListRow({ title, subtitle, left, right, onPress, style }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} disabled={!onPress} accessibilityRole={onPress ? 'button' : undefined}>
      <View style={[s.row, style]}>
        {left ? <View style={s.rowLeft}>{left}</View> : null}
        <View style={{ flex: 1 }}>
          <Text style={s.rowTitle}>{title}</Text>
          {subtitle ? <Text style={s.rowSub}>{subtitle}</Text> : null}
        </View>
        {right ? <View style={s.rowRight}>{right}</View> : null}
      </View>
    </TouchableOpacity>
  );
}

export function IconBubble({ children, color = colors.primary, bg, size = 42 }) {
  return (
    <View style={[s.bubble, { width: size, height: size, borderRadius: size / 2.6, backgroundColor: bg || color + '22' }]}>
      <Text style={{ fontSize: size * 0.42, color }}>{children}</Text>
    </View>
  );
}

export function Input({ label, ...props }) {
  return (
    <View style={{ marginBottom: space.lg }}>
      {label ? <Text style={s.inputLabel}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.muted}
        {...props}
        style={[s.input, props.style]}
      />
    </View>
  );
}

export function Empty({ icon = '📭', title, desc }) {
  return (
    <View style={s.empty}>
      <Text style={{ fontSize: 34, marginBottom: 8 }}>{icon}</Text>
      <Text style={s.emptyTitle}>{title}</Text>
      {desc ? <Text style={s.emptyDesc}>{desc}</Text> : null}
    </View>
  );
}

export function Divider({ style }) {
  return <View style={[{ height: 1, backgroundColor: colors.line }, style]} />;
}

const s = StyleSheet.create({
  header: { paddingTop: 54, paddingBottom: 22, paddingHorizontal: space.lg, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start' },
  backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.10)', alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 2 },
  backTxt: { color: colors.ink, fontSize: 24, lineHeight: 26, marginTop: -2 },
  eyebrow: { ...type.label, color: colors.muted, marginBottom: 4 },
  headerTitle: { ...type.h1, color: colors.ink },
  card: { borderRadius: radius.md, padding: space.lg, borderWidth: 1, borderColor: colors.line, marginBottom: space.md, ...shadow.card },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.lg, marginBottom: space.sm, paddingHorizontal: space.lg },
  sectionTitle: { ...type.h3, color: colors.ink },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 13, paddingHorizontal: 18, borderRadius: radius.pill, borderWidth: 1 },
  btnTxt: { fontSize: 14.5, fontWeight: '700' },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, alignSelf: 'flex-start' },
  pillTxt: { fontSize: 11.5, fontWeight: '700' },
  barBg: { backgroundColor: 'rgba(255,255,255,0.09)', overflow: 'hidden', width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: space.md, marginBottom: space.sm, borderWidth: 1, borderColor: colors.line },
  rowLeft: { marginRight: space.md },
  rowTitle: { ...type.h3, fontSize: 15 },
  rowSub: { ...type.small, marginTop: 3 },
  rowRight: { marginLeft: space.md, alignItems: 'flex-end' },
  bubble: { alignItems: 'center', justifyContent: 'center' },
  inputLabel: { ...type.label, marginBottom: 6 },
  input: { backgroundColor: colors.surface2, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 12, color: colors.ink, borderWidth: 1, borderColor: colors.line, fontSize: 15 },
  empty: { alignItems: 'center', paddingVertical: 42, paddingHorizontal: space.xl },
  emptyTitle: { ...type.h3, marginBottom: 6, textAlign: 'center' },
  emptyDesc: { ...type.small, textAlign: 'center', lineHeight: 19 },
});
