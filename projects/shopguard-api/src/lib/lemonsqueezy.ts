/** Lemonsqueezy License API validation */

const VALIDATE_URL = 'https://api.lemonsqueezy.com/v1/licenses/validate';

export async function validateLicense(licenseKey: string): Promise<boolean> {
  try {
    const res = await fetch(VALIDATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ license_key: licenseKey }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    return data?.valid === true;
  } catch {
    return false;
  }
}
