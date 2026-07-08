/** URL embebible de Google Maps a partir de coordenadas (pin preciso). */
export function toGoogleMapsEmbedUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}&hl=es&z=17&output=embed`;
}
