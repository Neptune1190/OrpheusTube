import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  ScrollView,
  Image,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { WebView } from "react-native-webview";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { fetchMovieDetails, fetchTVShowDetails, getImageUrl } from "../api/tmdb";
import { TMDBContent } from "../types/streaming";

type Props = NativeStackScreenProps<RootStackParamList, "Player">;

export default function PlayerScreen({ navigation, route }: Props) {
  const { config } = route.params;
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const [content, setContent] = useState<TMDBContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const streamURL = config.isTV
    ? config.provider.tv_url
        .replace("{id}", config.tmdbId)
        .replace("{season}", config.season || "1")
        .replace("{episode}", config.episode || "1")
    : config.provider.url.replace("{id}", config.tmdbId);

  const loadContent = useCallback(async () => {
    try {
      setError(null);
      const data = config.isTV
        ? await fetchTVShowDetails(config.tmdbId)
        : await fetchMovieDetails(config.tmdbId);
      setContent(data);
    } catch (err) {
      setError("Could not load content details");
      console.error(err);
    }
  }, [config.isTV, config.tmdbId]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const title = content
    ? "title" in content
      ? content.title
      : content.name
    : "Loading...";

  const posterUrl = content ? getImageUrl(content.poster_path) : null;

  return (
    <View className="flex-1 bg-black">
      <LinearGradient
        colors={["#000000", "#0a0015"]}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View
          style={{ paddingTop: insets.top }}
          className="absolute top-0 left-0 right-0 z-50"
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.8)", "rgba(0,0,0,0)"]}
            style={{ paddingBottom: 20 }}
          >
            <View className="flex-row items-center justify-between px-4 pt-3">
              <Pressable
                onPress={() => navigation.goBack()}
                className="bg-white/10 p-3 rounded-full backdrop-blur-xl"
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </Pressable>

              <Pressable
                onPress={() => setShowInfo(!showInfo)}
                className="bg-white/10 p-3 rounded-full backdrop-blur-xl"
              >
                <Ionicons
                  name={showInfo ? "eye-off" : "information-circle"}
                  size={24}
                  color="white"
                />
              </Pressable>
            </View>
          </LinearGradient>
        </View>

        {/* Player */}
        <View className="flex-1">
          <WebView
            source={{ uri: streamURL }}
            style={{ flex: 1 }}
            onLoadEnd={() => setLoading(false)}
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
          />
          {loading && (
            <View className="absolute inset-0 items-center justify-center bg-black/50">
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text className="text-white mt-4 text-lg">Loading stream...</Text>
            </View>
          )}
        </View>

        {/* Content Info */}
        {showInfo && content && (
          <Animated.View
            entering={FadeInDown.springify()}
            className="absolute bottom-0 left-0 right-0"
            style={{ paddingBottom: insets.bottom }}
          >
            <LinearGradient
              colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.95)", "#000000"]}
              style={{ paddingTop: 40 }}
            >
              <ScrollView
                className="max-h-64"
                showsVerticalScrollIndicator={false}
              >
                <View className="px-6 pb-6">
                  <View className="flex-row">
                    {posterUrl && (
                      <Image
                        source={{ uri: posterUrl }}
                        className="w-24 h-36 rounded-2xl mr-4"
                      />
                    )}
                    <View className="flex-1">
                      <Text className="text-white text-2xl font-bold mb-2">
                        {title}
                      </Text>
                      {config.isTV && config.season && config.episode && (
                        <View className="flex-row items-center mb-2">
                          <View className="bg-purple-600 px-3 py-1 rounded-full">
                            <Text className="text-white text-sm font-semibold">
                              S{config.season} E{config.episode}
                            </Text>
                          </View>
                        </View>
                      )}
                      {"vote_average" in content && (
                        <View className="flex-row items-center">
                          <Ionicons name="star" size={16} color="#fbbf24" />
                          <Text className="text-yellow-400 text-sm font-semibold ml-1">
                            {content.vote_average.toFixed(1)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {content.overview && (
                    <Text className="text-gray-300 text-sm mt-4 leading-5">
                      {content.overview}
                    </Text>
                  )}
                </View>
              </ScrollView>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Error State */}
        {error && (
          <Animated.View
            entering={FadeIn}
            className="absolute bottom-8 left-6 right-6 bg-red-500/90 p-4 rounded-2xl"
            style={{ marginBottom: insets.bottom }}
          >
            <View className="flex-row items-center">
              <Ionicons name="alert-circle" size={24} color="white" />
              <Text className="text-white ml-3 flex-1">{error}</Text>
            </View>
          </Animated.View>
        )}
      </LinearGradient>
    </View>
  );
}
