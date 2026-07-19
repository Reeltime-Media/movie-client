/** Warm the qrcode chunk before checkout so Buy → QR feels instant. */
let warmPromise: Promise<typeof import("qrcode")> | null = null;

export function warmQrCodeModule(): Promise<typeof import("qrcode")> {
  if (!warmPromise) {
    warmPromise = import("qrcode");
  }
  return warmPromise;
}

export async function qrStringToDataUrl(qrString: string): Promise<string> {
  const QRCode = await warmQrCodeModule();
  return QRCode.toDataURL(qrString, {
    margin: 1,
    width: 220,
    // M is enough for KHQR length and encodes faster than H.
    errorCorrectionLevel: "M",
    color: { dark: "#000000", light: "#FFFFFF" },
  });
}
