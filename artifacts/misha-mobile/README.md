# Misha Mobile

Misha is a neon AI content factory for turning one idea into a short-form reel blueprint. The mobile app includes:

- Topic and custom-content input
- Energetic, Professional, Storytelling, and Viral Hype tones
- US English, UK English, and Hindi / Urdu voice direction
- Four visual directions for the reel concept
- Local script generation with hook, body, and call-to-action copy
- Caption-ready vertical reel preview
- Local recent-build history
- Neon theme rotation every 30 seconds

## Run locally

From the repository root:

```bash
pnpm install
pnpm --filter @workspace/misha-mobile run dev
```

Scan the Expo QR code with Expo Go, or open the web preview for a quick browser check.

## GitHub builds

Run **Actions → Build Misha Mobile → Run workflow** in GitHub. The workflow uploads:

- `misha-android-apk`: a release APK
- `misha-ios-simulator`: an unsigned iOS Simulator app

The iOS simulator artifact is for simulator testing. A signed iPhone build and App Store submission must go through the iOS publishing flow with Apple signing information.
