import tyt from './tyt.json';
import aytSay from './ayt-say.json';
import aytEa from './ayt-ea.json';
import aytSoz from './ayt-soz.json';
import SORULAR from './sorular.json';

export const RAW = { tyt, 'ayt-say': aytSay, 'ayt-ea': aytEa, 'ayt-soz': aytSoz };

// Ayni dersi birden fazla alanda kullanan kayitlari tek kaynaga baglar.
// Ornek: AYT Esit Agirlik Matematik, AYT Sayisal Matematik konularini kullanir.
export function resolveSubject(subject, trackId) {
  if (!subject) return null;
  if (!subject.shared) return subject;
  for (const key of Object.keys(RAW)) {
    const found = RAW[key].find((s) => s.id === subject.shared);
    if (found) {
      return {
        ...found,
        id: subject.id,
        track: trackId,
        color: subject.color || found.color,
        questionCount: subject.questionCount || found.questionCount,
        sourceId: found.id,
      };
    }
  }
  return subject;
}

export function getSubjects(trackId) {
  const list = RAW[trackId] || [];
  return list.map((s) => resolveSubject(s, trackId) || s);
}

export function findSubject(trackId, subjectId) {
  return getSubjects(trackId).find((s) => s.id === subjectId) || null;
}

export function findTopic(subject, topicId) {
  if (!subject || !subject.topics) return null;
  return subject.topics.find((t) => t.id === topicId) || null;
}

// Bir dersin sorularini toplar. Paylasilan derslerde sorular kaynak dersin
// kimligiyle kayitli oldugu icin her iki kimlik de taranir.
export function questionsForSubject(subject) {
  if (!subject) return [];
  const anahtarlar = new Set([subject.id]);
  if (subject.sourceId) anahtarlar.add(subject.sourceId);
  if (subject.name === 'Türk Dili ve Edebiyatı') anahtarlar.add('ayt-edebiyat');
  if (subject.name === 'Tarih-1') anahtarlar.add('ayt-ea-tarih1');
  if (subject.name === 'Coğrafya-1') anahtarlar.add('ayt-ea-cografya1');
  if (subject.name === 'Din Kültürü ve Ahlak Bilgisi') anahtarlar.add('tyt-dinkulturu');
  if (subject.name === 'Matematik') anahtarlar.add('ayt-matematik');
  return SORULAR.filter((q) => anahtarlar.has(q.subject));
}

export function countTopics(trackId) {
  return getSubjects(trackId).reduce((a, s) => a + (s.topics ? s.topics.length : 0), 0);
}

export function countSubtopics(trackId) {
  return getSubjects(trackId).reduce(
    (a, s) => a + (s.topics ? s.topics.reduce((b, t) => b + t.subs.length, 0) : 0),
    0
  );
}
