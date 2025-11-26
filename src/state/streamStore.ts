import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StreamProvider } from "../types/streaming";

interface StreamStore {
  providers: StreamProvider[];
  activeProvider: StreamProvider;
  addProvider: (provider: StreamProvider) => void;
  removeProvider: (name: string) => void;
  setActiveProvider: (provider: StreamProvider) => void;
}

const defaultProviders: StreamProvider[] = [
  {
    name: "Vidsrc.vip",
    logo: "https://vidsrc.vip/static/logo.png",
    url: "https://vidsrc.vip/embed/movie/{id}",
    tv_url: "https://vidsrc.vip/embed/tv/{id}/{season}/{episode}",
  },
  {
    name: "2Embed.cc",
    logo: "https://www.2embed.cc/images/logo.png",
    url: "https://www.2embed.cc/embed/{id}",
    tv_url: "https://www.2embed.cc/embedtv/{id}&s={season}&e={episode}",
  },
];

export const useStreamStore = create<StreamStore>()(
  persist(
    (set, get) => ({
      providers: defaultProviders,
      activeProvider: defaultProviders[0],
      addProvider: (provider) => {
        const { providers } = get();
        if (!providers.find((p) => p.name === provider.name)) {
          set({ providers: [...providers, provider] });
        }
      },
      removeProvider: (name) => {
        const { providers, activeProvider } = get();
        const filtered = providers.filter((p) => p.name !== name);
        if (filtered.length === 0) return; // Keep at least one provider

        const newState: Partial<StreamStore> = { providers: filtered };
        if (activeProvider.name === name) {
          newState.activeProvider = filtered[0];
        }
        set(newState);
      },
      setActiveProvider: (provider) => set({ activeProvider: provider }),
    }),
    {
      name: "stream-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
