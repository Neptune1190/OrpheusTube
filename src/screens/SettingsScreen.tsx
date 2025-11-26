import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useStreamStore } from "../state/streamStore";
import { StreamProvider } from "../types/streaming";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export default function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const providers = useStreamStore((s) => s.providers);
  const activeProvider = useStreamStore((s) => s.activeProvider);
  const addProvider = useStreamStore((s) => s.addProvider);
  const removeProvider = useStreamStore((s) => s.removeProvider);
  const setActiveProvider = useStreamStore((s) => s.setActiveProvider);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProvider, setNewProvider] = useState<StreamProvider>({
    name: "",
    logo: "",
    url: "",
    tv_url: "",
  });

  const handleAddProvider = () => {
    if (!newProvider.name.trim() || !newProvider.url.trim() || !newProvider.tv_url.trim()) {
      return;
    }

    addProvider(newProvider);
    setNewProvider({ name: "", logo: "", url: "", tv_url: "" });
    setShowAddModal(false);
  };

  const handleRemoveProvider = (providerName: string) => {
    if (providers.length === 1) {
      return;
    }
    removeProvider(providerName);
  };

  const handleImportJSON = () => {
    // For now, just show instructions
    setShowAddModal(true);
  };

  return (
    <View className="flex-1 bg-black">
      <LinearGradient colors={["#000000", "#1a0a2e", "#0f0728"]} style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{ paddingTop: insets.top }}
          className="border-b border-white/10"
        >
          <View className="flex-row items-center px-4 py-4">
            <Pressable
              onPress={() => navigation.goBack()}
              className="bg-white/10 p-2 rounded-full mr-4"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold">Settings</Text>
              <Text className="text-gray-400 text-sm mt-1">
                Manage streaming providers
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: insets.bottom + 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Add Provider Button */}
          <Animated.View entering={FadeInDown.delay(100).springify()} className="mb-6">
            <Pressable onPress={() => setShowAddModal(true)}>
              <LinearGradient
                colors={["#8B5CF6", "#3B82F6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ padding: 16, borderRadius: 16 }}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="add-circle" size={24} color="white" />
                  <Text className="text-white text-lg font-bold ml-3">
                    Add API Plugin
                  </Text>
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          {/* Active Provider Section */}
          <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-6">
            <Text className="text-white text-xl font-bold mb-4">Active Provider</Text>
            <View className="bg-white/5 rounded-2xl p-4 border-2 border-purple-500">
              <View className="flex-row items-center">
                {activeProvider.logo ? (
                  <Image
                    source={{ uri: activeProvider.logo }}
                    className="w-12 h-12 rounded-xl mr-4"
                    resizeMode="contain"
                  />
                ) : (
                  <View className="w-12 h-12 bg-purple-600 rounded-xl items-center justify-center mr-4">
                    <Ionicons name="play-circle" size={24} color="white" />
                  </View>
                )}
                <View className="flex-1">
                  <Text className="text-white text-lg font-bold">
                    {activeProvider.name}
                  </Text>
                  <View className="bg-purple-600/30 self-start px-2 py-1 rounded-full mt-1">
                    <Text className="text-purple-300 text-xs font-semibold">
                      ACTIVE
                    </Text>
                  </View>
                </View>
                <Ionicons name="checkmark-circle" size={28} color="#8B5CF6" />
              </View>
            </View>
          </Animated.View>

          {/* All Providers Section */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Text className="text-white text-xl font-bold mb-4">
              All Providers ({providers.length})
            </Text>
            {providers.map((provider, index) => {
              const isActive = provider.name === activeProvider.name;
              return (
                <Animated.View
                  key={provider.name}
                  entering={FadeInDown.delay(400 + index * 50).springify()}
                  className="mb-3"
                >
                  <Pressable
                    onPress={() => setActiveProvider(provider)}
                    className={`bg-white/5 rounded-2xl p-4 border ${
                      isActive ? "border-purple-500/50" : "border-white/10"
                    }`}
                  >
                    <View className="flex-row items-center">
                      {provider.logo ? (
                        <Image
                          source={{ uri: provider.logo }}
                          className="w-12 h-12 rounded-xl mr-4"
                          resizeMode="contain"
                        />
                      ) : (
                        <View className="w-12 h-12 bg-gray-700 rounded-xl items-center justify-center mr-4">
                          <Ionicons name="play-circle" size={24} color="#666" />
                        </View>
                      )}
                      <View className="flex-1">
                        <Text className="text-white text-lg font-semibold">
                          {provider.name}
                        </Text>
                        <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>
                          {provider.url}
                        </Text>
                      </View>
                      {isActive ? (
                        <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
                      ) : (
                        <Pressable
                          onPress={() => handleRemoveProvider(provider.name)}
                          className="p-2"
                        >
                          <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </Pressable>
                      )}
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </Animated.View>
        </ScrollView>

        {/* Add Provider Modal */}
        <Modal
          visible={showAddModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAddModal(false)}
        >
          <View className="flex-1 bg-black/80 justify-end">
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              <View className="bg-[#1a0a2e] rounded-t-3xl" style={{ paddingBottom: insets.bottom }}>
                {/* Modal Header */}
                <View className="flex-row items-center justify-between px-6 py-4 border-b border-white/10">
                  <Text className="text-white text-xl font-bold">Add API Plugin</Text>
                  <Pressable onPress={() => setShowAddModal(false)}>
                    <Ionicons name="close-circle" size={28} color="#666" />
                  </Pressable>
                </View>

                <ScrollView className="px-6 py-4" style={{ maxHeight: 500 }}>
                  {/* Instructions */}
                  <View className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
                    <Text className="text-blue-300 text-sm font-semibold mb-2">
                      JSON Format
                    </Text>
                    <Text className="text-gray-400 text-xs mb-2">
                      Enter provider details below. Use placeholders in URLs:
                    </Text>
                    <Text className="text-gray-300 text-xs font-mono">
                      {`{id}`} - Movie/TV ID{"\n"}
                      {`{season}`} - Season number{"\n"}
                      {`{episode}`} - Episode number
                    </Text>
                  </View>

                  {/* Form Fields */}
                  <View className="mb-4">
                    <Text className="text-white font-semibold mb-2">Provider Name *</Text>
                    <TextInput
                      value={newProvider.name}
                      onChangeText={(text) => setNewProvider({ ...newProvider, name: text })}
                      placeholder="e.g., 2Embed.cc"
                      placeholderTextColor="#666"
                      className="bg-white/10 text-white rounded-xl px-4 py-3 border border-white/20"
                    />
                  </View>

                  <View className="mb-4">
                    <Text className="text-white font-semibold mb-2">Logo URL</Text>
                    <TextInput
                      value={newProvider.logo}
                      onChangeText={(text) => setNewProvider({ ...newProvider, logo: text })}
                      placeholder="https://example.com/logo.png"
                      placeholderTextColor="#666"
                      className="bg-white/10 text-white rounded-xl px-4 py-3 border border-white/20"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  <View className="mb-4">
                    <Text className="text-white font-semibold mb-2">Movie URL *</Text>
                    <TextInput
                      value={newProvider.url}
                      onChangeText={(text) => setNewProvider({ ...newProvider, url: text })}
                      placeholder="https://example.com/embed/{id}"
                      placeholderTextColor="#666"
                      className="bg-white/10 text-white rounded-xl px-4 py-3 border border-white/20"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  <View className="mb-4">
                    <Text className="text-white font-semibold mb-2">TV Show URL *</Text>
                    <TextInput
                      value={newProvider.tv_url}
                      onChangeText={(text) => setNewProvider({ ...newProvider, tv_url: text })}
                      placeholder="https://example.com/embedtv/{id}&s={season}&e={episode}"
                      placeholderTextColor="#666"
                      className="bg-white/10 text-white rounded-xl px-4 py-3 border border-white/20"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row gap-3 mt-4">
                    <Pressable
                      onPress={() => setShowAddModal(false)}
                      className="flex-1 bg-white/10 py-4 rounded-xl"
                    >
                      <Text className="text-white text-center font-semibold">Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={handleAddProvider}
                      className="flex-1"
                    >
                      <LinearGradient
                        colors={["#8B5CF6", "#3B82F6"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ padding: 16, borderRadius: 12 }}
                      >
                        <Text className="text-white text-center font-bold">Add Provider</Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}
