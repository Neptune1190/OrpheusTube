# Stream - Custom Streaming Player

A beautiful, cinematic streaming app that lets you watch movies and TV shows with intelligent search, season/episode browsing, and custom streaming providers.

## Features

- 🔍 **Smart Search** - Search movies and TV shows directly from TMDB
- 📺 **Season & Episode Browser** - Browse all seasons and episodes with dropdown selector
- 🎬 **One-Tap Streaming** - Click any movie or episode to start streaming instantly
- ⚙️ **Provider Management** - Add and manage custom streaming API plugins
- 🎨 **Cinematic Dark Theme** - Beautiful dark gradients and smooth animations
- 📱 **Native iOS Design** - Follows Apple's Human Interface Guidelines
- ⚡ **Smooth Animations** - Spring-based animations using Reanimated v3
- 🎭 **WebView Player** - Embedded streaming with fullscreen support
- 🎯 **Automatic Metadata** - Posters, ratings, descriptions loaded from TMDB

## Tech Stack

- **React Native 0.76.7** with Expo SDK 53
- **React Navigation** - Native stack navigation
- **Reanimated v3** - Smooth, performant animations
- **NativeWind** - TailwindCSS styling
- **Zustand** - State management with AsyncStorage persistence
- **Zeego** - Native dropdown menus
- **WebView** - Embedded streaming player
- **TMDB API** - Content search and metadata

## Getting Started

### Prerequisites

You need a TMDB API key to search and fetch content metadata. Get one free at:
https://www.themoviedb.org/settings/api

### Setup

1. Add your TMDB API key to the `.env` file:
```
EXPO_PUBLIC_TMDB_API_KEY=your_api_key_here
```

2. The dev server is already running on port 8081

3. Open the Vibecode app to view your streaming player

## How to Use

1. **Search**: Type a movie or TV show name in the search bar
2. **Browse Results**: Scroll through results with posters, ratings, and release years
3. **Select Content**: Tap on any result to view details
4. **For Movies**: Tap "Play Movie" to start streaming
5. **For TV Shows**:
   - Select a season from the dropdown
   - Browse all episodes in that season
   - Tap any episode to start streaming

## Managing API Plugins

Tap the settings icon in the top-right corner of the home screen to:

- **View All Providers**: See your list of streaming API plugins
- **Switch Providers**: Tap any provider to make it active
- **Add New Providers**: Tap "Add API Plugin" and enter:
  - Provider name
  - Logo URL (optional)
  - Movie URL template with `{id}` placeholder
  - TV URL template with `{id}`, `{season}`, `{episode}` placeholders
- **Remove Providers**: Tap the trash icon on any non-active provider

### Example JSON Format

```json
{
  "name": "2Embed.cc",
  "logo": "https://www.2embed.cc/images/logo.png",
  "url": "https://www.2embed.cc/embed/{id}",
  "tv_url": "https://www.2embed.cc/embedtv/{id}&s={season}&e={episode}"
}
```

Default providers included:
- **Vidsrc.vip** (default active)
- **2Embed.cc**

## Project Structure

```
src/
├── api/
│   └── tmdb.ts              # TMDB API (search, details, seasons)
├── components/              # Reusable components
├── navigation/
│   └── RootNavigator.tsx    # Stack navigation setup
├── screens/
│   ├── HomeScreen.tsx       # Search interface with settings access
│   ├── DetailScreen.tsx     # Content details with season/episode browser
│   ├── PlayerScreen.tsx     # WebView player with metadata overlay
│   └── SettingsScreen.tsx   # Provider management interface
├── state/
│   └── streamStore.ts       # Zustand store with provider persistence
├── types/
│   └── streaming.ts         # TypeScript types
└── utils/
    └── cn.ts                # Tailwind merge utility
```

## Design Highlights

- **Color Palette**: Deep blacks, rich purples (#8B5CF6), electric blues (#3B82F6)
- **Gradients**: Vertical dark-to-purple gradients for cinematic depth
- **Typography**: Bold headers, clean sans-serif for readability
- **Spacing**: Generous padding and rounded corners for touch-friendly UI
- **Animations**: Spring-based fade-ins with staggered delays
- **Glass Effects**: Backdrop blur with subtle opacity for modern feel
- **Native Dropdowns**: iOS-native season selector using Zeego
- **Modal Forms**: Smooth bottom sheet modals for adding providers

## Notes

- The app requires an internet connection for streaming
- TMDB API key is required for search and metadata
- Streaming quality depends on the provider service
- Provider settings are persisted locally using AsyncStorage
- The orange menu button visible in the app is part of Vibecode's system


