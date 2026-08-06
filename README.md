# Bazm App

A React Native (Expo) mobile app for discovering and connecting around social gatherings, with location-based features and user authentication.

<p align="right">

####  Download Link: [Android](https://drive.google.com/file/d/15Ee6OJizoGDN2gX9KbKmFSo12jnfrLbk/view?usp=sharing) [| iOS (Coming Soon)](#)
</p>

## Demo
<div align="center">
  
https://github.com/user-attachments/assets/fc1f4cae-ca78-45c3-aef9-9a57ee2c6d50
</div>

## Overview

Built on Expo Router for navigation, Bazm uses a map-based interface to help users find and interact with gatherings near them, backed by Supabase for data and Clerk for authentication.

## Key Features

- Secure sign-in and account management via Clerk
- Location-based discovery using maps and device location
- Photo upload and image viewing
- Smooth, native-feeling UI with bottom sheets and haptic feedback
- Cross-platform: iOS, Android, and Web (via Expo)

## Tech Stack

![React Native](https://img.shields.io/badge/React%20Native-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=flat-square&logo=clerk&logoColor=white)
![NativeWind](https://img.shields.io/badge/NativeWind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-433E38?style=flat-square)

## Project Structure

```
bazm-app/
├── app/            # Expo Router screens and navigation
├── components/     # Reusable UI components
├── assets/         # Images, fonts, and static assets
└── scripts/        # Project utility scripts
```

## Setup & Run

**1. Clone the repo**
```bash
git clone https://github.com/Hamzaa09/ReactNative-App.git
cd ReactNative-App
```

**2. Install dependencies**
```bash
npm install
```

**3. Environment variables**

Create a `.env` file in the project root with:
```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**4. Run the app**
```bash
npm start
```
Then choose iOS, Android, or Web from the Expo CLI, or run directly:
```bash
npm run ios
npm run android
npm run web
```

> **Note:** never commit real `.env` values - keep them local and add `.env` to `.gitignore`.

## Author

Muhammad Hamza - [github.com/Hamzaa09](https://github.com/Hamzaa09) | [LinkedIn](https://www.linkedin.com/in/muhammad-hamza-109413300/)
