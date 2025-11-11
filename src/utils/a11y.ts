import { AccessibilityInfo } from 'react-native';

export const announceForAccessibility = async (message?: string | null): Promise<void> => {
  if (!message) {
    return;
  }

  const announce = (AccessibilityInfo as unknown as { announceForAccessibility?: (msg: string) => Promise<void> | void }).announceForAccessibility;

  if (typeof announce !== 'function') {
    return;
  }

  try {
    const result = announce(message);
    if (result && typeof (result as Promise<void>).then === 'function') {
      await result;
    }
  } catch (error) {
    console.warn('Failed to announce for accessibility', error);
  }
};


