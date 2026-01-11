import type { ArtworkApiResponse } from "../types/artwork";

export async function fetchArtworks(page: number): Promise<ArtworkApiResponse> {
  const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page}`);

  if (!res.ok) {
    throw new Error("Failed to fetch artworks");
  }

  return res.json();
}
