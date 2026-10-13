// Gunluk calisma hatirlaticisi (bildirim modulu yoksa sessizce gec)
let Notifications = null;
try {
  Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
} catch (e) {
  Notifications = null;
}

export const notifyAvailable = () => !!Notifications;

export async function bildirimIzniAl() {
  if (!Notifications) return false;
  try {
    const perm = await Notifications.getPermissionsAsync();
    if (perm.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    return !!req.granted;
  } catch (e) {
    return false;
  }
}

export async function gunlukHatirlatici(saat, dakika, mesaj) {
  if (!Notifications) return false;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: { title: 'YKS Koç', body: mesaj || 'Bugünkü hedefini tamamlamayı unutma!', sound: false },
      trigger: { hour: saat, minute: dakika, repeats: true },
    });
    return true;
  } catch (e) {
    return false;
  }
}

export async function hatirlaticiKapat() {
  if (!Notifications) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {}
}
