/** Persistent device UUID for rate-limit identification */

const STORAGE_KEY = 'shopguard_device_id';

export async function getDeviceId(): Promise<string> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  if (result[STORAGE_KEY]) return result[STORAGE_KEY];

  const id = crypto.randomUUID();
  await chrome.storage.local.set({ [STORAGE_KEY]: id });
  return id;
}
