import eintraege from "../data/uebungsvideos.json";

export interface Uebungsvideo {
  youtubeId: string;
  titel: string;
  quelle: string;
  belegUrl: string;
}

const videos = eintraege as Record<string, Uebungsvideo>;

export const anzahlUebungsvideos = Object.values(videos)
  .filter((video) => /^[A-Za-z0-9_-]{11}$/.test(video.youtubeId)).length;

export function uebungsvideoFuer(id: string): Uebungsvideo | null {
  const video = videos[id];
  return video && /^[A-Za-z0-9_-]{11}$/.test(video.youtubeId) ? video : null;
}
