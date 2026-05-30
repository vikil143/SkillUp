// seed/skills/mobile.js — React Native, Android, Electron
import { mk, uid } from '../helpers.js';

const card = (q, a) => ({ id: uid(), q, a });
const api = (name, signature, description, params, returns, example, gotchas) => ({
  id: uid(), name, signature, description, params, returns, example, gotchas,
});
const ref = (title, url) => ({ id: uid(), title, url });

export default function buildMobileSkills() {
  const skills = [];

  // ─── REACT NATIVE (zero to hero) ───────────────────────────────────────────
  const rn = mk('React Native', 'mobile', null, {
    definition:
      'React Native is a framework for building native iOS and Android applications using React and JavaScript. Unlike a WebView wrapper, RN bridges JS component trees to genuine native UIKit / Android View system primitives. The New Architecture (0.68+) replaces the async bridge with JSI-powered synchronous calls, Fabric for concurrent rendering, and TurboModules for lazy native module loading. Production RN apps require mastery of threading, native bridging, list performance, and platform-specific behaviours.',
    codeExample:
      "import React, { useState, useCallback } from 'react';\nimport {\n  SafeAreaView, FlatList, View, Text, Pressable,\n  StyleSheet, ActivityIndicator,\n} from 'react-native';\n\nconst ITEM_HEIGHT = 56;\n\nexport default function ProductList({ products, onSelect }) {\n  const [selected, setSelected] = useState(null);\n\n  const handlePress = useCallback((id) => {\n    setSelected(id);\n    onSelect(id);\n  }, [onSelect]);\n\n  const renderItem = useCallback(({ item }) => (\n    <Pressable\n      style={[styles.row, selected === item.id && styles.rowSelected]}\n      onPress={() => handlePress(item.id)}\n    >\n      <Text style={styles.name}>{item.name}</Text>\n      <Text style={styles.price}>₹{item.price}</Text>\n    </Pressable>\n  ), [selected, handlePress]);\n\n  return (\n    <SafeAreaView style={styles.safe}>\n      <FlatList\n        data={products}\n        keyExtractor={(item) => item.id}\n        renderItem={renderItem}\n        getItemLayout={(_, index) => ({\n          length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index,\n        })}\n        removeClippedSubviews\n        initialNumToRender={15}\n        windowSize={5}\n      />\n    </SafeAreaView>\n  );\n}\n\nconst styles = StyleSheet.create({\n  safe:        { flex: 1, backgroundColor: '#fff' },\n  row:         { height: ITEM_HEIGHT, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#e5e5e5' },\n  rowSelected: { backgroundColor: '#e8f5e9' },\n  name:        { flex: 1, fontSize: 15 },\n  price:       { fontSize: 15, fontWeight: '700', color: '#2e7d32' },\n});",
    whenUsed:
      'Core framework for p-maak (Maak) and p-packarma (Packarma) at Mypcot — integrated Firebase Auth, Firestore, Razorpay payments, GPS location, biometric auth, and push notifications across iOS and Android.',
    gotchas:
      'Flexbox defaults differ from web: flexDirection defaults to "column" (not row), and flex: 1 requires parent to have a defined height or flex itself.\nInline arrow functions in renderItem cause every cell to re-render on list data change — always useCallback.\nAnimated runs on the JS thread by default; heavy JS work during animation causes frame drops. Use Reanimated worklets for butter-smooth 60fps.\nStyleSheet.create does not provide type safety for colour values — a typo in a colour string fails silently at runtime.\nAndroid back button must be handled explicitly with BackHandler or navigation.goBack() — unhandled presses close the app.\nShadow props differ between iOS (shadowColor, shadowRadius etc.) and Android (elevation) — use a utility wrapper.\nNew Architecture (Fabric/TurboModules) is opt-in but changes native module authoring significantly — mixing old and new bridge code causes hard-to-debug issues.',
    flashcards: [
      card('How does React Native render to native UI without a WebView?', 'RN runs a JS engine (Hermes) in one thread and the native UI in another. Components like <View> are mapped to native UIView/View equivalents via the bridge (old arch) or JSI (new arch). No DOM or browser rendering is involved.'),
      card('What is JSI and why does it replace the async bridge?', 'JSI (JavaScript Interface) exposes C++ host objects directly to the JS engine without JSON serialisation. The old bridge serialised every cross-thread call to JSON — JSI calls are synchronous and zero-copy, eliminating the main bottleneck.'),
      card('What is the difference between Fabric and the old renderer?', 'Fabric is a C++ reimplementation of the RN renderer that supports React 18 concurrent features (transitions, Suspense on native). The old renderer was a single-threaded Java/ObjC pipeline that could not be interrupted.'),
      card('Why does Hermes improve startup time over JavaScriptCore?', 'Hermes pre-compiles JS to bytecode at build time, so the device loads bytecode rather than parsing JS source. This reduces time-to-interactive significantly, especially on lower-end Android devices.'),
      card('Why must StyleSheet.create be called outside render?', 'StyleSheet.create registers styles as IDs on the native side at module load time. Calling it inside render re-registers on every render, allocating new style objects and bypassing the optimisation.'),
      card('What causes the "VirtualizedList should never be nested inside plain ScrollViews" warning?', 'Wrapping FlatList in ScrollView disables virtualization — the outer ScrollView provides infinite height, so FlatList renders all items immediately, defeating its purpose.'),
      card('What is the difference between useNativeDriver: true and false in Animated?', 'useNativeDriver: true serialises the animation to native once and runs it entirely on the UI thread — no JS involvement per frame, always smooth. false runs the animation on the JS thread — any JS work causes jank.'),
      card('How does Reanimated 3 differ from the Animated API?', 'Reanimated worklets run directly on the UI thread via JSI, not the JS thread. shared values update the UI without any JS-thread bridge round-trip. This enables 60/120fps animations even when the JS thread is busy.'),
      card('What is the Metro bundler and what is its role?', 'Metro is RN\'s JavaScript bundler — it resolves modules, transforms JSX/TS, and serves the bundle to the device during development. In production builds, it outputs a single bundle that is either embedded in the app or loaded from a server (CodePush).'),
      card('What is CodePush and when should you not use it?', 'CodePush (App Center) pushes JS bundle updates OTA without an App Store review. You should not use it for changes to native code, new native modules, or SDK upgrades — those require a full app store release.'),
    ],
    apis: [
      api('StyleSheet.create', 'StyleSheet.create(styles: { [key: string]: ViewStyle | TextStyle | ImageStyle })', 'Registers styles on the native layer and returns a style object with integer IDs for efficient passing.', 'plain style object map', 'registered style object', "const styles = StyleSheet.create({\n  container: { flex: 1, backgroundColor: '#fff' },\n  title: { fontSize: 18, fontWeight: '700' },\n});\nStyleSheet.hairlineWidth // thinnest native line", 'Call at module level, never inside render. Does not validate colour strings at runtime.'),
      api('Platform.OS / Platform.select', 'Platform.OS: "ios" | "android" | "web"\nPlatform.select({ ios, android, default })', 'Read the current platform or branch style/value per platform.', 'platform map object', 'selected value', "const shadow = Platform.select({\n  ios:     { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4 },\n  android: { elevation: 4 },\n});\n\nif (Platform.OS === 'android') BackHandler.exitApp();", 'Platform.select runs at JS time — not tree-shaken. For large divergence, use .ios.tsx / .android.tsx file splitting.'),
      api('FlatList', '<FlatList data keyExtractor renderItem getItemLayout windowSize initialNumToRender />', 'Virtualized scrollable list — only mounts visible items.', 'data array, keyExtractor fn, renderItem fn, and perf props', 'React element', "<FlatList\n  data={items}\n  keyExtractor={(i) => i.id}\n  renderItem={({ item }) => <Row item={item} />}\n  getItemLayout={(_, idx) => ({ length: ROW_H, offset: ROW_H * idx, index: idx })}\n  removeClippedSubviews\n  windowSize={5}\n/>", 'Never nest inside ScrollView — disables virtualization. getItemLayout unlocks scrollToIndex accuracy.'),
      api('Animated.timing / Animated.spring', 'Animated.timing(value, { toValue, duration, useNativeDriver })\nAnimated.spring(value, { toValue, tension, friction, useNativeDriver })', 'Drives an Animated.Value to a target over time or with spring physics.', 'Animated.Value and config object', 'Animation object — call .start()', "const opacity = useRef(new Animated.Value(0)).current;\n\nuseEffect(() => {\n  Animated.timing(opacity, {\n    toValue: 1, duration: 300, useNativeDriver: true,\n  }).start();\n}, []);\n\n<Animated.View style={{ opacity }} />", 'Always set useNativeDriver: true for transform/opacity. Required false for layout properties (width, height).'),
      api('AsyncStorage', 'AsyncStorage.getItem(key): Promise<string|null>\nAsyncStorage.setItem(key, value): Promise<void>', 'Persists key-value string data to device storage (unencrypted).', 'string key and string value', 'Promise', "import AsyncStorage from '@react-native-async-storage/async-storage';\n\nawait AsyncStorage.setItem('user', JSON.stringify(user));\nconst raw = await AsyncStorage.getItem('user');\nconst user = raw ? JSON.parse(raw) : null;", 'All values are strings — JSON.stringify/parse required for objects. Not encrypted — do not store tokens/secrets here; use Keychain/Keystore.'),
      api('Linking.openURL / addEventListener', 'Linking.openURL(url): Promise<void>\nLinking.addEventListener("url", handler)', 'Opens a URL in the default browser/app and listens for deep link events.', 'URL string and event handler', 'Promise / subscription', "Linking.openURL('https://example.com');\n\n// Deep link handling\nuseEffect(() => {\n  const sub = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));\n  return () => sub.remove();\n}, []);", 'Test deep links with: adb shell am start -W -a android.intent.action.VIEW -d \"myapp://route\"'),
      api('AppState.addEventListener', 'AppState.addEventListener(\"change\", handler): subscription', 'Fires when app moves between active / background / inactive states.', 'event name and callback', 'subscription with .remove()', "useEffect(() => {\n  const sub = AppState.addEventListener('change', (state) => {\n    if (state === 'active') refreshData();\n    if (state === 'background') pauseSync();\n  });\n  return () => sub.remove();\n}, []);", 'AppState.currentState reflects current state synchronously. Always remove subscription on unmount.'),
      api('Dimensions.get', "Dimensions.get('window' | 'screen'): { width, height, scale, fontScale }", 'Returns device window or screen dimensions.', '"window" or "screen"', '{ width, height, scale, fontScale }', "const { width, height } = Dimensions.get('window');\n// For dynamic resize, use useWindowDimensions() hook instead\nimport { useWindowDimensions } from 'react-native';\nconst { width } = useWindowDimensions();", 'Prefer useWindowDimensions() hook — it subscribes to orientation changes automatically. Dimensions.get is a one-shot snapshot.'),
      api('Keyboard.addListener / dismiss', 'Keyboard.addListener(event, handler)\nKeyboard.dismiss()', 'Listens for keyboard show/hide events and programmatically dismisses.', 'event string and handler callback', 'subscription / void', "useEffect(() => {\n  const show = Keyboard.addListener('keyboardDidShow', (e) => {\n    setKbHeight(e.endCoordinates.height);\n  });\n  const hide = Keyboard.addListener('keyboardDidHide', () => setKbHeight(0));\n  return () => { show.remove(); hide.remove(); };\n}, []);", 'On iOS use keyboardWillShow for smoother animation sync. KeyboardAvoidingView handles most cases without manual listener.'),
      api('Alert.alert', "Alert.alert(title, message?, buttons?, options?)", 'Shows a native OS alert dialog.', 'title string, optional message, buttons array, options', 'void', "Alert.alert(\n  'Delete item?',\n  'This cannot be undone.',\n  [\n    { text: 'Cancel', style: 'cancel' },\n    { text: 'Delete', style: 'destructive', onPress: () => deleteItem(id) },\n  ]\n);", 'Button styles ("cancel", "destructive", "default") only have visual effect on iOS. Destructive style shows red text on iOS.'),
      api('PermissionsAndroid.request', 'PermissionsAndroid.request(permission, rationale?): Promise<PermissionStatus>', 'Requests a dangerous Android permission at runtime.', 'permission constant and optional rationale', '"granted" | "denied" | "never_ask_again"', "import { PermissionsAndroid } from 'react-native';\n\nconst status = await PermissionsAndroid.request(\n  PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,\n  { title: 'Location', message: 'Used to show nearby results', buttonPositive: 'OK' }\n);\nif (status !== 'granted') showPermissionDeniedUI();", 'iOS permissions are handled in Info.plist + react-native-permissions library. PermissionsAndroid is Android-only.'),
    ],
    refs: [
      ref('React Native Docs', 'https://reactnative.dev/docs/getting-started'),
      ref('React Navigation', 'https://reactnavigation.org/docs/getting-started'),
      ref('Reanimated 3 Docs', 'https://docs.swmansion.com/react-native-reanimated/'),
      ref('React Native New Architecture', 'https://reactnative.dev/docs/the-new-architecture/landing-page'),
      ref('React Native Performance', 'https://reactnative.dev/docs/performance'),
      ref('EAS Build', 'https://docs.expo.dev/build/introduction/'),
    ],
    relatedProjectIds: ['p-maak', 'p-packarma'],
  });
  skills.push(rn);

  // RN sub-topics
  skills.push(mk('Core Components', 'mobile', rn.id, {
    definition:
      'React Native\'s built-in component primitives map directly to native UIKit/Android View equivalents. View is the layout container (like div), Text renders all text, Image loads local/remote assets, FlatList and SectionList handle long lists, Pressable/TouchableOpacity handle taps, and SafeAreaView insets content away from notches and system bars.',
    codeExample:
      "import {\n  SafeAreaView, View, Text, Image, TextInput,\n  Pressable, ScrollView, StyleSheet,\n} from 'react-native';\n\nexport default function ProfileCard({ user }) {\n  return (\n    <SafeAreaView style={styles.safe}>\n      <ScrollView contentContainerStyle={styles.content}>\n        <Image\n          source={{ uri: user.avatar }}\n          style={styles.avatar}\n          resizeMode='cover'\n        />\n        <Text style={styles.name}>{user.name}</Text>\n        <TextInput\n          style={styles.input}\n          placeholder='Add a note…'\n          placeholderTextColor='#999'\n        />\n        <Pressable\n          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}\n          onPress={() => save(user.id)}\n        >\n          <Text style={styles.btnText}>Save</Text>\n        </Pressable>\n      </ScrollView>\n    </SafeAreaView>\n  );\n}",
    flashcards: [
      card('Why use SafeAreaView instead of a plain View at the screen root?', 'SafeAreaView adds insets for iPhone notches, Dynamic Island, and Android gesture nav bars automatically. A plain View root clips content behind system UI on devices with cutouts.'),
      card('When should you use Pressable over TouchableOpacity?', 'Pressable is the modern replacement — it provides a style callback with pressed state, supports ripple on Android, and is composable without the extra opacity wrapper component.'),
      card('Why must all text in React Native be inside a <Text> component?', 'Unlike the web where raw strings in a div render fine, RN throws "Text strings must be rendered within a <Text> component" if raw strings appear outside Text — the native renderer has no implicit text node concept.'),
      card('What does resizeMode="cover" do on an Image?', 'Scales the image to fill the component dimensions while maintaining aspect ratio, cropping edges if needed. "contain" fits the whole image within bounds without cropping.'),
    ],
  }));

  skills.push(mk('Styling', 'mobile', rn.id, {
    definition:
      'React Native uses a JavaScript-based styling system inspired by CSS but not identical to it. StyleSheet.create registers styles natively at module load time. Flexbox is always active but defaults differ: flexDirection is "column", alignItems is "stretch". There is no cascade, no inheritance beyond Text inside Text, and no CSS units — all dimensions are density-independent pixels.',
    codeExample:
      "import { StyleSheet, Platform, Dimensions } from 'react-native';\n\nconst { width } = Dimensions.get('window');\n\nconst styles = StyleSheet.create({\n  // Flexbox — column by default\n  card: {\n    flexDirection: 'row',\n    alignItems: 'center',\n    padding: 12,\n    gap: 10,\n    borderRadius: 12,\n    backgroundColor: '#fff',\n    // Shadow — platform-specific\n    ...Platform.select({\n      ios:     { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },\n      android: { elevation: 4 },\n    }),\n  },\n  // Responsive width\n  thumbnail: { width: width * 0.25, aspectRatio: 1, borderRadius: 8 },\n  // Dynamic style via array\n  text: { fontSize: 15, color: '#333' },\n  textMuted: { color: '#999' },\n});",
    flashcards: [
      card('How does RN Flexbox differ from web Flexbox in its defaults?', 'RN defaults: flexDirection="column", alignContent="flex-start", flexShrink=0. Web defaults: flexDirection="row", flexShrink=1. These differences cause layouts that look correct on web to collapse or overflow on RN.'),
      card('Why does RN have no CSS cascade or inheritance?', 'The native layout engine does not build a style tree — each component gets resolved styles applied independently. Text style inheritance only works when Text is nested inside another Text component.'),
      card('What is StyleSheet.hairlineWidth?', 'The thinnest line the device can render (often 0.5px on Retina/high-density screens). Use it for dividers and borders instead of hardcoding 1 — looks crisp on every screen density.'),
      card('How do you apply multiple styles conditionally in RN?', 'Pass an array to the style prop: style={[styles.base, isActive && styles.active, { opacity: loading ? 0.5 : 1 }]}. RN merges array styles right-to-left, later values winning.'),
    ],
  }));

  skills.push(mk('Navigation', 'mobile', rn.id, {
    definition:
      'React Navigation is the community-standard routing library for React Native. It provides Stack (push/pop), Tab (bottom/top bar), and Drawer navigators that compose together. Navigation state is maintained in JS and rendered via native primitives (native stack on 0.66+). Deep linking maps URL schemes to screen routes.',
    codeExample:
      "import { NavigationContainer, useNavigation, useRoute } from '@react-navigation/native';\nimport { createNativeStackNavigator } from '@react-navigation/native-stack';\nimport { createBottomTabNavigator } from '@react-navigation/bottom-tabs';\n\nconst Stack = createNativeStackNavigator();\nconst Tab = createBottomTabNavigator();\n\nfunction HomeTabs() {\n  return (\n    <Tab.Navigator screenOptions={{ headerShown: false }}>\n      <Tab.Screen name='Feed'      component={FeedScreen} />\n      <Tab.Screen name='Profile'   component={ProfileScreen} />\n    </Tab.Navigator>\n  );\n}\n\nexport default function App() {\n  return (\n    <NavigationContainer>\n      <Stack.Navigator>\n        <Stack.Screen name='HomeTabs' component={HomeTabs} options={{ headerShown: false }} />\n        <Stack.Screen name='PostDetail' component={PostDetailScreen} />\n      </Stack.Navigator>\n    </NavigationContainer>\n  );\n}\n\n// In a screen\nfunction FeedScreen() {\n  const nav = useNavigation();\n  return (\n    <Pressable onPress={() => nav.navigate('PostDetail', { postId: '123' })}>\n      <Text>Open post</Text>\n    </Pressable>\n  );\n}",
    flashcards: [
      card('What is the difference between createNativeStackNavigator and createStackNavigator?', 'Native stack uses the platform\'s native navigation APIs (UINavigationController on iOS, Fragment navigation on Android) — transitions are butter-smooth and performant. createStackNavigator is a JS-driven stack with custom transitions but higher animation overhead.'),
      card('How do you pass and read params in React Navigation?', 'Pass via navigate("Screen", { key: value }). Read via useRoute().params or the route prop. Always validate params since deep links can pass unexpected values.'),
      card('What is the linking config in React Navigation and what does it enable?', 'The linking prop on NavigationContainer maps URL schemes (myapp://post/123) to named screens with param extraction. This enables deep links from push notifications, web URLs, and share links to open specific screens.'),
      card('Why should you not store sensitive data in navigation params?', 'Navigation state can be serialised to AsyncStorage for persistence. Params are part of that state — secrets stored in params survive app restarts in plaintext.'),
    ],
  }));

  skills.push(mk('Lists & Performance', 'mobile', rn.id, {
    definition:
      'FlatList virtualizes long lists by only mounting visible rows plus a configurable overscan buffer. getItemLayout skips measurement and enables accurate scrollToIndex. SectionList adds grouped headers. Performance tuning requires understanding windowSize, initialNumToRender, maxToRenderPerBatch, and removeClippedSubviews.',
    codeExample:
      "const ROW_HEIGHT = 64;\n\n<FlatList\n  data={messages}\n  keyExtractor={(msg) => msg.id}\n  renderItem={renderMessage}          // must be useCallback\n  getItemLayout={(_, index) => ({     // enables scrollToIndex + skips measure\n    length: ROW_HEIGHT,\n    offset: ROW_HEIGHT * index,\n    index,\n  })}\n  initialNumToRender={15}             // rows rendered on first paint\n  maxToRenderPerBatch={10}            // rows added per batch while scrolling\n  windowSize={5}                      // render window = 5 × viewport height\n  removeClippedSubviews               // unmount off-screen on Android\n  updateCellsBatchingPeriod={50}\n  onEndReachedThreshold={0.4}         // trigger pagination when 40% from end\n  onEndReached={loadNextPage}\n/>",
    flashcards: [
      card('What does getItemLayout enable that FlatList cannot do without it?', 'Accurate scrollToIndex/scrollToOffset without measuring each item first. Without getItemLayout, scrollToIndex on items that haven\'t been rendered yet fails or scrolls to the wrong position.'),
      card('What does windowSize control and what is the performance trade-off?', 'windowSize defines how many viewport-heights of items to keep mounted: windowSize={5} = 2 above + viewport + 2 below. Lower = less memory but more blank frames during fast scrolling. Higher = smoother but more memory.'),
      card('Why does removeClippedSubviews help on Android but sometimes hurt on iOS?', 'On Android it unmounts off-screen views aggressively, reducing memory. On iOS, UIKit view recycling already handles this well, and removeClippedSubviews can cause blank flashes during fast scrolls — generally leave it off on iOS.'),
      card('Why must renderItem be a useCallback-wrapped function?', 'FlatList uses referential equality to decide if a row should re-render. An inline arrow function creates a new reference every parent render, causing every visible row to re-render even when the data has not changed.'),
    ],
  }));

  skills.push(mk('Networking', 'mobile', rn.id, {
    definition:
      'React Native includes fetch globally. Production RN apps need retry logic, request cancellation via AbortController, offline detection via @react-native-community/netinfo, and error boundary patterns for network failures. Axios is commonly used for interceptors and automatic JSON handling.',
    codeExample:
      "import NetInfo from '@react-native-community/netinfo';\n\nexport async function apiFetch(url, options = {}, retries = 2) {\n  const net = await NetInfo.fetch();\n  if (!net.isConnected) throw new Error('OFFLINE');\n\n  const ctrl = new AbortController();\n  const timeout = setTimeout(() => ctrl.abort(), 10_000);\n\n  try {\n    const res = await fetch(url, { ...options, signal: ctrl.signal });\n    clearTimeout(timeout);\n    if (!res.ok) throw Object.assign(new Error('HTTP_ERROR'), { status: res.status });\n    return res.json();\n  } catch (err) {\n    clearTimeout(timeout);\n    if (retries > 0 && err.name !== 'AbortError') {\n      await new Promise((r) => setTimeout(r, 500));\n      return apiFetch(url, options, retries - 1);\n    }\n    throw err;\n  }\n}",
    flashcards: [
      card('What is the NetInfo library and why is it essential in mobile apps?', '@react-native-community/netinfo provides real-time connectivity state (type, isConnected, isInternetReachable). Mobile users frequently switch between WiFi/cellular/offline — apps must handle each state gracefully.'),
      card('Why is AbortController important for RN networking?', 'Users navigate away from screens mid-request. Without cancellation, the response arrives and calls setState on an unmounted component, causing the "Can\'t perform a React state update on an unmounted component" warning (and potential memory leaks).'),
      card('What is the difference between isConnected and isInternetReachable in NetInfo?', 'isConnected means a network interface is active. isInternetReachable means the device can actually reach the internet — captive portal WiFi (airport/hotel) can be connected but not reachable.'),
    ],
  }));

  skills.push(mk('Storage', 'mobile', rn.id, {
    definition:
      'React Native apps need persistent local storage for caching, offline support, and user preferences. AsyncStorage is the simplest option but unencrypted and slow for large data. MMKV is a high-performance synchronous alternative. SQLite (via op-sqlite / expo-sqlite) handles relational or large structured data.',
    codeExample:
      "// MMKV — synchronous, fast, used in production RN apps\nimport { MMKV } from 'react-native-mmkv';\n\nexport const storage = new MMKV();\n\n// Sync read — no await needed\nexport const getUser = () => {\n  const raw = storage.getString('user');\n  return raw ? JSON.parse(raw) : null;\n};\n\nexport const saveUser = (user) => {\n  storage.set('user', JSON.stringify(user));\n};\n\n// AsyncStorage (legacy — simpler, async)\nimport AsyncStorage from '@react-native-async-storage/async-storage';\nawait AsyncStorage.setItem('@token', token);\nconst token = await AsyncStorage.getItem('@token');",
    flashcards: [
      card('Why is MMKV preferred over AsyncStorage for performance-sensitive storage?', 'MMKV uses memory-mapped files and a C++ implementation — reads are synchronous (no Promise overhead) and 10–100× faster than AsyncStorage, which serialises through the async bridge.'),
      card('What should never be stored in AsyncStorage or MMKV?', 'Auth tokens and private keys — these storages are not encrypted by default. Use react-native-keychain (iOS Keychain / Android Keystore) for secrets that must survive app reinstall or device theft.'),
      card('When does SQLite (op-sqlite) make sense over MMKV?', 'When you need relational queries, full-text search, or datasets too large to comfortably keep in a JS object. MMKV is key-value only; SQLite handles complex queries and table joins.'),
    ],
  }));

  skills.push(mk('Animations', 'mobile', rn.id, {
    definition:
      'React Native has two animation systems: the legacy Animated API (JS thread, serialises to native for useNativeDriver: true transforms/opacity) and Reanimated 3 (worklets run entirely on the UI thread via JSI, enabling 60/120fps animations even under heavy JS load). LayoutAnimation provides simple transition-on-layout-change animations.',
    codeExample:
      "// Reanimated 3 — UI thread worklet, always smooth\nimport Animated, {\n  useSharedValue, useAnimatedStyle, withSpring, withTiming,\n  runOnUI, runOnJS,\n} from 'react-native-reanimated';\n\nexport function ScaleButton({ onPress, children }) {\n  const scale = useSharedValue(1);\n\n  const animStyle = useAnimatedStyle(() => ({\n    transform: [{ scale: scale.value }],\n  }));\n\n  return (\n    <Animated.View style={animStyle}>\n      <Pressable\n        onPressIn={() => { scale.value = withSpring(0.95); }}\n        onPressOut={() => { scale.value = withSpring(1); }}\n        onPress={onPress}\n      >\n        {children}\n      </Pressable>\n    </Animated.View>\n  );\n}",
    flashcards: [
      card('What is a Reanimated worklet and why does it run on the UI thread?', 'A worklet is a JS function annotated with "worklet" (or implicitly via useAnimatedStyle/useAnimatedGestureHandler). Reanimated copies it to a separate JS runtime that runs on the UI thread, reading sharedValues without any bridge cross-thread calls.'),
      card('When is useNativeDriver: true not possible with the Animated API?', 'useNativeDriver only supports transform and opacity. Layout properties (width, height, padding, flex, left, top) cannot use native driver because native layout requires a layout pass on the main thread that the animation driver cannot perform independently.'),
      card('What is LayoutAnimation and what is its main limitation?', 'LayoutAnimation.configureNext() applies a transition to all layout changes that happen in the next state update — no per-element control. On Android it requires UIManager.setLayoutAnimationEnabledExperimental(true). Reanimated\'s Layout Animations offer per-component entering/exiting control.'),
      card('What is a shared value in Reanimated 3?', 'Created with useSharedValue(initial) — a value that lives on the UI thread but can be read/written from both JS and UI threads. Changes trigger re-evaluation of dependent useAnimatedStyle without causing a React re-render.'),
    ],
  }));

  skills.push(mk('Native Modules & New Architecture', 'mobile', rn.id, {
    definition:
      'Native modules bridge JavaScript to platform-specific APIs not exposed by React Native core. The legacy architecture used a JSON-serialising async bridge. The New Architecture (0.68+) introduces TurboModules (lazy-loaded native modules via JSI), Fabric (concurrent C++ renderer), and Codegen (type-safe native specs from TypeScript/Flow).',
    codeExample:
      "// TurboModule spec (TypeScript — generates native type stubs via Codegen)\nimport type { TurboModule } from 'react-native';\nimport { TurboModuleRegistry } from 'react-native';\n\nexport interface Spec extends TurboModule {\n  getBatteryLevel(): Promise<number>;\n  isCharging(): boolean; // synchronous via JSI\n}\n\nexport default TurboModuleRegistry.getEnforcing<Spec>('BatteryModule');\n\n// Old architecture native module (Java — for reference)\n// @ReactMethod public void getBatteryLevel(Promise promise) { ... }\n// Bridge serialised return value to JS as JSON — async always",
    flashcards: [
      card('What is JSI and what problem does it solve?', 'JSI (JavaScript Interface) lets JS hold direct C++ object references. Native methods can be called synchronously without JSON serialisation. Old bridge: every call was async + JSON — bottleneck for high-frequency interactions.'),
      card('What is Codegen in the New Architecture?', 'Codegen reads TypeScript/Flow specs for TurboModules and Fabric components and generates native type-safe boilerplate (C++ headers, Java/Kotlin stubs). This eliminates runtime type mismatches between JS and native layers.'),
      card('What is Fabric?', 'Fabric is the New Architecture\'s C++ renderer. It supports React 18 concurrent features (priority rendering, Suspense), enables synchronous layout reads from native, and allows Reanimated/Gesture Handler to run on the UI thread without bridge serialisation.'),
      card('When should you write a native module vs use an existing library?', 'Write one when you need platform hardware/OS APIs not exposed by any community library, or when you need synchronous JSI access for performance-critical paths (e.g. reading sensor data 60× per second).'),
    ],
  }));

  skills.push(mk('Platform-Specific Code', 'mobile', rn.id, {
    definition:
      'React Native provides two mechanisms for platform divergence: the Platform module for runtime branching and file-based splitting (.ios.tsx / .android.tsx). Metro bundler resolves platform-specific files automatically — they share the same import path but ship only the correct variant per build.',
    codeExample:
      "// Runtime branching — small differences\nconst BACK_ICON = Platform.OS === 'ios' ? 'chevron.left' : 'arrow-back';\n\nconst shadowStyle = Platform.select({\n  ios:     { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },\n  android: { elevation: 3 },\n  default: {},\n});\n\n// File-based splitting — large differences\n// DatePicker.ios.tsx — uses @react-native-community/datetimepicker native modal\n// DatePicker.android.tsx — uses Android-style spinner dialog\n// import DatePicker from './DatePicker'; // Metro picks the right one",
    flashcards: [
      card('When should you use .ios.tsx / .android.tsx file splitting vs Platform.select?', 'File splitting for significantly different component implementations (different native libraries, different JSX structure). Platform.select for small style or config differences — keeps related code in one file.'),
      card('What does Metro do with platform-specific extensions?', 'Metro resolves imports with platform extension first: importing "./DatePicker" will use DatePicker.ios.tsx on iOS and DatePicker.android.tsx on Android. Only the appropriate file is bundled per platform, reducing bundle size.'),
    ],
  }));

  skills.push(mk('Build, Deploy & Debugging', 'mobile', rn.id, {
    definition:
      'Production RN apps require Android keystore signing, iOS provisioning profiles, ProGuard/R8 for code shrinking, and a CI pipeline. EAS Build (Expo Application Services) abstracts the native build environment. Debugging tools include Flipper (network + layout), React Native DevTools, and native console logs via adb/Xcode.',
    codeExample:
      "# Android release keystore\nkeytool -genkey -v \\\n  -keystore my-release-key.jks \\\n  -alias my-key-alias \\\n  -keyalg RSA -keysize 2048 \\\n  -validity 10000\n\n# Build release APK / AAB\ncd android && ./gradlew bundleRelease\n\n# ProGuard (android/app/proguard-rules.pro)\n-keep class com.mypackage.** { *; }\n\n# EAS Build — cloud build without local Xcode/Android Studio\neas build --platform android --profile production\neas build --platform ios     --profile production\n\n# Debug: native logs\nadb logcat *:S ReactNative:V ReactNativeJS:V\n# iOS: open Xcode → Devices & Simulators → View Device Logs",
    flashcards: [
      card('What is the difference between an APK and an AAB?', 'APK is a universal package installed directly. AAB (Android App Bundle) lets Google Play generate device-optimised APKs per device ABI/density — smaller download size, required for new Play Store uploads.'),
      card('What does ProGuard/R8 do in a release build and what can it break?', 'ProGuard/R8 shrinks, obfuscates, and optimises the Java/Kotlin bytecode. It can break libraries that rely on reflection (many RN native modules) — add -keep rules for affected packages or disable minification for those classes.'),
      card('What is EAS Build and why is it useful for teams without Mac CI agents?', 'EAS Build runs your native build on Expo\'s cloud infrastructure with pre-configured Xcode/Android environments. Teams without a macOS CI agent can still produce signed iOS builds from a Linux/Windows pipeline.'),
      card('What is Flipper and what can it inspect in a React Native app?', 'Flipper is a desktop debugging platform by Meta. For RN it provides: network inspector, layout hierarchy, React DevTools, database/AsyncStorage viewer, crash reporter, and custom plugin support.'),
    ],
  }));

  skills.push(mk('App Lifecycle & Permissions', 'mobile', rn.id, {
    definition:
      'Mobile apps are not always in the foreground. AppState tracks active/background/inactive transitions. BackHandler manages Android hardware back press. Permissions must be requested at runtime on Android 6+ and iOS — each platform has its own permission strings and timing conventions.',
    codeExample:
      "import { AppState, BackHandler, Platform } from 'react-native';\nimport { request, PERMISSIONS, RESULTS } from 'react-native-permissions';\n\n// AppState\nuseEffect(() => {\n  const sub = AppState.addEventListener('change', (state) => {\n    if (state === 'active') syncPendingChanges();\n  });\n  return () => sub.remove();\n}, []);\n\n// Android back handler\nuseEffect(() => {\n  if (Platform.OS !== 'android') return;\n  const handler = BackHandler.addEventListener('hardwareBackPress', () => {\n    if (canGoBack) { goBack(); return true; } // true = prevent default exit\n    return false;\n  });\n  return () => handler.remove();\n}, [canGoBack]);\n\n// Runtime permission (react-native-permissions)\nconst status = await request(\n  Platform.OS === 'ios'\n    ? PERMISSIONS.IOS.CAMERA\n    : PERMISSIONS.ANDROID.CAMERA\n);\nif (status !== RESULTS.GRANTED) showPermissionRationale();",
    flashcards: [
      card('What are the four AppState values and what triggers each?', '"active" — app is in foreground. "background" — app is in background (home pressed, another app). "inactive" — transitional state on iOS (call received, control centre opened). "unknown" — initial value before first event.'),
      card('Why must BackHandler return true in Android back press handlers?', 'Returning true tells React Native to prevent the default back action (exiting the app or popping the navigation stack). Return false to let RN handle it normally. Forgetting to return true in modals causes the modal to close AND navigation to go back simultaneously.'),
      card('What is the react-native-permissions library and why use it over the RN core API?', 'react-native-permissions provides a unified API for both iOS and Android permissions with consistent status values (GRANTED, DENIED, BLOCKED, UNAVAILABLE). RN core only exposes PermissionsAndroid — iOS permissions require native-level Info.plist entries and are handled separately.'),
    ],
  }));

  skills.push(mk('New Architecture (Fabric / TurboModules / Hermes)', 'mobile', rn.id, {
    definition:
      'The New Architecture is a complete reimplementation of React Native\'s internals. JSI replaces the JSON bridge, TurboModules enables synchronous lazy-loaded native access, Fabric is the new concurrent C++ renderer, Hermes is the default JS engine with AOT bytecode compilation, and Codegen generates typed native interfaces from TypeScript specs.',
    codeExample:
      "// Enabling New Architecture (React Native 0.71+)\n// android/gradle.properties\nnewArchEnabled=true\n\n// ios/Podfile\nuse_react_native!(\n  :path => config[:reactNativePath],\n  :hermes_enabled => true,\n  :fabric_enabled => true,\n)\n\n// TurboModule spec\nimport type { TurboModule } from 'react-native';\nexport interface Spec extends TurboModule {\n  // Synchronous method — possible via JSI\n  multiply(a: number, b: number): number;\n  // Async method\n  fetchConfig(): Promise<{ endpoint: string }>;\n}\n\n// TODO: verify Codegen CLI command for latest RN version",
    flashcards: [
      card('What is the primary advantage of TurboModules over legacy NativeModules?', 'TurboModules are loaded lazily (only when first accessed) and call native code synchronously via JSI. Legacy modules were all loaded at startup eagerly and every call was async + JSON-serialised.'),
      card('What does the New Architecture enable that was impossible with the old bridge?', 'Synchronous native calls, concurrent rendering (React 18 features on native), direct C++ layout reads without bridge round-trips, and worklets/gesture handlers running on the UI thread without serialisation.'),
      card('Is the New Architecture a breaking change for app-level React Native code?', 'For most app-level code, no — React components and hooks work unchanged. Breaking changes affect native module authors (new TurboModule spec format) and libraries that relied on bridge internals. Community libraries need updates for New Architecture compatibility.'),
    ],
  }));

  // ─── ANDROID NATIVE (beginner to intermediate) ─────────────────────────────
  const android = mk('Android (native)', 'mobile', null, {
    definition:
      'Native Android development uses Kotlin (preferred) or Java with the Android SDK. Understanding the Activity/Fragment lifecycle, Intent system, and resource system is essential for debugging React Native issues that surface at the native layer, writing custom RN native modules, and contributing to Android-specific build configuration.',
    codeExample:
      "// Kotlin Activity with ViewBinding\nclass MainActivity : AppCompatActivity() {\n  private lateinit var binding: ActivityMainBinding\n\n  override fun onCreate(savedInstanceState: Bundle?) {\n    super.onCreate(savedInstanceState)\n    binding = ActivityMainBinding.inflate(layoutInflater)\n    setContentView(binding.root)\n\n    binding.btnSave.setOnClickListener {\n      val name = binding.etName.text.toString()\n      if (name.isBlank()) {\n        binding.etName.error = 'Name required'\n        return@setOnClickListener\n      }\n      saveUser(name)\n    }\n  }\n\n  override fun onPause() {\n    super.onPause() // always call super first\n    saveDraft()\n  }\n}",
    whenUsed:
      'Android native knowledge is essential for writing React Native TurboModules, debugging native crashes (ANR, SIGABRT), configuring Gradle build scripts, and understanding permission/manifest issues.',
    gotchas:
      'Never call super.onCreate() after setContentView() — it crashes. Always call super lifecycle methods first.\nActivity recreation on rotation: if savedInstanceState handling is missing, form state is lost.\nContext leaks: holding a reference to Activity context in a long-lived object (ViewModel, singleton) prevents GC and causes OOM.\nAndroid 13+ granular media permissions replace READ_EXTERNAL_STORAGE — check API level before requesting.',
    flashcards: [
      card('What is the Activity lifecycle order for a normal launch and why does it matter for RN?', 'onCreate → onStart → onResume (foreground). onPause → onStop → onDestroy (teardown). RN\'s AppState "active/background" events map to onResume/onPause. Lifecycle crashes from RN native modules often trace back to incorrect lifecycle stage assumptions.'),
      card('What is the difference between an explicit and implicit Intent?', 'Explicit Intent names the target component class (launches a specific Activity). Implicit Intent declares an action (ACTION_SEND, ACTION_VIEW) — Android resolves which app can handle it, enabling share sheets, file pickers, and browser links.'),
      card('What is ViewBinding and why is it preferred over findViewById?', 'ViewBinding generates a type-safe binding class per XML layout at build time. No runtime null risk from wrong IDs, no casting, no inflation overhead versus Kotlin synthetic views (deprecated).'),
      card('What is the Android Permission model post Android 6 (API 23)?', 'Dangerous permissions (location, camera, contacts) must be requested at runtime even if declared in AndroidManifest.xml. Users can grant/revoke per-permission at any time via Settings. Apps must handle DENIED and PERMANENTLY_DENIED states gracefully.'),
      card('What is a ViewModel and why does it survive rotation?', 'ViewModel is an Architecture Components class scoped to a screen that survives Activity/Fragment recreation (rotation, system kill). It holds UI state without holding an Activity reference — preventing context leaks and state loss.'),
      card('What is Gradle build variant and why is it important?', 'Build variants combine build type (debug/release) and product flavour (free/paid) to produce different APKs from the same source. Common use: debug builds point to staging API, release builds point to prod.'),
    ],
    apis: [
      api('Intent', 'Intent(context, Class) / Intent(action)', 'Starts activities, services, or broadcasts.', 'explicit: target class. Implicit: action string and optional data URI', 'Intent object', "// Explicit\nstartActivity(Intent(this, SettingsActivity::class.java))\n\n// Implicit — open URL\nstartActivity(Intent(Intent.ACTION_VIEW, Uri.parse(\"https://example.com\")))", 'Implicit intents may fail if no app handles them — wrap in try/catch or check resolveActivity first.'),
      api('ViewBinding / findViewById', 'ActivityNameBinding.inflate(layoutInflater) / findViewById<T>(R.id.viewId)', 'Accesses views from XML layouts.', 'generated binding class or view ID resource', 'view reference', "// ViewBinding (preferred)\nval binding = ActivityMainBinding.inflate(layoutInflater)\nbinding.tvTitle.text = \"Hello\"\n\n// Legacy\nval btn = findViewById<Button>(R.id.btnSave)", 'ViewBinding requires enabling in build.gradle: buildFeatures { viewBinding = true }. Never access binding before setContentView.'),
      api('SharedPreferences', 'getSharedPreferences(name, mode).edit().putString(key, val).apply()', 'Persists simple key-value data to an XML file.', 'preference file name, mode, key, and value', 'void (apply is async commit)', "val prefs = getSharedPreferences(\"settings\", Context.MODE_PRIVATE)\nprefs.edit()\n  .putString(\"theme\", \"dark\")\n  .putBoolean(\"notif\", true)\n  .apply() // async; use commit() if synchronous result needed", 'SharedPreferences is not encrypted — use EncryptedSharedPreferences for sensitive data.'),
      api('ViewModel + LiveData/StateFlow', 'class MyVM : ViewModel() { val state = MutableStateFlow(...) }', 'Lifecycle-aware state holder that survives configuration changes.', 'ViewModel subclass with state property', 'observed state in Activity/Fragment', "class CounterVM : ViewModel() {\n  private val _count = MutableStateFlow(0)\n  val count: StateFlow<Int> = _count.asStateFlow()\n  fun increment() { _count.value++ }\n}\n\n// In Activity\nval vm: CounterVM by viewModels()\nlifecycleScope.launch {\n  vm.count.collect { count -> binding.tvCount.text = count.toString() }\n}", 'Never pass Activity context into ViewModel — use applicationContext or the Application subclass.'),
      api('PermissionsAndroid (via RN) / ActivityCompat.requestPermissions', 'ActivityCompat.requestPermissions(activity, permissions, requestCode)', 'Requests dangerous permissions at runtime.', 'activity reference, permission array, request code int', 'void — result in onRequestPermissionsResult', "ActivityCompat.requestPermissions(\n  this,\n  arrayOf(Manifest.permission.CAMERA),\n  REQUEST_CAMERA\n)\n\noverride fun onRequestPermissionsResult(reqCode: Int, perms: Array<String>, results: IntArray) {\n  if (reqCode == REQUEST_CAMERA && results[0] == PackageManager.PERMISSION_GRANTED)\n    openCamera()\n}", 'Use Activity Result API (registerForActivityResult) in modern code — replaces deprecated onActivityResult.'),
    ],
    refs: [
      ref('Android Developer Docs', 'https://developer.android.com/docs'),
      ref('Android Activity Lifecycle', 'https://developer.android.com/guide/components/activities/activity-lifecycle'),
      ref('Kotlin Coroutines Guide', 'https://kotlinlang.org/docs/coroutines-guide.html'),
      ref('Jetpack Compose Basics', 'https://developer.android.com/jetpack/compose/tutorial'),
    ],
    relatedProjectIds: [],
  });
  skills.push(android);

  [
    ['Activity & Fragment Lifecycle', 'Ordered callbacks from creation to destruction that determine when to initialise UI, bind data, release resources, and save state.', "class ArticleActivity : AppCompatActivity() {\n  override fun onCreate(state: Bundle?) {\n    super.onCreate(state) // always first\n    setContentView(R.layout.activity_article)\n    // Restore state if rotation occurred\n    val articleId = state?.getString(\"articleId\") ?: intent.getStringExtra(\"articleId\")\n  }\n\n  override fun onSaveInstanceState(out: Bundle) {\n    super.onSaveInstanceState(out)\n    out.putString(\"articleId\", currentArticleId) // save before rotation\n  }\n\n  override fun onStop() {\n    super.onStop()\n    analyticsClient.flush() // do final work before background\n  }\n}"],
    ['Intents', 'Messaging objects that start Activities, Services, or BroadcastReceivers — explicit (named component) or implicit (action-based, resolved by the OS).', "// Share text via implicit intent\nval shareIntent = Intent(Intent.ACTION_SEND).apply {\n  type = \"text/plain\"\n  putExtra(Intent.EXTRA_TEXT, \"Check out this link: https://example.com\")\n}\nstartActivity(Intent.createChooser(shareIntent, \"Share via\"))\n\n// Open camera for result (Activity Result API)\nval takePicture = registerForActivityResult(ActivityResultContracts.TakePicture()) { success ->\n  if (success) displayPhoto()\n}\ntakePicture.launch(photoUri)"],
    ['Layouts & Jetpack Compose', 'XML-based ConstraintLayout/RecyclerView for traditional UIs; Jetpack Compose for declarative Kotlin UI.', "// Jetpack Compose — declarative, similar to React\n@Composable\nfun ProductCard(product: Product, onClick: () -> Unit) {\n  Card(\n    modifier = Modifier\n      .fillMaxWidth()\n      .clickable(onClick = onClick),\n    elevation = CardDefaults.cardElevation(4.dp)\n  ) {\n    Row(modifier = Modifier.padding(12.dp)) {\n      AsyncImage(model = product.imageUrl, contentDescription = null, modifier = Modifier.size(64.dp))\n      Spacer(Modifier.width(12.dp))\n      Column {\n        Text(product.name, style = MaterialTheme.typography.titleMedium)\n        Text(\"₹${product.price}\", style = MaterialTheme.typography.bodyLarge)\n      }\n    }\n  }\n}"],
    ['Resources & Density', 'Android resources (strings, drawables, layouts) adapt to screen density, language, and configuration via resource qualifier folders.', "// res/drawable-mdpi/   — 1x (160 dpi baseline)\n// res/drawable-hdpi/   — 1.5x\n// res/drawable-xhdpi/  — 2x\n// res/drawable-xxhdpi/ — 3x\n// res/drawable-xxxhdpi/ — 4x\n\n// Prefer vector drawables (no density variants needed):\n// res/drawable/ic_arrow.xml\n\n// Strings (localisation)\n// res/values/strings.xml        → English\n// res/values-hi/strings.xml     → Hindi\n// res/values-night/colors.xml   → Dark mode colours"],
    ['Manifest & Permissions', 'AndroidManifest.xml declares app components, features, and required permissions. Dangerous permissions still require runtime request post-Android 6.', "<!-- AndroidManifest.xml -->\n<manifest>\n  <!-- Normal permission — auto-granted -->\n  <uses-permission android:name=\"android.permission.INTERNET\" />\n  <!-- Dangerous — requires runtime request -->\n  <uses-permission android:name=\"android.permission.ACCESS_FINE_LOCATION\" />\n  <uses-permission android:name=\"android.permission.CAMERA\" />\n\n  <application ...>\n    <activity android:name=\".MainActivity\" android:exported=\"true\">\n      <intent-filter>\n        <action android:name=\"android.intent.action.MAIN\" />\n        <category android:name=\"android.intent.category.LAUNCHER\" />\n      </intent-filter>\n    </activity>\n  </application>\n</manifest>"],
    ['Gradle Basics', 'Gradle is Android\'s build system — manages dependencies, build variants, signing configs, and code shrinking.', "// app/build.gradle (Kotlin DSL)\nandroid {\n  compileSdk = 34\n  defaultConfig {\n    applicationId = \"com.example.app\"\n    minSdk = 24; targetSdk = 34\n    versionCode = 12; versionName = \"1.4.0\"\n  }\n  buildTypes {\n    release {\n      isMinifyEnabled = true\n      proguardFiles(getDefaultProguardFile(\"proguard-android-optimize.txt\"), \"proguard-rules.pro\")\n      signingConfig = signingConfigs.getByName(\"release\")\n    }\n  }\n}\ndependencies {\n  implementation(\"androidx.core:core-ktx:1.12.0\")\n  implementation(\"com.squareup.okhttp3:okhttp:4.12.0\")\n}"],
  ].forEach(([name, definition, codeExample]) => {
    skills.push(mk(name, 'mobile', android.id, {
      definition,
      codeExample,
      flashcards: [
        card(`What is the most common mistake developers make in ${name}?`, 'Assuming the state persists across configuration changes (rotation) — always use ViewModel or onSaveInstanceState for UI state that must survive recreation.'),
        card(`How does ${name} knowledge help a React Native engineer?`, 'Understanding the native layer helps diagnose crashes and warnings that surface in RN apps but originate in the Android SDK — especially lifecycle, permissions, and intent resolution issues.'),
      ],
    }));
  });

  // ─── ELECTRON (beginner to intermediate) ────────────────────────────────────
  const electron = mk('Electron', 'mobile', null, {
    definition:
      'Electron is a framework for building cross-platform desktop apps using web technologies (Chromium + Node.js). It runs two process types: the main process (Node.js, OS APIs) and renderer processes (Chromium, web UI). IPC bridges them. Security requires contextIsolation and preload scripts — direct Node.js access from renderer is disabled by default in modern Electron.',
    codeExample:
      "// main.js — Main process\nconst { app, BrowserWindow, ipcMain } = require('electron');\n\napp.whenReady().then(() => {\n  const win = new BrowserWindow({\n    width: 1200, height: 800,\n    webPreferences: {\n      preload: path.join(__dirname, 'preload.js'),\n      contextIsolation: true,   // security — mandatory in modern Electron\n      nodeIntegration: false,   // security — never enable in renderer\n    },\n  });\n  win.loadFile('index.html');\n});\n\nipcMain.handle('fs:readFile', async (event, filePath) => {\n  const content = await fs.promises.readFile(filePath, 'utf8');\n  return content;\n});\n\n// preload.js — bridge between main and renderer\nconst { contextBridge, ipcRenderer } = require('electron');\ncontextBridge.exposeInMainWorld('api', {\n  readFile: (path) => ipcRenderer.invoke('fs:readFile', path),\n});\n\n// renderer.js — web UI, no Node access\nconst content = await window.api.readFile('/path/to/file.txt');",
    whenUsed:
      'Used for building desktop wrappers around web apps, internal tooling, and dev tools that need both a native shell and a web renderer (VS Code, Figma, Slack are Electron apps).',
    gotchas:
      'nodeIntegration: true in renderer is a critical security vulnerability — any XSS can access the full Node.js API and the file system.\ncontextIsolation: false disables the preload sandbox — the renderer can access Electron internals directly, enabling privilege escalation.\nElectron bundles its own Chromium and Node.js — app size is 80–150MB before your code. ASAR packaging and electron-builder optimise this.\nAuto-updater requires code signing on both macOS (notarisation) and Windows (EV certificate) — unsigned updates are blocked by Gatekeeper/SmartScreen.',
    flashcards: [
      card('What is the security reason for contextIsolation: true?', 'contextIsolation runs preload scripts in an isolated context separate from the renderer\'s JS world. Without it, a preload script\'s Node/Electron APIs are accessible from any script running in the renderer — XSS becomes a full system compromise.'),
      card('Why should nodeIntegration: false be the default in Electron renderers?', 'Enabling nodeIntegration in the renderer means any JavaScript in that window (including third-party content, XSS payloads) has full Node.js access — read/write filesystem, spawn processes. contextBridge + preload is the safe alternative.'),
      card('What is the ipcMain.handle + ipcRenderer.invoke pattern?', 'handle registers a promise-returning handler in main; invoke calls it from renderer and awaits the result. This is the modern bidirectional IPC pattern — safer than ipcRenderer.sendSync (blocks renderer) and more structured than fire-and-forget send/on.'),
      card('What is the difference between app.getPath("userData") and app.getPath("temp")?', 'userData is a persistent app-specific directory (AppData/Roaming on Windows, ~/Library/Application Support on Mac) for settings/databases. temp is the OS temp directory, cleared by the OS. Never store important data in temp.'),
      card('What is ASAR and why is it used?', 'ASAR is Electron\'s archive format — packs all source files into a single app.asar archive for distribution. Prevents direct file editing (light obfuscation), improves require() performance by reducing filesystem stats, and produces a cleaner distribution bundle.'),
      card('What does electron-builder handle?', 'It packages the app into platform-specific installers (NSIS on Windows, DMG on Mac, AppImage/deb on Linux), handles code signing, ASAR packing, auto-updater artifacts (latest.yml), and multi-arch builds.'),
    ],
    apis: [
      api('app.whenReady', 'app.whenReady(): Promise<void>', 'Resolves when Electron has finished initialising and is ready to create windows.', 'none', 'Promise', "app.whenReady().then(() => {\n  createWindow();\n  app.on('activate', () => {\n    if (BrowserWindow.getAllWindows().length === 0) createWindow();\n  });\n});", 'On macOS, apps should re-create windows on activate if no windows exist — handle the activate event.'),
      api('BrowserWindow', "new BrowserWindow({ width, height, webPreferences: { preload, contextIsolation } })", 'Creates a native application window hosting a Chromium renderer.', 'options object — dimensions, frame, webPreferences', 'BrowserWindow instance', "const win = new BrowserWindow({\n  width: 1200, height: 800, frame: true,\n  webPreferences: {\n    preload: path.join(__dirname, 'preload.js'),\n    contextIsolation: true,\n    nodeIntegration: false,\n  },\n});\nwin.loadURL('http://localhost:3000');", 'Set frame: false for custom titlebar. webPreferences.contextIsolation must be true for security.'),
      api('ipcMain.handle', 'ipcMain.handle(channel, (event, ...args) => Promise<result>)', 'Registers an async handler in the main process invokable from renderer via ipcRenderer.invoke.', 'channel string and async handler function', 'void', "ipcMain.handle('dialog:openFile', async () => {\n  const { filePaths } = await dialog.showOpenDialog({ properties: ['openFile'] });\n  return filePaths[0] ?? null;\n});", 'Errors thrown in handler are forwarded to ipcRenderer.invoke rejection. Do not expose unrestricted fs/exec APIs.'),
      api('ipcRenderer.invoke', 'ipcRenderer.invoke(channel, ...args): Promise<result>', 'Calls a main process handle handler and returns its result.', 'channel string and arguments', 'Promise of handler return value', "// In preload.js\ncontextBridge.exposeInMainWorld('electron', {\n  openFile: () => ipcRenderer.invoke('dialog:openFile'),\n});\n\n// In renderer\nconst filePath = await window.electron.openFile();", 'Must be called from preload via contextBridge — never expose raw ipcRenderer to the renderer world.'),
      api('contextBridge.exposeInMainWorld', 'contextBridge.exposeInMainWorld(key, api)', 'Safely exposes a preload API to the renderer\'s window object without leaking Node context.', 'global key name and API object', 'void', "contextBridge.exposeInMainWorld('api', {\n  readFile: (p) => ipcRenderer.invoke('fs:read', p),\n  platform: process.platform,\n});", 'Only expose what the renderer needs. Never expose ipcRenderer itself — that gives the renderer unrestricted channel access.'),
      api('dialog.showOpenDialog', 'dialog.showOpenDialog(browserWindow?, options): Promise<{filePaths, canceled}>', 'Shows a native file picker dialog.', 'optional window and options (properties, filters, title)', '{ filePaths: string[], canceled: boolean }', "const { filePaths, canceled } = await dialog.showOpenDialog(win, {\n  properties: ['openFile', 'multiSelections'],\n  filters: [{ name: 'JSON', extensions: ['json'] }],\n});\nif (!canceled) loadFiles(filePaths);", 'Must be called from main process (or via IPC from renderer). Returns empty filePaths if user cancels.'),
      api('shell.openExternal', 'shell.openExternal(url): Promise<void>', 'Opens a URL in the default browser or application — the correct way to open links from Electron.', 'URL string', 'Promise<void>', "// In main via IPC\nipcMain.handle('open-url', (_, url) => shell.openExternal(url));\n\n// Or directly in main process\nshell.openExternal('https://docs.example.com');", 'Never use window.open or <a target="_blank"> for external links — they open a new Electron window with full Node access if nodeIntegration is on.'),
      api('Menu.buildFromTemplate', 'Menu.buildFromTemplate(template): Menu', 'Builds a native application menu or context menu from a template array.', 'array of MenuItemConstructorOptions', 'Menu instance', "const menu = Menu.buildFromTemplate([\n  {\n    label: 'File',\n    submenu: [\n      { label: 'Open…', accelerator: 'CmdOrCtrl+O', click: openFile },\n      { type: 'separator' },\n      { role: 'quit' },\n    ],\n  },\n  { role: 'editMenu' },\n]);\nMenu.setApplicationMenu(menu);", 'Use role for standard items (cut, copy, paste, quit) — they get correct platform labels and keyboard shortcuts automatically.'),
    ],
    refs: [
      ref('Electron Docs', 'https://www.electronjs.org/docs/latest'),
      ref('Electron Security Guide', 'https://www.electronjs.org/docs/latest/tutorial/security'),
      ref('electron-builder', 'https://www.electron.build/'),
      ref('IPC (Main ↔ Renderer)', 'https://www.electronjs.org/docs/latest/tutorial/ipc'),
      ref('Electron Forge', 'https://www.electronforge.io/'),
    ],
    relatedProjectIds: [],
  });
  skills.push(electron);

  [
    ['Main vs Renderer Process', 'Main process: one per app, full Node.js access, manages windows and OS APIs. Renderer process: one per window, Chromium web runtime, no direct Node access by default.', "// Main process — Node.js APIs available\nconst os = require('os');\nconst { app, BrowserWindow } = require('electron');\nconsole.log('Memory:', os.totalmem()); // works\n\n// Renderer process (browser-like environment)\ndocument.getElementById('info').textContent = window.location.href;\n// require('os') — ❌ throws (nodeIntegration:false)\n// window.api.getMemory() — ✅ via contextBridge preload"],
    ['IPC (ipcMain / ipcRenderer)', 'Inter-process communication allows renderer to request data/actions from main and receive responses. Use ipcMain.handle + ipcRenderer.invoke for request-response patterns.', "// main.js\nipcMain.handle('get-app-version', () => app.getVersion());\n\nipcMain.handle('save-file', async (event, { path: filePath, content }) => {\n  await fs.promises.writeFile(filePath, content, 'utf8');\n  return { success: true };\n});\n\n// preload.js\ncontextBridge.exposeInMainWorld('appApi', {\n  getVersion: () => ipcRenderer.invoke('get-app-version'),\n  saveFile:   (p, c) => ipcRenderer.invoke('save-file', { path: p, content: c }),\n});\n\n// renderer\nconst version = await window.appApi.getVersion();"],
    ['BrowserWindow & Lifecycle', 'BrowserWindow creates and manages application windows. The app lifecycle (ready, window-all-closed, activate) controls when to create/destroy windows.', "app.whenReady().then(() => {\n  const win = new BrowserWindow({\n    width: 1024, height: 768,\n    titleBarStyle: 'hiddenInset',  // macOS traffic lights inline\n    webPreferences: {\n      preload: path.join(__dirname, 'preload.js'),\n      contextIsolation: true,\n    },\n  });\n  win.loadFile('dist/index.html');\n\n  // Re-open on macOS Dock click\n  app.on('activate', () => {\n    if (BrowserWindow.getAllWindows().length === 0) win.show();\n  });\n});\n\napp.on('window-all-closed', () => {\n  if (process.platform !== 'darwin') app.quit();\n});"],
    ['Preload Scripts & contextBridge', 'Preload runs in an isolated context with Node access before the renderer page loads — the safe bridge for exposing selective APIs via contextBridge.', "// preload.js\nconst { contextBridge, ipcRenderer } = require('electron');\n\ncontextBridge.exposeInMainWorld('electronAPI', {\n  // Expose only specific, validated IPC calls\n  openFile:     ()        => ipcRenderer.invoke('dialog:openFile'),\n  saveSettings: (prefs)   => ipcRenderer.invoke('settings:save', prefs),\n  onThemeChange:(handler) => {\n    const cb = (_, value) => handler(value);\n    ipcRenderer.on('theme-changed', cb);\n    return () => ipcRenderer.removeListener('theme-changed', cb); // cleanup\n  },\n  platform: process.platform, // static value — safe to expose directly\n});"],
    ['Native Menus & Dialogs', 'Electron provides native OS menus (menu bar, context menus) and dialogs (file picker, message box) via the Menu and dialog modules in main process.', "// Context menu on right-click\nipcMain.on('show-context-menu', (event) => {\n  const menu = Menu.buildFromTemplate([\n    { label: 'Copy',  role: 'copy' },\n    { label: 'Paste', role: 'paste' },\n    { type: 'separator' },\n    { label: 'Inspect Element', click: () => event.sender.inspectElement(0, 0) },\n  ]);\n  menu.popup({ window: BrowserWindow.fromWebContents(event.sender) });\n});\n\n// Message box\nconst { response } = await dialog.showMessageBox(win, {\n  type: 'warning', buttons: ['Cancel', 'Delete'],\n  message: 'Delete this file?', detail: 'This cannot be undone.',\n});\nif (response === 1) deleteFile();"],
    ['Packaging & Distribution', 'electron-builder creates platform installers, handles code signing, and produces auto-updater artifacts.', "// electron-builder.yml\nappId: com.example.myapp\nproductName: MyApp\nfiles:\n  - dist/**\n  - node_modules/**\nmac:\n  category: public.app-category.productivity\n  hardenedRuntime: true\n  gatekeeperAssess: false\nwin:\n  target: nsis\nnsis:\n  oneClick: false\n  allowToChangeInstallationDirectory: true\npublish:\n  provider: github\n  owner: myorg\n  repo: myapp\n\n# Build commands\nnpm run build          # compile renderer\nelectron-builder --mac --win --linux"],
  ].forEach(([name, definition, codeExample]) => {
    skills.push(mk(name, 'mobile', electron.id, {
      definition,
      codeExample,
      flashcards: [
        card(`What is the primary security consideration in ${name}?`, 'Keeping Node.js APIs out of the renderer — contextIsolation + preload is the only safe pattern. Any shortcut (nodeIntegration:true, contextIsolation:false) turns any XSS into a system-level compromise.'),
        card(`What breaks most often in ${name} during production deployment?`, 'Code signing — unsigned macOS builds are blocked by Gatekeeper, unsigned Windows builds trigger SmartScreen. Set up signing certificates and notarisation early in the release pipeline.'),
      ],
    }));
  });

  // ─── RN PERFORMANCE (DEEP DIVE) SUB-TOPIC ─────────────────────────────────
  const subRnPerf = mk('RN Performance (Deep Dive)', 'mobile', rn.id, {
    definition:
      "React Native's rendering pipeline keeps JavaScript on a dedicated thread that must complete all work within 16.67ms per frame to hold 60fps — heavy synchronous JS work blows the frame budget and drops frames. State updates flow through React reconciliation, then across the async bridge (old architecture) or JSI direct calls (new architecture) to the native UI thread where actual views are mutated. Performance wins come from reducing per-frame JS work, virtualizing long lists, memoizing referentially-stable props, deferring non-critical computation with InteractionManager, and enabling Hermes for precompiled-bytecode startup.",
    codeExample:
      "import React, { useCallback, useState } from 'react';\nimport { FlatList, Text, Pressable, StyleSheet } from 'react-native';\n\nconst ITEM_HEIGHT = 60;\n\nconst ProductRow = React.memo(({ item, onPress }) => (\n  <Pressable style={styles.row} onPress={() => onPress(item.id)}>\n    <Text style={styles.name}>{item.name}</Text>\n    <Text style={styles.price}>₹{item.price}</Text>\n  </Pressable>\n));\n\nexport default function ProductList({ data, onLoadMore }) {\n  const [selected, setSelected] = useState(null);\n\n  // Stable reference — ProductRow won't re-render due to onPress\n  const handlePress = useCallback((id) => setSelected(id), []);\n\n  const renderItem = useCallback(\n    ({ item }) => <ProductRow item={item} onPress={handlePress} />,\n    [handlePress],\n  );\n\n  const getItemLayout = useCallback(\n    (_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }),\n    [],\n  );\n\n  return (\n    <FlatList\n      data={data}\n      keyExtractor={(item) => item.id}     // stable ID — never use array index\n      renderItem={renderItem}              // useCallback-wrapped\n      getItemLayout={getItemLayout}        // skips measure, enables scrollToIndex\n      initialNumToRender={10}              // first paint batch\n      maxToRenderPerBatch={10}             // rows added per scroll tick\n      windowSize={5}                       // keep 5 viewports mounted\n      removeClippedSubviews                // unmount off-screen rows (Android)\n      onEndReachedThreshold={0.4}\n      onEndReached={onLoadMore}\n    />\n  );\n}\n\nconst styles = StyleSheet.create({\n  row: { height: ITEM_HEIGHT, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#e0e0e0' },\n  name: { flex: 1, fontSize: 15 },\n  price: { fontSize: 15, fontWeight: '700', color: '#2e7d32' },\n});",
    gotchas:
      "React.memo is useless when the parent passes inline objects, arrays, or arrow functions as props — they're new references every render, memo never short-circuits.\nuseCallback on renderItem only helps if the row component is also React.memo — without both, rows re-render regardless of referential equality.\ngetItemLayout height must exactly match the StyleSheet value — an off-by-one causes scrollToIndex to land on the wrong item.\nremoveClippedSubviews can cause blank flashes on iOS during fast scrolling — safe on Android, leave off on iOS by default.\nContext with high-churn values (scroll position, animation progress) cascades re-renders to all consumers — use Reanimated shared values or Zustand for high-frequency state instead.",
    flashcards: [
      card('Why does 60 FPS matter and what\'s the frame budget?', 'Below 60 FPS users perceive lag. Frame budget = 16.67ms. JS thread must finish all work for a frame in that window — heavy synchronous work blows the budget and drops frames.'),
      card('RN rendering pipeline — what happens on a state update?', 'JS thread computes new VDOM → reconciliation diffs old vs new → diff serialized across bridge (old arch) or JSI direct call (new arch) → shadow tree updates → native UI thread mounts/updates views. Bottlenecks usually live in bridge traffic or JS work.'),
      card('What is reconciliation in React Native?', 'React\'s diff algorithm — compares new render output to previous, computes minimal set of UI mutations. Same as React web. Keys (stable IDs) help reconciliation match elements across renders.'),
      card('Common causes of unnecessary re-renders?', 'State updates in parent, inline object/array/function props (new reference every render), non-memoized children, context value churn, unstable keys in lists.'),
      card('React.memo — when is it actually useful?', 'Component renders frequently AND props rarely change AND comparing props is cheaper than re-rendering. Pointless if parent passes inline objects/functions — they\'re always new references, memo never hits.'),
      card('useMemo vs useCallback — what each memoizes?', 'useMemo memoizes a computed value. useCallback memoizes a function reference. useCallback(fn, deps) ≡ useMemo(() => fn, deps).'),
      card('What is a stale closure in React hooks?', 'A hook captures variables from a render that\'s no longer current — reads outdated state. Classic case: setInterval inside useEffect with empty deps reading `count`. Fix: include in deps, use ref, or functional setter.'),
      card('Why does Context API become a perf bottleneck?', 'Every consumer of a context re-renders when the value changes. If many consumers + frequent updates → cascade re-renders. Fixes: split contexts by churn rate, memoize the value, use external state libs (Zustand) for high-churn data.'),
      card('FlatList vs ScrollView for long lists?', 'FlatList virtualizes — renders only viewport items, recycles offscreen rows. ScrollView mounts every child immediately — memory and first-paint cost scales with list length. Use FlatList past 20–30 items.'),
      card('Key FlatList perf props?', 'initialNumToRender (first batch size), maxToRenderPerBatch (per scroll tick), windowSize (viewports kept mounted, default 21), removeClippedSubviews (Android win, iOS caveats), getItemLayout (skip measurement when row height is fixed).'),
      card('Why must keyExtractor be stable?', 'Keys identify items across re-renders. Stable IDs let React reuse views; unstable keys (index, random) force re-mount on every reorder → janky scrolling and lost component state.'),
      card('JS thread vs UI thread — who does what?', 'JS thread: runs your JavaScript (business logic, state, effects). UI thread (main/native): rendering, gestures, native UI updates. They communicate via bridge (old arch) or JSI (new arch). Blocking JS thread freezes touch responsiveness.'),
      card('What is the bridge bottleneck (old architecture)?', 'Bridge sends serialized JSON messages between JS and native, async + batched. High-frequency calls (per-frame animations, sensor streams) saturate the bridge → frame drops. JSI eliminates this.'),
      card('How to optimize images in RN?', 'Use WebP/AVIF over PNG/JPG, size assets to target resolution (not arbitrary 4K), lazy load below the fold, cache (FastImage / expo-image), avoid `resizeMode: cover` on huge sources.'),
      card('Why is react-native-fast-image preferred over Image for remote images?', 'Native-level caching (memory + disk), priority hinting, better cache invalidation, faster decode on Android. Built-in <Image> caching is platform-inconsistent and weaker.'),
      card('How to reduce app startup time?', 'Enable Hermes, defer non-critical imports (require inside handlers), lazy-load screens via React.lazy or navigation lazy, strip unused libs, shrink Android bundle with Proguard/R8, avoid sync work in component constructors.'),
      card('Bundle size — first thing to investigate?', 'Run `react-native-bundle-visualizer` or source-map-explorer. Look for: full moment.js (use date-fns or dayjs), full lodash (cherry-pick), duplicate React versions in node_modules, debug-only libs leaking into prod.'),
      card('Common memory leak sources in RN?', 'Uncleared setInterval/setTimeout, event listeners not removed in useEffect cleanup, NetInfo/AppState/Linking subscriptions, navigation state holding refs, large in-memory caches that only grow.'),
      card('How to detect memory leaks in production?', 'Increasing memory over session (visible in Flipper / Xcode Instruments / Android Studio Profiler). Crashes labeled OOM. Heap snapshots compared across user flows. Repro by navigating in a loop and watching heap.'),
      card('Tools to profile a RN app?', 'Flipper (general inspection), React DevTools Profiler (component renders), Hermes Profiler (CPU sampling), Xcode Instruments (iOS native), Android Studio Profiler (Android native), Perf Monitor overlay.'),
      card('Debouncing vs throttling — pick when?', 'Debounce: fire only after user stops triggering for X ms — search inputs, autocomplete. Throttle: fire at most every X ms — scroll handlers, resize, gestures.'),
      card('What is request batching?', 'Group multiple state updates / API calls into one. React 18 auto-batches state updates within event handlers and effects. For network, batch related GETs into one endpoint or use TanStack Query\'s deduplication.'),
      card('Why do navigation stacks affect perf?', 'React Navigation keeps screens mounted by default — N screens deep = N components in memory. Solutions: detached stacks, lazy-load screens, unmount-on-blur for heavy screens.'),
      card('Optimistic UI — what\'s the trade-off?', 'Update UI immediately on user action, reconcile with server response later. Wins on perceived speed. Risk: rollback complexity if server rejects, stale views if you forget reconciliation, double-actions if not idempotent.'),
    ],
    apis: [
      api('React.memo', 'React.memo<P>(component: FC<P>, areEqual?: (prev: P, next: P) => boolean): FC<P>', 'HOC that skips re-render when props shallow-equal.', 'component — the component to memoize. areEqual — optional custom comparator.', 'Memoized component.', "const Row = React.memo(({ item }) => <Text>{item.name}</Text>);", "Useless when parent passes inline objects/functions — they're always new references."),
      api('useCallback', 'useCallback<T extends Function>(fn: T, deps: any[]): T', 'Memoize function reference across renders.', 'fn — the function. deps — dependency array.', 'Stable function reference.', 'const onPress = useCallback(() => doThing(id), [id]);', 'Only useful when consumer relies on referential equality (memo, effect dep).'),
      api('InteractionManager.runAfterInteractions', 'InteractionManager.runAfterInteractions(task: () => void): Handle', 'Defer heavy work until animations/gestures finish.', 'task — function to run after the interaction.', 'Cancel handle.', 'InteractionManager.runAfterInteractions(() => doExpensiveWork());', "Not guaranteed to run quickly; if no interactions, runs ASAP. Don't use for time-sensitive UI work."),
      api('requestAnimationFrame', 'requestAnimationFrame(cb: (timestamp: number) => void): number', 'Schedule callback to run before next paint.', 'cb — invoked with high-res timestamp.', 'ID for cancelAnimationFrame.', 'requestAnimationFrame(() => updateAnimatedValue());', "Throttled when app is backgrounded. Don't chain unbounded — use Reanimated worklets for per-frame animation logic."),
    ],
    refs: [
      ref('RN Performance Docs', 'https://reactnative.dev/docs/performance'),
      ref('Reanimated 3 Docs', 'https://docs.swmansion.com/react-native-reanimated/'),
      ref('RN New Architecture', 'https://reactnative.dev/docs/the-new-architecture/landing-page'),
      ref('Hermes GitHub', 'https://github.com/facebook/hermes'),
      ref('Flipper Docs', 'https://fbflipper.com/docs/'),
    ],
  });
  skills.push(subRnPerf);

  // ─── RN SECURITY SUB-TOPIC ─────────────────────────────────────────────────
  const subRnSec = mk('RN Security', 'mobile', rn.id, {
    definition:
      "React Native apps ship as inspectable binaries — APKs and IPAs can be decompiled with JADX or Hopper, secrets extracted, and runtime behavior intercepted via Frida. AsyncStorage stores data as plain text on disk and must never hold tokens or credentials; use react-native-keychain (iOS Keychain / Android Keystore) for any sensitive values. Mobile security follows OWASP Mobile Top 10: the highest-impact risks for RN apps are improper credential usage, insecure data storage, insufficient transport layer security, and inadequate binary protection.",
    codeExample:
      "import * as Keychain from 'react-native-keychain';\n\n// Store JWT after login — hardware-backed, biometric-gated\nexport async function saveAuthToken(userId, token) {\n  await Keychain.setGenericPassword(userId, token, {\n    service: 'com.myapp.auth',\n    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,\n    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,\n  });\n}\n\n// Retrieve — triggers biometric prompt because accessControl was set\nexport async function getAuthToken() {\n  try {\n    const creds = await Keychain.getGenericPassword({\n      service: 'com.myapp.auth',\n      authenticationPrompt: { title: 'Confirm your identity' },\n    });\n    return creds ? creds.password : null;\n  } catch {\n    return null; // user cancelled biometric prompt\n  }\n}\n\n// Wipe on logout\nexport async function clearAuthToken() {\n  await Keychain.resetGenericPassword({ service: 'com.myapp.auth' });\n}",
    gotchas:
      "react-native-keychain silently falls back to software-backed storage on Android emulators and older devices without a Secure Element — always test on real hardware for production security validation.\nSSL pinning breaks when you rotate server certificates; ship pinned certs with an expiry buffer and pre-test the re-pin flow before it reaches production users.\nRoot/jailbreak detection is trivially bypassable with Magisk Hide or Frida — use it to add friction on high-risk operations, not as a hard gate that locks out entire app functionality.\nconsole.log outside `if (__DEV__)` ships to production and is readable via `adb logcat` — strip logs in release builds using babel-plugin-transform-remove-console.\nOTA updates (CodePush/Expo Updates) bypass App Store review — always verify bundle signatures client-side and stage rollouts carefully; a bad push can silently corrupt all active sessions.",
    flashcards: [
      card('Why is mobile app security harder than backend?', "The binary is on the user's device — fully inspectable. Hardcoded secrets, API keys, business logic can all be extracted. Assume any client-side check is bypassable; enforce in backend."),
      card('Why is AsyncStorage NOT for sensitive data?', 'Plain text on disk, not encrypted. Anyone with device access (rooted device, USB debugging, backup extraction) can read it. Use Keychain/Keystore for tokens, passwords, financial data.'),
      card('iOS Keychain vs Android Keystore?', 'iOS Keychain: encrypted key-value store, can be hardware-backed via Secure Enclave. Android Keystore: hardware-backed key storage for cryptographic keys; pair with EncryptedSharedPreferences for K/V. Both gate access by biometrics/PIN.'),
      card('Which library exposes secure storage in RN?', 'react-native-keychain — unified API over iOS Keychain and Android Keystore. setGenericPassword/getGenericPassword for tokens, accessControl options for biometric gates.'),
      card('Where to store a JWT in a RN app?', 'react-native-keychain (Keychain/Keystore-backed). Never AsyncStorage. Avoid plain SQLite columns. For very high-security apps, gate retrieval with biometric prompt.'),
      card('What is SSL pinning?', 'Client embeds the expected server certificate (or public key hash) and rejects any other cert during TLS handshake. Defeats MITM via rogue CAs or installed root certs. Library: react-native-ssl-pinning.'),
      card('What is a MITM attack?', "Attacker positions between client and server, intercepts and possibly modifies traffic. Possible on hostile WiFi or via installed malicious root certs. TLS alone doesn't prevent it if the client trusts attacker's cert — pinning closes that gap."),
      card('Why never hardcode API keys in the app binary?', 'APK/IPA can be decompiled (JADX, APKTool) and strings extracted in minutes. Anything in the bundle is public. Proxy through your backend, or use ephemeral tokens issued post-auth.'),
      card('How to manage env-specific configuration in RN?', "react-native-config injects native-level env vars at build time. Variants per environment (.env.dev, .env.prod). Still don't put real secrets here — only public values like API base URLs and feature flags."),
      card('What does ProGuard / R8 do?', 'Android code shrinkers + obfuscators. Strip dead code, rename classes/methods to short names, optionally optimize bytecode. Smaller APK, harder reverse engineering. Enable in release build.gradle.'),
      card('Tools attackers use to reverse-engineer mobile apps?', 'JADX (decompile APK to Java), APKTool (resource extraction, smali), Frida (runtime instrumentation, function hooking), Hopper / Ghidra (iOS binaries), MobSF (automated mobile security scanner).'),
      card('What is Frida and why is it a threat?', 'Runtime instrumentation framework — hooks functions in a running app, modifies behavior, reads memory. Bypasses SSL pinning, biometric checks, root detection. Mitigate with RASP/anti-tamper libraries (still cat-and-mouse).'),
      card('What is RASP?', 'Runtime Application Self-Protection — code that detects tampering, debugging, hooking, root/jailbreak at runtime and reacts (warn, exit, wipe). Examples: Talsec, Promon SHIELD, Approov.'),
      card('Root/jailbreak detection — should you rely on it?', 'As one signal, not the only protection. Detection can be bypassed (Magisk Hide, Frida). Use to gate high-risk operations (banking, payments) with extra friction, not absolute denial.'),
      card('How to detect emulators?', 'Hardware fingerprints (Build.FINGERPRINT contains "generic"), missing sensors, default IMEI patterns, emulator-specific files (`/dev/socket/qemud`). Combine signals — single checks are easy to spoof.'),
      card('Biometric auth in RN — which library?', 'react-native-biometrics — supports TouchID, FaceID, Android fingerprint/face. Returns cryptographically signed tokens you can pair with backend challenge-response, not just a boolean.'),
      card('What is biometric spoofing?', 'Bypassing biometric checks via cached prompts, instrumentation, or fake sensors. Mitigate by signing a challenge with a key gated behind biometric unlock — checking "did user pass biometric" as a boolean is weak.'),
      card('Deep link hijacking — how does it happen?', 'Multiple apps register the same URL scheme. Malicious app intercepts the link before yours opens. Mitigate with App Links (Android) / Universal Links (iOS) — verified via domain ownership.'),
      card('Why is frontend input validation insufficient?', 'Frontend can be modified, bypassed by direct API calls, or run in a tampered binary. Backend MUST re-validate every input. Frontend validation exists only for UX (instant feedback).'),
      card('Why must RBAC be enforced server-side?', 'Frontend role checks are just UI hiding. A modified client (or direct API call with valid token) bypasses them. Server checks role on every protected endpoint, every time.'),
      card('What is rate limiting and where does it live?', 'Cap on requests per user/IP/key over a window. Protects against brute force, scraping, DDoS, runaway clients. Enforced at API gateway (coarse) and/or app middleware (per-endpoint, per-user).'),
      card('How long should an access token live?', 'Short — 15 min typical. Pair with longer-lived refresh token. Short access tokens limit blast radius if leaked. Backend rotates refresh tokens on each use and detects reuse (token theft signal).'),
      card('Where to store refresh tokens in RN?', 'Secure storage only (Keychain/Keystore). Refresh tokens are long-lived — leaking them means long-term account compromise. Optionally gate retrieval with biometric prompt for high-risk apps.'),
      card('What is a replay attack?', 'Attacker captures a valid request and re-sends it. Defenses: short-lived nonces, timestamp + max-skew window, idempotency keys, mTLS, signed requests with sequence numbers.'),
      card('What is API request signing?', 'Client signs each request with a shared or per-session key (HMAC). Server verifies signature includes timestamp + body hash. Prevents tampering and replay. Common in financial / payment APIs.'),
      card('How to detect app tampering?', 'Verify app signature at runtime, checksum the binary, validate Google Play Integrity / DeviceCheck (iOS) attestations server-side, compare expected install source. Combine signals.'),
      card('Why protect source maps in production?', "Source maps reveal original (unminified) source code. If shipped publicly, attacker reads logic and finds vulnerabilities trivially. Generate for crash reporting (Sentry) but don't serve from public URL."),
      card('OTA update security risks?', "If update channel isn't signed/verified, attacker can push malicious JS bundle. CodePush/Expo Updates sign updates — verify signature client-side. Restrict update sources, audit version diffs before rollout."),
      card('OWASP Mobile Top 10 — what does it cover?', 'Ranked list of common mobile vulnerabilities — improper credential usage, inadequate supply chain, insecure auth/authz, insufficient input validation, insecure communication, inadequate privacy controls, insufficient binary protection. Read it.'),
      card('Why remove logs in production builds?', 'console.log statements may print tokens, PII, API responses. Visible via `adb logcat` or iOS device logs. Strip with Babel plugin (transform-remove-console) or wrap in `if (__DEV__)`.'),
      card('How to track dependency vulnerabilities?', 'npm audit (built-in), Snyk, Dependabot (GitHub), Socket.dev. Run in CI, block merge on critical CVEs. Mobile apps inherit risk from every transitive dep — keep them current.'),
      card('Authentication vs authorization — one-liner?', 'Authn = "who are you?" (login, identity proof). Authz = "what can you do?" (permission check on resource). Authn happens once per session; authz on every protected operation.'),
    ],
    apis: [
      api('Keychain.setGenericPassword', 'setGenericPassword(username: string, password: string, options?: Options): Promise<false | Result>', 'Store credentials in Keychain (iOS) / Keystore (Android).', 'username, password, options (accessControl, accessGroup, service).', 'Promise resolving to result or false on failure.', 'await Keychain.setGenericPassword("user", jwtToken, { accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY });', 'Android emulators without secure hardware fall back to less-secure software keystore. Test on real device.'),
      api('Keychain.getGenericPassword', 'getGenericPassword(options?: Options): Promise<false | UserCredentials>', 'Retrieve stored credentials. Triggers biometric prompt if accessControl was set.', 'options — service identifier, prompt config.', 'Credentials object or false if not found.', 'const creds = await Keychain.getGenericPassword(); if (creds) useToken(creds.password);', 'On biometric-gated entries, will throw on prompt cancel — wrap in try/catch.'),
      api('ReactNativeBiometrics.simplePrompt', 'simplePrompt(options: { promptMessage: string }): Promise<{ success: boolean }>', 'Show biometric prompt (TouchID/FaceID/fingerprint) — returns boolean only.', 'options.promptMessage shown to user.', 'Promise with success boolean.', 'const { success } = await ReactNativeBiometrics.simplePrompt({ promptMessage: "Confirm action" });', 'Boolean alone is spoofable. For high-security, use createSignature to sign a server challenge with a biometric-gated key.'),
    ],
    refs: [
      ref('Android Keystore', 'https://developer.android.com/training/articles/keystore'),
      ref('iOS Keychain Services', 'https://developer.apple.com/documentation/security/keychain_services'),
      ref('react-native-keychain GitHub', 'https://github.com/oblador/react-native-keychain'),
      ref('OWASP Mobile Top 10', 'https://owasp.org/www-project-mobile-top-10/'),
      ref('RN Security Docs', 'https://reactnative.dev/docs/security'),
    ],
  });
  skills.push(subRnSec);

  // ─── MOBILE APP ARCHITECTURE PATTERNS ──────────────────────────────────────
  const archPatternsSkill = mk('Mobile App Architecture Patterns', 'mobile', null, {
    definition: 'Architecture patterns are the foundational shapes of a mobile app — offline-first, real-time, local-collaborative, event-sourced, on-device AI, server-driven UI, microfrontend, push-sync, hybrid native, heavy-animation. Each solves a different hard constraint. Senior engineers pick the right pattern for the problem, not the trendy one. Most production apps combine 2-3 patterns.',
    codeExample: `// Pattern selection by primary constraint:
//
// "Must work without internet"           → Offline-first
// "Updates must be instant, sub-second"  → Real-time streaming
// "Multiple users editing same data"     → Local-first collaborative (CRDT)
// "Audit trail / time-travel debug"      → Event-sourced / CQRS
// "Privacy, no network, low-latency ML"  → On-device AI
// "Change UI without app release"        → Server-driven UI
// "5+ teams owning different sections"   → Microfrontend
// "Data ready when user opens app"       → Push-sync / background
// "Legacy native app being modernized"   → Hybrid native + RN
// "Visual polish, 60fps, GPU effects"    → Heavy-animation

// Real apps combine patterns:
// Trading app = Real-time + Heavy-animation + Offline-first
// WhatsApp = Offline-first + Real-time + Push-sync
// Uber driver = Real-time + Background-heavy + Offline-first`,
    flashcards: [
      card('How do you pick an architecture pattern for a new app?', 'Identify the hardest constraint first. "Must work offline" forces offline-first. "Real-time updates required" forces streaming. "Multiple teams own sections" forces microfrontend. Pattern follows constraint — not preference, not trend.'),
      card('Can architecture patterns be combined?', 'Yes — real production apps combine 2-3 patterns. Trading app = real-time streaming (live prices) + heavy-animation (charts) + offline-first (positions cached). WhatsApp = offline-first (messages) + real-time (delivery) + push-sync (background fetch).'),
      card('What is the cost of picking the wrong pattern?', 'Rewriting core data flow halfway through. Example: building chat with REST polling, then realizing you need real-time — entire state management changes. Costs months. Pattern choice is high-leverage, low-reversibility.'),
      card('Senior vs mid engineer on architecture patterns?', 'Mid picks the pattern they know best. Senior identifies the constraint, evaluates 2-3 candidate patterns, considers operational cost (debugging, observability, team familiarity), and picks the simplest one that solves the actual constraint.'),
      card('When is "just REST + Redux" the right answer?', 'When no special constraint applies — read-mostly app, online-only acceptable, single team, no real-time needs, no offline editing. Most apps. Adding offline-first or microfrontends without need is over-engineering.'),
      card('Why is offline-first often combined with real-time?', 'Offline-first handles "no connection." Real-time handles "connection is fast." Together they cover the full connectivity spectrum — app works on metro WiFi, in elevator, on flight. Most modern consumer apps need both.'),
      card('What pattern does an AI-integrated mobile app typically use?', 'Often hybrid: server-side for heavy LLM calls (API key safety, model size), on-device AI for privacy-sensitive or low-latency tasks (transcription, OCR). Plus streaming pattern for chat UX. Three patterns combined.'),
    ],
    refs: [
      ref('Local-first software (Ink & Switch)', 'https://www.inkandswitch.com/local-first/'),
      ref('React Native architecture overview', 'https://reactnative.dev/architecture/landing-page'),
      ref('Patterns for distributed systems (Martin Fowler)', 'https://martinfowler.com/articles/patterns-of-distributed-systems/'),
    ],
    relatedProjectIds: ['p-stock', 'p-editor'],
  });
  skills.push(archPatternsSkill);

  // Sub 1: Offline-First
  skills.push(mk('Offline-First Architecture', 'mobile', archPatternsSkill.id, {
    definition: 'App treats local storage as source of truth. Server is a sync target, not a dependency. Works fully without internet; syncs when available. Used in field service, healthcare, notes, reading, banking in poor-connectivity regions.',
    codeExample: `// Optimistic write with mutation queue
async function createNote(text) {
  const note = { id: uuid(), text, status: 'pending', createdAt: Date.now() };

  // 1. Write locally first (optimistic)
  await db.notes.insert(note);

  // 2. Queue for sync
  await mutationQueue.enqueue({
    type: 'CREATE_NOTE',
    payload: note,
    idempotencyKey: note.id,
    retries: 0,
  });

  // 3. UI updates immediately from local store
  return note;
}

// Background sync worker
async function syncQueue() {
  if (!(await NetInfo.fetch()).isConnected) return;

  const pending = await mutationQueue.getAll();
  for (const mutation of pending) {
    try {
      await api.applyMutation(mutation);
      await mutationQueue.markDone(mutation.id);
    } catch (e) {
      if (mutation.retries > 5) await mutationQueue.deadLetter(mutation.id);
      else await mutationQueue.incrementRetry(mutation.id);
    }
  }
}`,
    gotchas: `Connectivity detection is unreliable — "connected" ≠ "internet works." Captive portals look connected. Ping your API to confirm reachability before sync.
Mutation queue without idempotency keys causes double-creates on retry — every mutation needs a stable idempotency key.
Conflict resolution strategy must match data semantics — last-write-wins works for prefs but destroys data in concurrent edits; pick per entity type.
Partial sync cursors going stale — after a long offline gap, a last-sync timestamp may miss server-side deletes; design sync to handle tombstones.
Dead-lettered mutations silently dropped — always surface them to the user ("3 changes failed to sync") so they can resolve manually.`,
    flashcards: [
      card('What is offline-first architecture?', 'Local storage is the source of truth. App writes locally first, then syncs to server in background. Reads always come from local. App works fully without network. Contrast with online-first where server is truth and offline is a degraded mode.'),
      card('Which storage layer for offline-first on RN?', 'SQLite (relational, complex queries, joins) via op-sqlite or expo-sqlite — best for entity data. MMKV (key-value, fastest, mmap-based) for prefs and small state. Realm or WatermelonDB for sync-aware object DBs. AsyncStorage is too slow and unencrypted for serious offline data.'),
      card('What is a mutation queue?', "Persisted list of pending writes (CREATE, UPDATE, DELETE) waiting to be synced. Survives app kill. Replayed on reconnect. Each mutation has an idempotency key so re-applying on retry doesn't double-create."),
      card('How do you handle conflicts when two devices edit the same record offline?', 'Three strategies: (1) Last-write-wins — simple, lossy. (2) Server-authoritative with vector clocks or version numbers — server decides, client reconciles. (3) CRDTs — auto-merge mathematically. Pick based on data semantics: LWW for prefs, CRDT for collaborative text, server-authoritative for transactions.'),
      card('Why must mutations be idempotent?', 'Client may retry a mutation (network blip, app crash mid-sync). Without idempotency key, server processes it twice → duplicate records, double charges. Idempotency key = unique ID per logical mutation; server stores result keyed by it, returns same result on retry.'),
      card('What is optimistic update?', 'UI updates immediately on user action, before server confirms. Trade: instant perceived speed for potential rollback complexity if server rejects. Critical for offline-first where server confirmation may be minutes away.'),
      card('Partial sync vs full sync — which and when?', 'Full sync downloads entire user history — easy but wasteful for large datasets. Partial sync downloads since-last-sync timestamp or cursor — efficient but harder to implement. Default to partial sync with full-sync option for first install or after corruption.'),
      card('How to detect connectivity reliably on mobile?', '@react-native-community/netinfo gives connection type and reachability. But "connected" ≠ "internet works" — captive portals, dead WiFi look connected. Verify with a lightweight reachability ping to your API before assuming online.'),
    ],
    refs: [
      ref('WatermelonDB — offline-first DB for RN', 'https://watermelondb.dev/'),
      ref('PowerSync — managed offline sync', 'https://www.powersync.com/'),
      ref('op-sqlite — fast SQLite for RN', 'https://github.com/OP-Engineering/op-sqlite'),
    ],
  }));

  // Sub 2: Real-Time Streaming
  skills.push(mk('Real-Time Streaming Architecture', 'mobile', archPatternsSkill.id, {
    definition: 'Server pushes data continuously via persistent connection (WebSocket, SSE, gRPC streams). UI reflects state changes immediately. Used in chat, trading, live sports, collaborative editing, driver tracking.',
    codeExample: `// Singleton WebSocket manager + store integration
class WebSocketManager {
  socket = null;
  reconnectAttempts = 0;

  connect(token) {
    this.socket = new WebSocket(\`wss://api.example.com/ws?token=\${token}\`);

    this.socket.onmessage = (e) => {
      const event = JSON.parse(e.data);
      // Don't render directly — push to store, let selectors notify subscribed UI
      store.dispatch(eventReceived(event));
    };

    this.socket.onclose = () => this.scheduleReconnect();
    this.socket.onerror = (e) => console.error('WS error', e);

    // Heartbeat
    this.heartbeat = setInterval(() => {
      if (this.socket.readyState === WebSocket.OPEN) this.socket.send('ping');
    }, 30000);
  }

  scheduleReconnect() {
    clearInterval(this.heartbeat);
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000) + Math.random() * 1000;
    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect(getToken());
    }, delay);
  }
}`,
    gotchas: `iOS suspends WebSocket connections within seconds of backgrounding — always reconnect on AppState "active" and push-notify messages that arrive while backgrounded.
Thundering herd on server restart — all clients reconnect simultaneously. Exponential backoff + jitter is mandatory, not optional.
100s of updates/second without batching → UI thrash and frame drops — buffer updates, flush in requestAnimationFrame.
Presence state lags after ungraceful disconnects — a client killed by the OS still appears "online" until the heartbeat timeout clears it.
Scaling WS beyond one server requires a message bus (Redis pub/sub, Kafka) — otherwise server A cannot reach clients on server B.`,
    flashcards: [
      card('WebSocket vs SSE vs polling — when each?', 'Polling: simplest, ok for low-frequency (every 30s). SSE: server→client only, plain HTTP, auto-reconnect built in, simpler than WS. WebSocket: bidirectional, lowest latency, custom protocol — needed for chat, gaming, real-time editing.'),
      card('How should the WebSocket layer be architected in RN?', "Singleton WebSocketManager handles connection lifecycle (connect, reconnect, heartbeat, close). Pushes events to a store (Redux/Zustand). UI subscribes to the store, never to WS directly. Decouples connection lifecycle from rendering — UI doesn't care if WS is up or down."),
      card('Reconnection strategy for WebSocket?', 'Exponential backoff with jitter: wait 2^attempt seconds + random 0-1000ms to prevent thundering herd after server restart. Replay missed events via sequence numbers or last-event-id. On reconnect, reconcile local state with a server snapshot if disconnected too long.'),
      card('How to handle 100s of WS updates per second without UI thrash?', 'Batch incoming updates into a buffer, flush in requestAnimationFrame so UI re-renders at most 60fps. Throttle store writes — coalesce multiple updates for same entity. Virtualize lists (FlatList) so off-screen items don\'t render. Diff at store level — only notify subscribers whose specific data actually changed.'),
      card('Why authenticate WebSocket on connect AND on messages?', 'Connect-time auth verifies the user can establish the connection. But the connection lives long-lived; permissions can change (role revoked, plan downgraded). Critical operations re-check authorization per message. Plus, server pushes "re-auth required" on token revocation events.'),
      card('How does WS behave when mobile app is backgrounded?', 'iOS suspends socket after a few seconds in background — connection dies. Android Doze mode kills connections after extended idle. Both: app must reconnect on foreground. Use push notifications for messages that arrive while app is backgrounded; reconcile state on next foreground.'),
      card('What is presence and why is it hard?', 'Presence = "who is online right now." Clients disconnect ungracefully (kill app, lose signal), server still shows them online for minutes. Solution: heartbeat with timeout, last-seen-timestamp instead of strict online/offline, cleanup on connection close.'),
      card('Scaling WebSocket across multiple servers?', "Each server only knows its own connected clients. Messages from server A can't reach clients on server B without a shared message bus. Solution: Redis pub/sub or Kafka — each server subscribes to topics, forwards relevant messages to its local clients."),
    ],
    refs: [
      ref('Socket.IO — high-level WS library', 'https://socket.io/docs/v4/'),
      ref('WebSocket scaling patterns (Ably)', 'https://ably.com/topic/the-challenge-of-scaling-websockets'),
    ],
  }));

  // Sub 3: Local-First Collaborative (CRDT)
  skills.push(mk('Local-First Collaborative (CRDT)', 'mobile', archPatternsSkill.id, {
    definition: 'Multiple users edit the same data simultaneously, even offline. Local changes merge deterministically without a central server arbitrating. Powered by CRDTs (Conflict-free Replicated Data Types) like Yjs, Automerge. Used in Figma, Notion, Linear, collaborative editors.',
    codeExample: `// Yjs example — collaborative shared text
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const doc = new Y.Doc();
const provider = new WebsocketProvider('wss://sync.example.com', 'room-id', doc);

const yText = doc.getText('content');

// User edits — applied locally first, then broadcast
yText.insert(0, 'Hello');

// Remote edits arrive — auto-merged
yText.observe(event => {
  // event.changes contains delta — apply to UI
  setLocalText(yText.toString());
});

// Awareness (cursors, presence) — separate from persistent state
provider.awareness.setLocalState({
  user: { name: 'vk', color: '#58CC02' },
  cursor: { line: 5, ch: 10 },
});`,
    gotchas: `CRDT doc history grows unboundedly — compact with snapshots periodically or Yjs GC, otherwise a long-lived doc grows to MBs of operation log.
CRDTs cannot enforce permissions — anyone in the room can edit anything; access control must be at the sync-server level, not in the CRDT.
Schema evolution is genuinely hard — renaming a field in a live CRDT doc breaks old clients that still write the old field name.
Initial sync of a large doc stalls first load — use a snapshot endpoint for the current state, then stream deltas; don't replay the full history on join.
Awareness state is ephemeral and lossy by design — never store business-critical data in awareness; it clears on disconnect.`,
    flashcards: [
      card('What is a CRDT?', 'Conflict-free Replicated Data Type. A data structure that can be updated independently on multiple devices and merged deterministically — the merge result is the same regardless of operation order. Mathematically guaranteed convergence, no central authority needed.'),
      card('Yjs vs Automerge — which to pick?', "Yjs: most mature, performant for text/lists, smaller bundle, used by Notion/Linear. Automerge: more JSON-shape-friendly, slower historically (newer Automerge 2 is competitive), better for document-shaped data. Default to Yjs unless you need Automerge's document model specifically."),
      card('Why is "awareness" separate from persistent state in CRDTs?', 'Awareness = ephemeral state (cursor positions, "user is typing", presence). Doesn\'t need to persist or merge — just broadcast. Storing in the CRDT would bloat the doc with junk that doesn\'t matter after the session. Yjs and Automerge keep awareness as a separate channel.'),
      card('How does a CRDT-based app sync over WebSocket?', "Each edit produces a binary update (a small diff). Client sends updates to a sync server (y-websocket); server broadcasts to other connected clients in the same room. Server doesn't interpret the doc — just relays updates. Clients can also sync peer-to-peer via WebRTC if needed."),
      card('What problems do CRDTs not solve well?', "Permissions (CRDTs are all-or-nothing — you can't hide parts of the doc from a user). Schema evolution (changing field types in a live CRDT is genuinely hard). Server-side validation (you can't reject \"invalid\" merges without breaking convergence). Backend filtering by user."),
      card('How do CRDT documents grow over time?', 'Every edit adds to the history. Without compaction, a long-lived doc accumulates MB of operation log even if current content is small. Solutions: snapshotting (replace history with current state), garbage collection (Yjs has this), or periodic re-creation with a fresh doc seeded from the snapshot.'),
      card('When NOT to use CRDTs?', "Single-user apps. Apps where conflicts are rare (mostly read-only). Apps with strict server-authoritative rules (banking, inventory). Anywhere you need \"this exact field can only be edited by admins\" — CRDTs can't enforce that."),
      card('How is initial sync handled for a large CRDT document?', "New client requests state vector (compressed summary of \"what edits do I have?\") from server. Server sends the diff between client's state vector and current doc. Typically much smaller than full history. For really large docs, snapshot endpoint sends current state, then incremental updates flow normally."),
    ],
    refs: [
      ref('Yjs documentation', 'https://docs.yjs.dev/'),
      ref('Automerge', 'https://automerge.org/'),
      ref('Local-first software essay (Ink & Switch)', 'https://www.inkandswitch.com/local-first/'),
    ],
  }));

  // Sub 4: Event-Sourced / CQRS
  skills.push(mk('Event-Sourced / CQRS', 'mobile', archPatternsSkill.id, {
    definition: 'State is derived from an append-only log of events, not stored directly. Reads and writes use separate models (CQRS). Used in banking (audit trail mandatory), e-commerce orders, anywhere "how did we get to this state" matters.',
    codeExample: `// Event-sourced order flow
// Commands → Events → Projections → Queries

// Command (intent) — can be rejected
// { type: 'PlaceOrder', userId: 'u1', items: [...], total: 500 }

// Validate, emit event (fact that happened) — immutable
const event = { type: 'OrderPlaced', orderId: 'o42', userId: 'u1', total: 500, ts: Date.now() };
await eventStore.append('order-o42', event);

// Projection handler — updates denormalized read model
async function onOrderPlaced(event) {
  await readDb.orders.insert({
    id: event.orderId,
    userId: event.userId,
    status: 'placed',
    total: event.total,
  });
  await readDb.userOrderCount.increment(event.userId);
}

// Client query — reads from projection, never from event log directly
const orders = await readDb.orders.findBy({ userId: 'u1' });`,
    gotchas: `Event schema evolution is the hardest problem — events are immutable forever; add versioned upcasters early, never rely on a "just add fields" migration strategy.
Projection rebuild time grows with event volume — snapshot projections periodically, replay only from last snapshot.
Eventual consistency gaps confuse users — "I just placed an order but it's not in My Orders" needs explicit UX handling (optimistic local state while projection catches up).
Event sourcing overkill for simple CRUD — the cost (event store, versioning, replay infra) only pays off when audit trail or time-travel debug genuinely matters.
Forgetting to handle duplicates — event processors must be idempotent; events can be delivered more than once in failure scenarios.`,
    flashcards: [
      card('What is event sourcing?', 'State is derived from an append-only log of events, not stored as current values. Order doesn\'t have a "status" column you update — you append events (OrderPlaced, OrderPaid, OrderShipped) and compute current status from the log. Full audit trail comes free.'),
      card('What is CQRS?', 'Command Query Responsibility Segregation. Writes (commands) and reads (queries) use separate models. Commands validate intent and emit events. Queries read from denormalized projections optimized for specific views. Often paired with event sourcing.'),
      card('Commands vs events — difference?', 'Command = intent ("PlaceOrder") — can be rejected. Event = fact ("OrderPlaced") — already happened, immutable. Commands flow client → server. Events flow server → projections → clients. Different verb tense matters: "Place" (imperative) vs "Placed" (past).'),
      card('What is a projection?', 'A materialized read model built by replaying events. Example: UserStats projection tracks total orders, total spend per user — computed by handling OrderPlaced events. Multiple projections per event stream — same events feed different views.'),
      card('How are projections rebuilt?', 'Replay all events from the beginning, applying each to a fresh projection. Slow for millions of events. Solution: snapshots — save projection state periodically; replay only events since last snapshot. Critical for production systems with long event histories.'),
      card('Why is event schema evolution hard?', 'Events are immutable — once written, never changed. But over years, your event shape evolves (new fields, renames, splits). Old events still exist in the log. Solutions: versioned events (OrderPlacedV1, V2), upcasters (transform old events at read time), or never-remove-only-add discipline.'),
      card('Eventual consistency in CQRS — what does it mean for UX?', 'Write succeeds immediately (command accepted, event emitted). Read may lag briefly (projection updates async). User submits order → sees confirmation → refreshes "My Orders" → might not see it yet for 100ms-1s. UX must handle this (show optimistic state, retry, "syncing..." indicator).'),
      card('When is event sourcing overkill?', "Simple CRUD apps. Apps where audit trail isn't critical. Small teams that don't need the operational complexity. Event sourcing adds: event store, projection management, schema versioning, replay infrastructure. Cost is real — only adopt when audit/history/time-travel-debug genuinely matters."),
    ],
    refs: [
      ref('Event Sourcing (Martin Fowler)', 'https://martinfowler.com/eaaDev/EventSourcing.html'),
      ref('CQRS (Martin Fowler)', 'https://martinfowler.com/bliki/CQRS.html'),
      ref('Microservices.io — Event Sourcing pattern', 'https://microservices.io/patterns/data/event-sourcing.html'),
    ],
  }));

  // Sub 5: On-Device / Edge AI
  skills.push(mk('On-Device / Edge AI', 'mobile', archPatternsSkill.id, {
    definition: 'ML inference runs on the device, not on a server. Privacy-preserving, low-latency, works offline. Used in translation, OCR, voice transcription, on-device chat, image classification, AR effects.',
    codeExample: `// On-device inference with TFLite via react-native-fast-tflite
import { loadTensorflowModel } from 'react-native-fast-tflite';

const model = await loadTensorflowModel(
  require('./assets/image-classifier.tflite')
);

async function classifyImage(imageUri) {
  const inputTensor = await preprocessImage(imageUri); // resize, normalize

  const output = await model.run([inputTensor]);

  const predictions = postprocess(output[0]);
  return predictions; // [{ label: 'dog', confidence: 0.92 }, ...]
}

// Hybrid fallback pattern: on-device first, cloud if confidence low
async function classify(image) {
  const local = await classifyImage(image);
  if (local[0].confidence < 0.7) {
    return await cloudClassifier.classify(image); // server LLM
  }
  return local;
}`,
    gotchas: `Cold start lag of 1-3s for large models — warm the model in background on app launch, not on first user action.
Hardware variability causes 10x perf spread — Pixel/iPhone NPUs are fast; old mid-range CPUs are very slow. Detect device tier and use a smaller model or cloud fallback for low-end devices.
Continuous inference drains battery 2-5x faster — throttle to every Nth frame, stop when app is backgrounded.
Quantization quality drop must be validated — 4-bit quant can hallucinate more on edge cases; benchmark on your specific task before shipping.
Model update without an app release requires OTA delivery pipeline — plan for secure model signing and version management.`,
    flashcards: [
      card('What is on-device / edge AI?', "ML model inference running on the user's device (CPU, GPU, NPU) instead of a server. Eliminates network latency, preserves privacy (data never leaves device), works offline. Trade-offs: model size limits, battery cost, hardware variability."),
      card('Inference runtimes for RN — which to use?', 'TensorFlow Lite via react-native-fast-tflite (mature, broad model support). ONNX Runtime for cross-framework models. ExecuTorch for PyTorch models on mobile. Core ML on iOS (native, fastest on Apple silicon). MLC LLM for running LLMs locally. Pick based on which framework your model was trained in.'),
      card('What is quantization and why is it essential on mobile?', 'Reducing numeric precision of model weights from 32-bit floats to 8-bit or 4-bit integers. Drastically smaller model size (10x reduction common), faster inference, less RAM. Slight quality drop, usually acceptable. Almost mandatory for shipping ML models on mobile.'),
      card('Can you run an LLM on-device?', "Yes, but constrained. 4-bit quantized 3-7B parameter models can run on modern phones (Pixel 8 Pro, iPhone 15 Pro+). MLC LLM, llama.cpp via bridge, Apple's MLX framework. Slow compared to cloud (5-20 tokens/sec). Best for privacy-critical tasks (medical notes, journaling) or offline use cases."),
      card('Cold start problem with on-device models?', 'Loading a 100MB+ model into memory on first inference takes 1-3 seconds. User sees lag. Solutions: lazy-load on app startup in background, warm the model on app foreground, keep model in memory if RAM allows, use smaller models for instant tasks.'),
      card('Hybrid on-device + cloud pattern?', 'Run cheap/fast model on device for common cases. Fall back to cloud LLM (Claude, GPT) for complex queries or when on-device model is uncertain. Example: voice transcription on-device, but translation falls back to cloud. Best of both worlds — privacy + capability.'),
      card('Battery impact of continuous on-device inference?', "Significant. Sustained ML inference drains battery 2-5x faster than typical app use. Solutions: throttle inference rate (don't process every frame, every 3rd frame), use NPU when available (more efficient than CPU/GPU), batch operations, run heavy tasks only when plugged in."),
      card('Hardware variability problem — what is it?', 'Same model runs differently across devices: NPU on Pixel/iPhone (fast), GPU on mid-range Android (slower), CPU on old devices (very slow). Same code, 10x perf difference. Need device-tier detection and fallback strategies (smaller model on weaker hardware, cloud fallback on very old devices).'),
    ],
    refs: [
      ref('react-native-fast-tflite', 'https://github.com/mrousavy/react-native-fast-tflite'),
      ref('ExecuTorch — PyTorch on mobile', 'https://pytorch.org/executorch/'),
      ref('MLC LLM — on-device LLMs', 'https://llm.mlc.ai/'),
    ],
  }));

  // Sub 6: Server-Driven UI
  skills.push(mk('Server-Driven UI', 'mobile', archPatternsSkill.id, {
    definition: 'Server sends UI structure as JSON, client interprets and renders it using a registered component library. Change app behavior without releasing a new app version. Used by Airbnb, Lyft, banking apps with frequently-changing screens.',
    codeExample: `// Server returns UI schema
const screenSchema = {
  type: 'Screen',
  children: [
    { type: 'Header', props: { title: 'Welcome' } },
    {
      type: 'Card',
      props: { padding: 16 },
      children: [
        { type: 'Text', props: { text: 'Hello, vk' } },
        { type: 'Button', props: { label: 'Continue', action: 'navigate:home' } },
      ],
    },
  ],
};

// Client renderer — walks schema, instantiates registered components
const componentRegistry = {
  Screen: ScreenComponent,
  Header: HeaderComponent,
  Card: CardComponent,
  Text: TextComponent,
  Button: ButtonComponent,
};

function renderNode(node) {
  const Component = componentRegistry[node.type];
  if (!Component) return null;
  return (
    <Component {...node.props}>
      {node.children?.map((child, i) => (
        <Fragment key={i}>{renderNode(child)}</Fragment>
      ))}
    </Component>
  );
}`,
    gotchas: `Unknown component types silently render nothing — always have a fallback/error node so designers see broken layouts in testing, not invisible holes in production.
Schema versioning across old clients — an app from 12 months ago must still render current schemas; use forward-compatible unknown-field-ignore and required-field fallback conventions from day one.
Type safety across server/client boundary is hard — schema type drift causes subtle render bugs; use a shared schema type definition and validate server output in CI.
Native feel suffers — generic renderers can't match hand-tuned gesture animations; mark high-polish screens as non-SDUI candidates.
Without caching, every screen open = network request — LRU cache with TTL is mandatory for usable perceived performance.`,
    flashcards: [
      card('What is server-driven UI?', 'Server sends a JSON description of the UI; client renders it using pre-registered components. Adds or modifies screens without an app release. Used in banking, e-commerce promos, A/B testing, regional customization.'),
      card('What are the components of an SDUI system?', '(1) Component library on client — finite set of registered, typed components. (2) Schema format (JSON) describing component trees. (3) Renderer that walks the JSON tree and instantiates components. (4) Backend service that builds and serves schemas. (5) Caching layer for resilience.'),
      card('Why do major apps use SDUI?', "Promotional banners change weekly. Onboarding flows change per region. Feature flags require new UI. Without SDUI, every change = app release = 2-week App Store review + slow user upgrade. SDUI ships in seconds. Critical for high-velocity teams (Airbnb, Lyft, ICICI)."),
      card("What's the downside of SDUI?", "Native feel suffers — generic renderer can't match hand-tuned animations. Debugging is harder (errors live in JSON, not code). Performance overhead of dynamic rendering. Type safety across server/client boundary is hard. Schema versioning is complex (old clients seeing new schemas)."),
      card('How do you handle SDUI schema versioning?', "Each app version declares its supported schema version range. Server returns a schema matching what the client can render. Unknown fields are ignored (forward compatibility). Required fields trigger fallback to older schema or graceful error. Default-on-failure to a cached or bundled fallback screen."),
      card('What kinds of screens are good fits for SDUI?', "Promotional / marketing screens. Onboarding flows that change frequently. Configuration / settings screens. Lists of products / cards. Bad fits: highly interactive flows (gestures, animations), screens with custom business logic, performance-sensitive screens (lists with complex cells)."),
      card('How do interactions work in SDUI?', 'Schema includes action descriptors (e.g., `{ action: "navigate:home" }` or `{ action: "submit:order", payload: {...} }`). Client renderer maps actions to handlers. Limited to pre-defined action types — you can\'t ship new action logic via schema, only re-use existing handlers.'),
      card('How does caching work in SDUI?', 'Schemas cached locally per screen URL with TTL. On open: serve cache instantly, fetch fresh in background, update if changed. On network failure: fall back to cache, then to bundled default schema. Without caching, every screen open = network request = bad UX on slow networks.'),
    ],
    refs: [
      ref('Airbnb SDUI deep dive (engineering blog)', 'https://medium.com/airbnb-engineering/a-deep-dive-into-airbnbs-server-driven-ui-system-842244c5f5'),
      ref("Lyft's server-driven UI", 'https://eng.lyft.com/server-driven-user-interfaces-fcfacccd5fd1'),
    ],
  }));

  // Sub 7: Microfrontend on Mobile
  skills.push(mk('Microfrontend on Mobile', 'mobile', archPatternsSkill.id, {
    definition: 'Multiple independent RN apps composed into one shell. Different teams own different sections (checkout, search, profile). Used by large orgs (banking super-apps, Microsoft Office mobile) where 5+ teams ship to the same app.',
    codeExample: `// Re.Pack-based Module Federation
// shell/webpack.config.js
new Repack.ModuleFederationPlugin({
  name: 'shell',
  remotes: {
    checkout: 'checkout@https://cdn.example.com/checkout/remoteEntry.js',
    profile:  'profile@https://cdn.example.com/profile/remoteEntry.js',
  },
  shared: {
    react:         { singleton: true, requiredVersion: '18.2.0' },
    'react-native': { singleton: true, requiredVersion: '0.74.0' },
  },
});

// shell/App.js — lazy-load MFE on tab press
const Checkout = lazy(() => import('checkout/CheckoutScreen'));

function App() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Checkout" component={() => (
        <Suspense fallback={<Loader />}>
          <Checkout />
        </Suspense>
      )} />
    </Tab.Navigator>
  );
}`,
    gotchas: `Missing singleton config for React → multiple React instances at runtime → hooks break with cryptic "invalid hook call" errors. Always declare react and react-native as singletons.
App Store dynamic code loading gray area — Apple allows loading known JS modules; introducing entirely new features without review is risky. Consult legal/policy before shipping features via remote bundles.
Cold start of first MFE tab = network fetch + parse + execute — prefetch in background on app start for tabs the user will likely visit.
MFE communication via shared store defeats the isolation benefit — prefer event bus or route-state-as-contract to keep MFEs genuinely decoupled.
Most apps don't need MFE — the overhead only pays off at 5+ teams with genuinely independent release cadences.`,
    flashcards: [
      card('What is microfrontend on mobile?', "Multiple independent RN apps (MFEs) composed at runtime into one shell app. Each MFE owned by one team, deployed independently. Shell handles top-level navigation, shared deps, auth. Same pattern as web microfrontends, harder to implement on mobile due to bundle constraints."),
      card('When does mobile MFE make sense?', "5+ teams owning different sections. Independent release cadence required. Different teams want different framework versions. Org structure mirrors product boundaries (Conway's Law). Bad fit for small teams — overhead exceeds benefit."),
      card('What is Re.Pack?', 'Webpack-based bundler for RN that adds Module Federation support. Lets one RN app load JS modules from another at runtime via `remoteEntry.js`. Foundation of runtime MFE composition on RN. Alternative to Metro (the default bundler).'),
      card('Module Federation singletons — why mandatory?', 'Each MFE has React in its bundle. Without singleton config, multiple React instances at runtime → hooks break (React detects hook calls outside its context tree). Declaring `react: { singleton: true }` ensures one shared React instance across all MFEs.'),
      card('How do MFEs communicate?', "Three patterns: (1) Custom DOM/native events via event bus. (2) URL/route state as the contract — MFEs read what they need from current route. (3) Shared store (Redux/Zustand) — careful, defeats isolation. Avoid: direct module imports between MFEs (recreates monolith coupling)."),
      card('App store policy concerns with MFE?', 'Apple is strict about dynamic code loading. Loading new JS at runtime is allowed for "core functionality" but introducing entirely new features without app review is a gray area. Most MFE approaches pre-bundle all code; runtime loading limited to known modules. Code-push (Expo Updates, App Center) is allowed within these limits.'),
      card('Cold start cost of MFE?', 'Loading a remote MFE bundle = network request + parse + execute. On first tab press, user waits 500ms-2s. Solutions: prefetch popular MFEs in background, ship critical MFEs in the main bundle, show optimistic loading states. Cold start is the #1 perceived perf issue with mobile MFE.'),
      card('When is mobile MFE the wrong call?', "Small team (<5 teams). Single product, single deploy cadence. Performance-sensitive apps (games, trading). Apps where bundle size is critical. Most apps. MFE's overhead (shared deps, runtime composition, communication contracts) only pays off at significant team scale."),
    ],
    refs: [
      ref('Re.Pack — Module Federation for RN', 'https://re-pack.dev/'),
      ref('Module Federation overview', 'https://module-federation.io/'),
    ],
  }));

  // Sub 8: Push-Sync / Background-Heavy
  skills.push(mk('Push-Sync / Background-Heavy', 'mobile', archPatternsSkill.id, {
    definition: 'App is mostly background — silent push notifications wake it to sync data, then sleep again. Email clients, messaging apps, sync-heavy productivity apps. Data is ready when user opens the app.',
    codeExample: `// FCM data-only push handler
import messaging from '@react-native-firebase/messaging';

// Background handler — runs even when app is killed
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  const { type, payload } = remoteMessage.data;

  if (type === 'NEW_MESSAGE') {
    // Sync the new message into local DB
    await db.messages.upsert(payload);

    // Show local notification only if important
    if (payload.isImportant) {
      await notifee.displayNotification({
        title: payload.sender,
        body: payload.preview,
      });
    }
  }
});

// Foreground handler — same sync, no notification (user is in-app)
messaging().onMessage(async (remoteMessage) => {
  await syncFromPush(remoteMessage.data);
});`,
    gotchas: `Push delivery is best-effort — FCM/APNs can drop pushes (device offline too long, quota exceeded). Always reconcile state on app foreground; never rely solely on pushes for critical data delivery.
iOS gives only ~30s of background execution per push — heavy sync must be chunked or deferred to BGProcessingTask (plugged-in, idle device only).
Android Doze batches background work to maintenance windows — timing is non-deterministic; design sync to be eventual, not time-sensitive.
Silent pushes on iOS require "content-available" flag AND background mode enabled in capabilities — missing either means the push wakes no one.
Battery vs freshness trade-off must be surfaced to users — allow sync frequency control in settings and throttle on low battery.`,
    flashcards: [
      card('What is push-sync architecture?', 'App relies on push notifications to trigger background data sync. Silent (data-only) pushes wake the app, app fetches/applies data, then sleeps. User opens app → data already current. Lower battery cost than polling.'),
      card('Silent push vs notification push?', 'Notification push: visible alert in tray, user sees it. Silent push: data-only payload, no alert — used purely to trigger sync. iOS calls these "content-available" pushes. Useful for syncing in background without bothering user.'),
      card('iOS background execution limits?', 'iOS gives ~30 seconds of background time after a push wakes the app. After that, the app is suspended. Heavy sync must be quick or chunked. BGProcessingTask (newer API) allows longer background work but only when device is plugged in and idle.'),
      card('Android Doze mode — what is it?', 'When the device is unplugged and idle for extended period, Android batches background tasks and delays network access to save battery. Apps wake up only during maintenance windows (every 15-30 min). Affects push delivery and sync timing.'),
      card('How to do reliable background sync on RN?', 'WorkManager on Android via react-native-background-fetch. BGTaskScheduler on iOS via expo-background-fetch. Schedule periodic sync tasks; OS decides when to run based on battery, network, device state. Not guaranteed timing — design sync to be eventual.'),
      card('Why is push delivery best-effort, not guaranteed?', "FCM/APNs deliver \"at most once with high probability.\" Pushes can be dropped if device offline too long, quota exceeded, network unreliable. Apps must handle missed pushes — sync on app foreground, reconcile state, never rely solely on pushes for critical data."),
      card('Battery vs freshness trade-off?', 'More frequent background syncs → fresher data → worse battery. Push-driven sync (only when server has updates) is more efficient than polling. Throttle sync frequency on low battery. Allow user to control sync frequency in settings.'),
      card('When does push-sync make sense?', "Email, messaging, news apps, syncing CRMs — apps where users open and expect \"everything updated.\" Bad fit for real-time interactive apps (use WebSocket instead) or apps where freshness isn't critical (lazy-load on open is simpler)."),
    ],
    refs: [
      ref('Firebase Cloud Messaging — RN (@react-native-firebase)', 'https://rnfirebase.io/messaging/usage'),
      ref('iOS background execution modes (Apple docs)', 'https://developer.apple.com/documentation/uikit/app_and_environment/scenes/preparing_your_ui_to_run_in_the_background'),
      ref('react-native-background-fetch', 'https://github.com/transistorsoft/react-native-background-fetch'),
    ],
  }));

  // Sub 9: Hybrid Native + RN
  skills.push(mk('Hybrid Native + RN', 'mobile', archPatternsSkill.id, {
    definition: "Existing native app embeds RN screens for specific flows. RN doesn't own the whole app, just slices. Used in enterprise modernization — gradual migration of legacy Swift/Kotlin apps to RN.",
    codeExample: `// Android — embedding an RN screen in a native Activity
class CheckoutActivity : AppCompatActivity(), DefaultHardwareBackBtnHandler {
  private lateinit var reactRootView: ReactRootView

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    reactRootView = ReactRootView(this)
    val reactInstanceManager = (application as MyApp).reactNativeHost.reactInstanceManager

    reactRootView.startReactApplication(
      reactInstanceManager,
      "CheckoutScreen",   // JS-side registered name
      Bundle().apply { putString("orderId", intent.getStringExtra("orderId")) }
    )
    setContentView(reactRootView)
  }
}

// JS side — register the component for native embedding
import { AppRegistry } from 'react-native';
AppRegistry.registerComponent('CheckoutScreen', () => CheckoutScreen);`,
    gotchas: `Bridge call frequency kills perf — design native modules to be coarse-grained (one call does many things); chatty fine-grained calls cause serialization lag visible to users.
Two debug environments — native crash in Crashlytics with native stack, RN crash in Sentry with JS stack; bugs spanning both require comfort with two toolchains.
Design token drift — native and RN screens showing different shades of "primary blue" next to each other; generate tokens from a single source of truth for both layers.
Eager RN initialization adds cold start time — lazy-initialize the JS runtime only when the first RN screen is actually needed.
Teams lacking expertise in one stack can't maintain hybrid effectively — hybrid requires senior engineers comfortable with both Swift/Kotlin and React Native.`,
    flashcards: [
      card('What is hybrid native + RN architecture?', 'Existing native app (Swift/Kotlin) embeds RN screens for specific flows. Native owns navigation, RN screens are pushed/presented like any other native view. Lets teams ship new features in RN without rewriting the whole app.'),
      card('When is hybrid the right approach?', "Migrating legacy native apps to RN gradually. Large existing native codebase, can't rewrite in one go. Native shell already polished, only specific new features need RN's cross-platform speed. Common in banking, insurance, enterprise where the existing app is years old."),
      card("What's the bridging cost?", 'Every call between native and RN crosses the bridge — serialization overhead, async hop. Frequent native-RN communication kills perf. Mitigation: batch calls, use JSI (new architecture) where possible, design native modules to be coarse-grained (one call does many things).'),
      card('How is navigation handled in hybrid?', "Native navigator drives top-level navigation. RN screens push themselves onto the native stack via a bridge method (e.g., `Navigator.push('CheckoutScreen')`). RN doesn't use its own navigator at the top level — would conflict with native nav. Internal sub-navigation within an RN section can use RN navigator."),
      card('Sharing design tokens between native and RN?', 'Generate a single source of truth (e.g., a JSON file of colors/spacing/typography). Pipeline converts to: native style resources (Android XML, iOS Swift), RN style objects, web CSS. Without this, native and RN screens drift visually — different shades of "primary blue" appear side by side.'),
      card('Two debug environments — what does this mean in practice?', 'Native crashes go to Crashlytics with native stack. RN crashes go to Sentry/Bugsnag with JS stack. A bug spanning both (RN screen calling native module) is debugged in two places. Junior engineers struggle here — senior on hybrid teams must be comfortable with both stacks.'),
      card('Memory footprint of hybrid apps?', 'Larger than pure native or pure RN. Both runtimes coexist — JS engine, RN bridge, plus native code. Cold start can be slower if RN is initialized eagerly. Mitigation: lazy-initialize RN only when first RN screen is needed, share JS runtime across all RN screens.'),
      card('When is hybrid the wrong choice?', "Greenfield apps — just build in RN or native from start, don't mix without need. Apps where the existing native code is small enough to rewrite cleanly. Teams that lack expertise in one of the two stacks (can't maintain hybrid effectively)."),
    ],
    refs: [
      ref('RN integration with existing apps', 'https://reactnative.dev/docs/integration-with-existing-apps'),
      ref('Brownfield RN — Callstack guide', 'https://www.callstack.com/blog/embracing-rn-in-existing-apps-with-brownfield'),
    ],
  }));

  // Sub 10: Heavy-Animation / Graphics
  skills.push(mk('Heavy-Animation / Graphics', 'mobile', archPatternsSkill.id, {
    definition: "App's primary value is visual polish — 60fps animations, custom graphics, GPU-accelerated effects. Onboarding flows, games, creative tools, trading charts with smooth interaction.",
    codeExample: `// Reanimated 3 worklet — runs on UI thread, never blocks JS
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

function DraggableCard() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      // Runs on UI thread — zero JS bridge hops per frame
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, animatedStyle]} />
    </GestureDetector>
  );
}`,
    gotchas: `Animations on JS thread cause frame drops whenever JS is busy — always use Reanimated worklets or useNativeDriver for transform/opacity; never animate layout properties on JS thread.
Continuous 60fps GPU usage drains battery significantly — pause animations when component is off-screen or app is backgrounded.
Large textures dominate RAM — a single 4K image is ~30MB; downsize to display resolution, recycle offscreen assets.
react-native-wgpu requires New Architecture (RN 0.81+) — verify architecture compatibility before committing to WebGPU-based 3D.
Profiling is mandatory — assume nothing about perf. Use Hermes Profiler (JS) + Xcode Instruments / Android Studio Profiler (native GPU/CPU) before optimizing.`,
    flashcards: [
      card('Why is keeping animations off the JS thread critical?', 'JS thread handles all your business logic — fetches, state updates, effects. If animation logic runs on JS thread, any blocking work (heavy render, API parse) causes frame drops. Animations on UI thread (via Reanimated worklets or `useNativeDriver`) keep running smoothly regardless of JS thread state.'),
      card('Animated API vs Reanimated 3 — pick which?', 'Animated with `useNativeDriver: true` — runs on UI thread but limited to specific props (transform, opacity). Reanimated 3 — JS worklets compiled to run on UI thread, full JS expressiveness per frame, gesture integration. Default to Reanimated for anything non-trivial.'),
      card('What is a worklet in Reanimated?', "A function marked with 'worklet' directive that Reanimated compiles to run on the UI thread instead of JS thread. Has access to shared values, can update them at 60fps. Can't access JS context (no calling regular JS functions, no React state directly)."),
      card('React Native Skia — when to use?', 'When you need custom 2D graphics beyond what RN views can do — charts, custom shapes, image filters, drawing apps, animated illustrations. Skia is GPU-accelerated (same engine as Flutter, Chrome). Much faster than SVG for complex graphics. Used in trading dashboards, drawing apps, advanced loading animations.'),
      card('3D graphics on RN — current options?', 'react-native-wgpu + Three.js WebGPURenderer is the cutting edge (requires RN 0.81+ New Architecture). expo-three with expo-gl works on older RN. Performance limited by GPU; complex 3D scenes drain battery fast. Realistic use cases: product configurators, simple games, AR effects, data visualization.'),
      card('How to budget memory for graphics-heavy apps?', 'Large textures dominate memory. 4K background image = ~30MB in RAM. Multiple textures, animation frames, Skia canvases compound fast. Mitigations: downsize textures to display resolution, recycle/release when offscreen, lazy-load animation assets, profile memory in Xcode Instruments / Android Studio Profiler.'),
      card('Why does iOS animation feel smoother than Android by default?', 'iOS Core Animation runs all animations on a dedicated rendering thread with minimal app involvement. Android animations are tied closer to the UI thread, more susceptible to jank when other work is happening. Reanimated narrows the gap by running animations off-main-thread on both platforms.'),
      card('Battery cost of animation-heavy apps?', 'Continuous 60fps animation = GPU active continuously = significant battery drain. Strategies: pause animations when not visible (off-screen, app backgrounded), reduce frame rate for non-critical animations, use static states when interaction stops, profile battery impact in real-world usage.'),
    ],
    refs: [
      ref('Reanimated 3 docs', 'https://docs.swmansion.com/react-native-reanimated/'),
      ref('React Native Skia', 'https://shopify.github.io/react-native-skia/'),
      ref('react-native-wgpu', 'https://github.com/wcandillon/react-native-webgpu'),
    ],
  }));

  return skills;
}
