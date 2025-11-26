import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as DropdownMenu from "zeego/dropdown-menu";
import {
  fetchTVShowDetails,
  fetchMovieDetails,
  fetchSeasonDetails,
  getPosterUrl,
} from "../api/tmdb";
import { TMDBTVShow, TMDBMovie, TMDBSeason } from "../types/streaming";
import { useStreamStore } from "../state/streamStore";

type Props = NativeStackScreenProps<RootStackParamList, "Detail">;

export default function DetailScreen({ navigation, route }: Props) {
  const { item } = route.params;
  const insets = useSafeAreaInsets();
  const activeProvider = useStreamStore((s) => s.activeProvider);

  const isTV = item.media_type === "tv";
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<TMDBTVShow | TMDBMovie | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [seasonDetails, setSeasonDetails] = useState<TMDBSeason | null>(null);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const posterUrl = getPosterUrl(item.poster_path);
  const title = item.title || item.name || "Unknown";

  const loadDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = isTV
        ? await fetchTVShowDetails(item.id.toString())
        : await fetchMovieDetails(item.id.toString());
      setDetails(data);

      if (isTV && "seasons" in data) {
        const regularSeasons = data.seasons.filter((s) => s.season_number > 0);
        if (regularSeasons.length > 0) {
          setSelectedSeason(regularSeasons[0].season_number);
        }
      }
    } catch (err) {
      console.error("Failed to load details:", err);
    } finally {
      setLoading(false);
    }
  }, [item.id, isTV]);

  const loadSeasonEpisodes = useCallback(async () => {
    if (!isTV || !details) return;

    try {
      setLoadingEpisodes(true);
      const season = await fetchSeasonDetails(
        item.id.toString(),
        selectedSeason
      );
      setSeasonDetails(season);
    } catch (err) {
      console.error("Failed to load episodes:", err);
    } finally {
      setLoadingEpisodes(false);
    }
  }, [item.id, selectedSeason, isTV, details]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  useEffect(() => {
    if (isTV && details) {
      loadSeasonEpisodes();
    }
  }, [selectedSeason, isTV, details, loadSeasonEpisodes]);

  const handlePlayMovie = () => {
    navigation.navigate("Player", {
      config: {
        tmdbId: item.id.toString(),
        isTV: false,
        provider: activeProvider,
      },
    });
  };

  const handlePlayEpisode = (episodeNumber: number) => {
    navigation.navigate("Player", {
      config: {
        tmdbId: item.id.toString(),
        isTV: true,
        season: selectedSeason.toString(),
        episode: episodeNumber.toString(),
        provider: activeProvider,
      },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  const regularSeasons =
    isTV && details && "seasons" in details
      ? details.seasons.filter((s) => s.season_number > 0)
      : [];

  return (
    <View className="flex-1 bg-black">
      <LinearGradient colors={["#000000", "#0f0728"]} style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{ paddingTop: insets.top }}
          className="absolute top-0 left-0 right-0 z-50"
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.9)", "rgba(0,0,0,0)"]}
            style={{ paddingBottom: 20 }}
          >
            <View className="flex-row items-center px-4 pt-3">
              <Pressable
                onPress={() => navigation.goBack()}
                className="bg-white/10 p-3 rounded-full"
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </Pressable>
            </View>
          </LinearGradient>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: insets.top + 80 }}
        >
          {/* Poster and Title */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            className="px-6 mb-6"
          >
            <View className="flex-row">
              {posterUrl && (
                <Image
                  source={{ uri: posterUrl }}
                  className="w-32 h-48 rounded-2xl mr-4"
                />
              )}
              <View className="flex-1">
                <Text className="text-white text-3xl font-bold mb-2">
                  {title}
                </Text>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="star" size={16} color="#fbbf24" />
                  <Text className="text-yellow-400 text-sm font-semibold ml-1">
                    {item.vote_average.toFixed(1)}
                  </Text>
                  <Text className="text-gray-400 text-sm ml-3">
                    {item.release_date?.split("-")[0] ||
                      item.first_air_date?.split("-")[0]}
                  </Text>
                </View>
                {isTV && details && "number_of_seasons" in details && (
                  <Text className="text-purple-300 text-sm">
                    {details.number_of_seasons}{" "}
                    {details.number_of_seasons === 1 ? "Season" : "Seasons"}
                  </Text>
                )}
              </View>
            </View>
          </Animated.View>

          {/* Overview */}
          {item.overview && (
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              className="px-6 mb-6"
            >
              <Text className="text-gray-300 text-sm leading-5">
                {item.overview}
              </Text>
            </Animated.View>
          )}

          {/* Movie Play Button */}
          {!isTV && (
            <Animated.View
              entering={FadeInDown.delay(300).springify()}
              className="px-6 mb-6"
            >
              <Pressable onPress={handlePlayMovie}>
                <LinearGradient
                  colors={["#8B5CF6", "#3B82F6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ padding: 18, borderRadius: 16 }}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="play-circle" size={24} color="white" />
                    <Text className="text-white text-lg font-bold ml-3">
                      Play Movie
                    </Text>
                  </View>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          )}

          {/* TV Show Season Selector and Episodes */}
          {isTV && regularSeasons.length > 0 && (
            <>
              <Animated.View
                entering={FadeInDown.delay(300).springify()}
                className="px-6 mb-4"
              >
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-white text-xl font-bold">Episodes</Text>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <View className="bg-white/10 px-4 py-2 rounded-xl flex-row items-center">
                        <Text className="text-white font-semibold mr-2">
                          Season {selectedSeason}
                        </Text>
                        <Ionicons name="chevron-down" size={16} color="white" />
                      </View>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      {regularSeasons.map((season) => (
                        <DropdownMenu.Item
                          key={season.season_number.toString()}
                          onSelect={() => setSelectedSeason(season.season_number)}
                        >
                          <DropdownMenu.ItemTitle>
                            Season {season.season_number}
                          </DropdownMenu.ItemTitle>
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </View>
              </Animated.View>

              {loadingEpisodes ? (
                <View className="px-6 py-8">
                  <ActivityIndicator size="large" color="#8B5CF6" />
                </View>
              ) : (
                seasonDetails?.episodes.map((episode, index) => (
                  <Animated.View
                    key={episode.id}
                    entering={FadeInDown.delay(400 + index * 50).springify()}
                    className="px-6 mb-3"
                  >
                    <Pressable
                      onPress={() => handlePlayEpisode(episode.episode_number)}
                      className="bg-white/5 rounded-2xl p-4 border border-white/10"
                    >
                      <View className="flex-row items-center mb-2">
                        <View className="bg-purple-600 w-8 h-8 rounded-full items-center justify-center mr-3">
                          <Text className="text-white text-xs font-bold">
                            {episode.episode_number}
                          </Text>
                        </View>
                        <Text className="text-white font-semibold flex-1">
                          {episode.name}
                        </Text>
                        <Ionicons name="play-circle" size={24} color="#8B5CF6" />
                      </View>
                      {episode.overview && (
                        <Text
                          className="text-gray-400 text-xs"
                          numberOfLines={2}
                        >
                          {episode.overview}
                        </Text>
                      )}
                      {episode.runtime && (
                        <Text className="text-gray-500 text-xs mt-1">
                          {episode.runtime} min
                        </Text>
                      )}
                    </Pressable>
                  </Animated.View>
                ))
              )}
            </>
          )}

          <View style={{ height: insets.bottom + 20 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
