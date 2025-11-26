import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { searchMulti, getPosterUrl } from "../api/tmdb";
import { TMDBSearchResult } from "../types/streaming";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<TMDBSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    setError(null);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const searchResults = await searchMulti(query);
      setResults(searchResults);
    } catch (err) {
      console.error("Search failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      if (errorMessage === "TMDB_API_KEY_MISSING") {
        setError("TMDB API key is missing. Please add your API key to the .env file.");
      } else if (errorMessage === "TMDB_API_KEY_INVALID") {
        setError("Invalid TMDB API key. Please check your .env file.");
      } else {
        setError("Search failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectItem = (item: TMDBSearchResult) => {
    Keyboard.dismiss();
    navigation.navigate("Detail", { item });
  };

  return (
    <View className="flex-1 bg-black">
      <LinearGradient colors={["#000000", "#1a0a2e", "#0f0728"]} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={{ paddingTop: insets.top + 16 }} className="px-6 mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-1">
                <Text className="text-white text-4xl font-bold mb-2">Stream</Text>
                <Text className="text-purple-300 text-lg">
                  Search movies and TV shows
                </Text>
              </View>
              <Pressable
                onPress={() => navigation.navigate("Settings")}
                className="bg-white/10 p-3 rounded-full border border-white/20"
              >
                <Ionicons name="settings-outline" size={24} color="#8B5CF6" />
              </Pressable>
            </View>
          </View>

          {/* Search Bar */}
          <View className="px-6 mb-6">
            <View className="bg-white/10 rounded-2xl flex-row items-center px-4 border border-white/20">
              <Ionicons name="search" size={20} color="#a78bfa" />
              <TextInput
                value={searchQuery}
                onChangeText={handleSearch}
                placeholder="Search for movies or TV shows..."
                placeholderTextColor="#666"
                className="flex-1 text-white p-4 text-base"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => handleSearch("")}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                </Pressable>
              )}
            </View>
          </View>

          {/* Results */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 20 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {error ? (
              <View className="py-20 px-6">
                <View className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 items-center">
                  <Ionicons name="alert-circle" size={48} color="#ef4444" />
                  <Text className="text-red-400 mt-4 text-center font-semibold text-lg">
                    Error
                  </Text>
                  <Text className="text-red-300 mt-2 text-center">
                    {error}
                  </Text>
                  {error.includes("API key") && (
                    <View className="mt-4 bg-black/30 rounded-xl p-4 self-stretch">
                      <Text className="text-gray-300 text-sm">
                        Get a free API key at:
                      </Text>
                      <Text className="text-purple-400 text-sm mt-1">
                        themoviedb.org/settings/api
                      </Text>
                      <Text className="text-gray-400 text-xs mt-3">
                        Then add it to the ENV tab in Vibecode
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ) : loading ? (
              <View className="py-20 items-center">
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text className="text-gray-400 mt-4">Searching...</Text>
              </View>
            ) : results.length > 0 ? (
              results.map((item, index) => {
                const posterUrl = getPosterUrl(item.poster_path);
                const title = item.title || item.name || "Unknown";
                const year =
                  item.release_date?.split("-")[0] ||
                  item.first_air_date?.split("-")[0];
                const mediaType =
                  item.media_type === "movie" ? "Movie" : "TV Show";

                return (
                  <Animated.View
                    key={item.id}
                    entering={FadeInDown.delay(index * 50).springify()}
                    className="mb-4"
                  >
                    <Pressable
                      onPress={() => handleSelectItem(item)}
                      className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 active:bg-white/10"
                    >
                      <View className="flex-row p-3">
                        {posterUrl ? (
                          <Image
                            source={{ uri: posterUrl }}
                            className="w-20 h-30 rounded-xl"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="w-20 h-30 bg-gray-800 rounded-xl items-center justify-center">
                            <Ionicons name="image-outline" size={24} color="#666" />
                          </View>
                        )}
                        <View className="flex-1 ml-4 justify-center">
                          <Text
                            className="text-white text-lg font-semibold mb-1"
                            numberOfLines={2}
                          >
                            {title}
                          </Text>
                          <View className="flex-row items-center mb-1">
                            {item.vote_average > 0 && (
                              <>
                                <Ionicons name="star" size={14} color="#fbbf24" />
                                <Text className="text-yellow-400 text-sm ml-1">
                                  {item.vote_average.toFixed(1)}
                                </Text>
                              </>
                            )}
                            {year && (
                              <Text className="text-gray-400 text-sm ml-3">
                                {year}
                              </Text>
                            )}
                          </View>
                          <View className="bg-purple-600/30 self-start px-2 py-1 rounded-full">
                            <Text className="text-purple-300 text-xs font-semibold">
                              {mediaType}
                            </Text>
                          </View>
                        </View>
                        <View className="justify-center">
                          <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#8B5CF6"
                          />
                        </View>
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })
            ) : searchQuery.length > 0 && !loading ? (
              <View className="py-20 items-center">
                <Ionicons name="search-outline" size={64} color="#333" />
                <Text className="text-gray-400 mt-4 text-center">
                  No results found for &quot;{searchQuery}&quot;
                </Text>
              </View>
            ) : (
              <View className="py-20 items-center px-8">
                <Ionicons name="film-outline" size={64} color="#333" />
                <Text className="text-gray-400 mt-4 text-center text-base">
                  Search for your favorite movies and TV shows to start streaming
                </Text>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}
