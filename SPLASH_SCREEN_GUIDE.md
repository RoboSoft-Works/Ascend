# Loading Screen & Splash Screen Guide

## Overview

This guide explains the difference between web loading screens and native splash screens in mobile apps, and how we've implemented both for Ascend.

## Types of Loading Screens

### 1. Web Loading Screen (React Component)
- **Location**: `client/src/components/LoadingScreen.tsx`
- **Purpose**: Shows while the web app loads its assets and initializes
- **Features**: 
  - Animated logo and background
  - Progress indicators
  - Smooth transitions
  - Responsive design
- **When it shows**: Every time the web app starts/refreshes

### 2. Native Splash Screen (Android)
- **Location**: `android/app/src/main/res/layout/launch_screen.xml`
- **Purpose**: Shows immediately when the app launches, before web content loads
- **Features**:
  - Native Android layout
  - App icon and branding
  - Loading animation
  - Developer info
- **When it shows**: Only when the app first launches from Android

## How They Work Together

```
App Launch → Native Splash → Web Loading Screen → App Content
   (0-2s)        (2-3s)              (3-5s)
```

1. **Native Splash** (0-2s): Shows immediately when app launches
2. **Web Loading Screen** (2-3s): Takes over when web content starts loading
3. **App Content** (3-5s): Main app interface appears

## Configuration

### Capacitor Config (`capacitor.config.ts`)

```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 2000,    // Show for 2 seconds
    launchAutoHide: true,        // Auto-hide after duration
    backgroundColor: '#000000',   // Match app theme
    showSpinner: false,          // Use custom loading instead
    splashFullScreen: true,      // Full screen splash
    splashImmersive: true,       // Hide system UI
    layoutName: 'launch_screen', // Custom layout name
    useDialog: true              // Show as dialog overlay
  }
}
```

### Web Loading Manager (`useLoadingManager.ts`)

```typescript
const stages = [
  { name: 'Initializing', duration: 500 },
  { name: 'Loading Assets', duration: 800 },
  { name: 'Preparing Game',  duration: 600 },
  {name: 'Finalizing',     duration: 400 }
];
```

## Benefits

### Native Splash Screen
- ✅ **Instant Feedback**: Shows immediately when app launches
- ✅ **Native Performance**: No web content loading delay
- ✅ **Professional Look**: Matches Android app standards
- ✅ **Brand Recognition**: Shows app icon and name immediately
- ✅ **System Integration**: Works with Android's app launch flow

### Web Loading Screen
- ✅ **Rich Animations**: Complex animations and effects
- **Progress Feedback**: Shows loading stages and progress
- **Responsive Design**: Adapts to all screen sizes
- **Brand Consistency**: Matches web app design
- **User Engagement**: Interactive elements and micro-interactions

## Customization

### Changing Native Splash Screen

1. **Layout**: `android/app/src/main/res/layout/launch_screen.xml`
2. **Background**: `android/app/src/main/res/drawable/splash_background.xml`
3. **Loading Dots**: `android/app/src/main/res/drawable/loading_dot.xml`
4. **Duration**: Update `launchShowDuration` in `capacitor.config.ts`

### Changing Web Loading Screen

1. **Component**: `client/src/components/LoadingScreen.tsx`
2. **Stages**: Update `stages` array in `useLoadingManager.ts`
3. **Animations**: Modify Framer Motion animations
4. **Duration**: Adjust `duration` values in stages

## Performance Considerations

### Native Splash
- **Fast**: Minimal overhead, native rendering
- **Memory**: Low memory usage
- **Battery**: Minimal battery impact

### Web Loading Screen
- **Rich**: More complex animations and effects
- **Memory**: Higher memory usage during loading
- **Battery**: Slightly higher battery usage

## Best Practices

### ✅ Do's
- Keep native splash screen simple and fast
- Use web loading screen for complex animations
- Match colors and branding between both screens
- Keep loading time reasonable (2-5 seconds total)
- Test on different devices and network conditions

### ❌ Don'ts
- Don't make loading too long (user frustration)
- Don't use heavy animations in native splash
- Don't show different branding between screens
- Don't skip loading screens on slow devices
- Don't use web loading screen for app initialization

## APK Impact

### How it Works in APK
1. **App Icon**: User taps app icon on Android
2. **Native Splash**: Android shows native splash immediately
3. **WebView Loading**: Capacitor loads the web content
4. **Web Loading**: React app shows loading screen
5. **App Ready**: Main app interface appears

### User Experience
- **Immediate Response**: Native splash shows instantly
- **Professional Feel**: Smooth transition from native to web
- **Brand Consistency**: Consistent look throughout
- **Performance**: Fast loading with good feedback

## Testing

### Testing Native Splash
```bash
# Build and install APK
npm run build
npx cap sync android
npx cap open android
# Build and install from Android Studio
```

### Testing Web Loading
```bash
# Test in browser
npm run dev
# Test with throttling (Chrome DevTools)
# Test on mobile devices
```

## Troubleshooting

### Common Issues

1. **White Flash Between Screens**
   - Solution: Match background colors exactly
   - Set `backgroundColor: '#000000'` in Capacitor config

2. **Loading Screen Too Long**
   - Solution: Reduce stage durations
   - Optimize asset loading

3. **Native Splash Not Showing**
   - Solution: Check layout name in config
   - Ensure sync with `npx cap sync`

4. **Animation Lag**
   - Solution: Use hardware acceleration
   - Reduce animation complexity

## Future Enhancements

### Possible Improvements
- **Dynamic Loading**: Show different messages based on loading stage
- **Progressive Loading**: Load app content progressively
- **Offline Support**: Show offline status in loading screen
- **Personalization**: Show user's title/level in loading screen

### Performance Optimizations
- **Asset Preloading**: Preload critical assets
- **Code Splitting**: Load code in chunks
- **Service Workers**: Cache assets for faster loading
- **Lazy Loading**: Load non-critical features later

---

## Summary

The dual loading screen approach provides the best of both worlds:
- **Native Splash**: Instant feedback and professional feel
- **Web Loading**: Rich animations and detailed progress

This creates a premium user experience that feels responsive and engaging, whether the user is launching the app for the first time or refreshing it during gameplay.
