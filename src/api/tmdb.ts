import { TMDBMovie, TMDBTVShow, TMDBSearchResult, TMDBSeason } from "../types/streaming";

const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY || "";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export const searchMulti = async (query: string): Promise<TMDBSearchResult[]> => {
  if (!query.trim()) return [];

  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY_MISSING");
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error("TMDB_API_KEY_INVALID");
    }
    throw new Error(`Search failed: ${errorData.status_message || response.statusText}`);
  }

  const data = await response.json();
  return data.results.filter((item: TMDBSearchResult) =>
    item.media_type === "movie" || item.media_type === "tv"
  );
};

export const fetchMovieDetails = async (id: string): Promise<TMDBMovie> => {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY_MISSING");
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch movie details");
  }
  return response.json();
};

export const fetchTVShowDetails = async (id: string): Promise<TMDBTVShow> => {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY_MISSING");
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch TV show details");
  }
  return response.json();
};

export const fetchSeasonDetails = async (
  tvId: string,
  seasonNumber: number
): Promise<TMDBSeason> => {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY_MISSING");
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch season details");
  }
  return response.json();
};

export const getImageUrl = (path: string | null): string | null => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}${path}`;
};

export const getPosterUrl = (path: string | null): string | null => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/w300${path}`;
};
