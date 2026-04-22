import * as Haptics from 'expo-haptics';

async function safeRun<T>(fn: () => Promise<T>) {
  try {
    await fn();
  } catch {
    // Ignorar errores silenciosamente para no romper la app
  }
}

export async function hapticLight() {
  await safeRun(() =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  );
}

export async function hapticMedium() {
  await safeRun(() =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  );
}

export async function hapticHeavy() {
  await safeRun(() =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
  );
}

export async function hapticSuccess() {
  await safeRun(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  );
}

export async function hapticWarning() {
  await safeRun(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
  );
}

export async function hapticError() {
  await safeRun(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
  );
}

export async function hapticSelection() {
  await safeRun(() =>
    Haptics.selectionAsync()
  );
}