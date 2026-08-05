# Misha Mobile — GitHub APK Build

1. Extract this ZIP.
2. Create a new GitHub repository.
3. Upload all extracted files to the repository root.
4. Open the **Actions** tab.
5. Select **Build Misha Mobile**.
6. Click **Run workflow**.
7. Download the `misha-android-apk` artifact when the workflow finishes.

The project uses Expo and pnpm. The included workflow creates a release Android APK. It also creates an unsigned iOS Simulator artifact on macOS runners.

For a signed iPhone/App Store build, Apple signing is required.
