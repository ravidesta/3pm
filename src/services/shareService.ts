// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — ShareService
// Cross-platform social sharing with deep-link intent routing
// Instagram Stories · TikTok · Pinterest · iMessage · Twitter/X · Camera Roll
//
// Target demographic: females 18-34, heavy Instagram/TikTok users
// Every share embeds a deep link so the app grows virally
// ─────────────────────────────────────────────────────────────────────────────

import {
  Share, Linking, Platform, Alert,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

const getCacheDir = () =>
  (FileSystem as any).cacheDirectory ?? (FileSystem as any).documentDirectory ?? '';
import * as Haptics from 'expo-haptics';

// ── Deep link config ──────────────────────────────────────────────────────

const APP_SCHEME  = 'auracloset://';
const WEB_URL     = 'https://auracloset.app';
const HASHTAGS    = ['AuraCloset', 'OOTD', 'OutfitInspo', 'AuraScore', 'StyleAI'];

export type SharePlatform =
  | 'instagram-stories'
  | 'instagram-feed'
  | 'tiktok'
  | 'pinterest'
  | 'twitter'
  | 'imessage'
  | 'snapchat'
  | 'camera-roll'
  | 'native';

export type ShareContentType =
  | 'outfit'
  | 'color-season'
  | 'closet-stats'
  | 'aura-score';

export interface SharePayload {
  imageUri?: string;        // Local file URI of the rendered card
  contentType: ShareContentType;
  deepLink: string;         // auracloset://... deep link
  caption?: string;         // Pre-written caption
  hashtags?: string[];
  sticker?: string;         // URI for Stories sticker overlay
  backgroundImageUri?: string; // For Stories background
  backgroundColor?: string; // Fallback Stories background color
}

// ── Platform capability checks ────────────────────────────────────────────

export const canOpenInstagram = async (): Promise<boolean> => {
  const url = Platform.OS === 'ios' ? 'instagram://' : 'instagram://';
  return Linking.canOpenURL(url).catch(() => false);
};

export const canOpenTikTok = async (): Promise<boolean> =>
  Linking.canOpenURL('tiktok://').catch(() => false);

export const canOpenSnapchat = async (): Promise<boolean> =>
  Linking.canOpenURL('snapchat://').catch(() => false);

export const canOpenPinterest = async (): Promise<boolean> =>
  Linking.canOpenURL('pinterest://').catch(() => false);

// ── Core share dispatcher ─────────────────────────────────────────────────

export async function shareToplatform(
  platform: SharePlatform,
  payload: SharePayload
): Promise<{ success: boolean; platform: SharePlatform }> {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

  try {
    switch (platform) {
      case 'instagram-stories':
        return shareToInstagramStories(payload);

      case 'instagram-feed':
        return shareToInstagramFeed(payload);

      case 'tiktok':
        return shareToTikTok(payload);

      case 'pinterest':
        return shareToPinterest(payload);

      case 'twitter':
        return shareToTwitter(payload);

      case 'snapchat':
        return shareToSnapchat(payload);

      case 'camera-roll':
        return saveToCameraRoll(payload);

      case 'imessage':
        return shareViaMessages(payload);

      case 'native':
      default:
        return shareViaNativeSheet(payload);
    }
  } catch (err) {
    console.warn(`Share to ${platform} failed:`, err);
    // Graceful fallback to native share
    return shareViaNativeSheet(payload);
  }
}

// ── Instagram Stories ─────────────────────────────────────────────────────
// Uses instagram-stories:// URL scheme with background + sticker layer
// The background fills the entire 9:16 Stories canvas
// The sticker is the branded Aura card overlaid on top

async function shareToInstagramStories(
  payload: SharePayload
): Promise<{ success: boolean; platform: SharePlatform }> {
  const canOpen = await canOpenInstagram();

  if (!canOpen || !payload.imageUri) {
    // Fallback: save to camera roll then prompt user to share
    await saveToCameraRoll(payload);
    Alert.alert(
      'Saved to Photos ✦',
      'Open Instagram and add to your Story from your camera roll.',
      [
        { text: 'Open Instagram', onPress: () => Linking.openURL('instagram://') },
        { text: 'Got it' },
      ]
    );
    return { success: true, platform: 'instagram-stories' };
  }

  // Copy image to shareable temp file
  const tempPath = `${getCacheDir()}aura_story_${Date.now()}.jpg`;
  await FileSystem.copyAsync({ from: payload.imageUri, to: tempPath });

  // instagram-stories:// URL scheme
  // backgroundTopColor + backgroundBottomColor sets the canvas gradient
  const params = new URLSearchParams({
    'source-application': 'com.luminousprosperty.auracloset',
    ...(payload.backgroundColor && {
      'background-top-color': payload.backgroundColor,
      'background-bottom-color': '#0F172A',
    }),
  });

  const igURL = `instagram-stories://share?${params.toString()}`;

  // On iOS we can pass data via pasteboard/UIPasteBoard in a more complex implementation
  // For Expo managed workflow, we use the native share sheet targeting Instagram
  await Share.share(
    {
      url: tempPath,
      message: payload.caption ?? buildCaption(payload),
    },
    { dialogTitle: 'Share to Instagram Stories' }
  );

  return { success: true, platform: 'instagram-stories' };
}

// ── Instagram Feed ────────────────────────────────────────────────────────

async function shareToInstagramFeed(
  payload: SharePayload
): Promise<{ success: boolean; platform: SharePlatform }> {
  if (!payload.imageUri) return shareViaNativeSheet(payload);

  const tempPath = `${getCacheDir()}aura_post_${Date.now()}.jpg`;
  await FileSystem.copyAsync({ from: payload.imageUri, to: tempPath });

  await Share.share({
    url: tempPath,
    message: buildCaption(payload),
  });

  return { success: true, platform: 'instagram-feed' };
}

// ── TikTok ────────────────────────────────────────────────────────────────
// TikTok's share model: save to camera roll then open TikTok to pick from library

async function shareToTikTok(
  payload: SharePayload
): Promise<{ success: boolean; platform: SharePlatform }> {
  if (payload.imageUri) {
    await saveToCameraRoll(payload);
  }

  const canOpen = await canOpenTikTok();
  if (canOpen) {
    await Linking.openURL('tiktok://');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return { success: true, platform: 'tiktok' };
  }

  // Fallback: native share
  return shareViaNativeSheet(payload);
}

// ── Pinterest ─────────────────────────────────────────────────────────────
// Opens Pinterest with the image pre-loaded as a pin

async function shareToPinterest(
  payload: SharePayload
): Promise<{ success: boolean; platform: SharePlatform }> {
  const description = encodeURIComponent(
    `${payload.caption ?? 'Outfit by Aura Closet'} ${WEB_URL}`
  );
  const mediaURL = encodeURIComponent(payload.imageUri ?? WEB_URL);

  // Pinterest native app intent
  const pinterestURL = `pinterest://pin/create/button/?url=${encodeURIComponent(WEB_URL)}&media=${mediaURL}&description=${description}`;

  const canOpen = await canOpenPinterest();
  if (canOpen) {
    await Linking.openURL(pinterestURL);
    return { success: true, platform: 'pinterest' };
  }

  // Web fallback
  const webURL = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(WEB_URL)}&media=${mediaURL}&description=${description}`;
  await Linking.openURL(webURL);
  return { success: true, platform: 'pinterest' };
}

// ── Twitter / X ───────────────────────────────────────────────────────────

async function shareToTwitter(
  payload: SharePayload
): Promise<{ success: boolean; platform: SharePlatform }> {
  const tweet = encodeURIComponent(
    `${payload.caption ?? 'Just built this look with Aura Closet ✦'}\n${payload.deepLink}`
  );
  const hashtags = encodeURIComponent(
    (payload.hashtags ?? HASHTAGS).join(',')
  );

  const twitterURL = `twitter://post?message=${tweet}&hashtags=${hashtags}`;
  const webURL     = `https://twitter.com/intent/tweet?text=${tweet}&hashtags=${hashtags}`;

  const canOpen = await Linking.canOpenURL(twitterURL).catch(() => false);
  await Linking.openURL(canOpen ? twitterURL : webURL);

  return { success: true, platform: 'twitter' };
}

// ── Snapchat ──────────────────────────────────────────────────────────────

async function shareToSnapchat(
  payload: SharePayload
): Promise<{ success: boolean; platform: SharePlatform }> {
  if (payload.imageUri) await saveToCameraRoll(payload);

  const canOpen = await canOpenSnapchat();
  if (canOpen) {
    await Linking.openURL('snapchat://');
    return { success: true, platform: 'snapchat' };
  }

  return shareViaNativeSheet(payload);
}

// ── Camera Roll ───────────────────────────────────────────────────────────

export async function saveToCameraRoll(
  payload: SharePayload
): Promise<{ success: boolean; platform: SharePlatform }> {
  if (!payload.imageUri) return { success: false, platform: 'camera-roll' };

  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Allow photo library access to save your outfit card.');
    return { success: false, platform: 'camera-roll' };
  }

  await MediaLibrary.saveToLibraryAsync(payload.imageUri);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  return { success: true, platform: 'camera-roll' };
}

// ── iMessage / native Messages ────────────────────────────────────────────

async function shareViaMessages(
  payload: SharePayload
): Promise<{ success: boolean; platform: SharePlatform }> {
  const message = `${payload.caption ?? 'Check out this look from Aura Closet ✦'}\n${payload.deepLink}`;

  const smsURL = `sms:?body=${encodeURIComponent(message)}`;
  const canOpen = await Linking.canOpenURL(smsURL).catch(() => false);

  if (canOpen) {
    await Linking.openURL(smsURL);
    return { success: true, platform: 'imessage' };
  }

  return shareViaNativeSheet(payload);
}

// ── Native share sheet ────────────────────────────────────────────────────

async function shareViaNativeSheet(
  payload: SharePayload
): Promise<{ success: boolean; platform: SharePlatform }> {
  const message = buildCaption(payload);

  const options = payload.imageUri
    ? { url: payload.imageUri, message }
    : { message: `${message}\n${payload.deepLink}` };

  const result = await Share.share(options);
  return {
    success: result.action === Share.sharedAction,
    platform: 'native',
  };
}

// ── Caption builder ───────────────────────────────────────────────────────

export function buildCaption(payload: SharePayload): string {
  const tags = (payload.hashtags ?? HASHTAGS)
    .map((t) => `#${t}`)
    .join(' ');

  const base: Record<ShareContentType, string> = {
    'outfit':       'Aura built me this look today ✦ What would you wear?',
    'color-season': 'My color season is [season] — and it changes everything 🎨',
    'closet-stats': 'My wardrobe by the numbers. Aura knows my closet better than I do.',
    'aura-score':   "My Aura score is [score]/10 — what's yours? ✦",
  };

  return `${base[payload.contentType]}\n\n${tags}\n${payload.deepLink ?? WEB_URL}`;
}

// ── Deep link builder ─────────────────────────────────────────────────────

export function buildDeepLink(type: ShareContentType, id?: string): string {
  const path: Record<ShareContentType, string> = {
    'outfit':       `outfit/${id ?? ''}`,
    'color-season': 'season',
    'closet-stats': 'stats',
    'aura-score':   `score/${id ?? ''}`,
  };
  return `${APP_SCHEME}${path[type]}`;
}

// ── Attribution tracking ──────────────────────────────────────────────────
// Store share events for analytics (converts to DAU attribution)

export interface ShareEvent {
  platform: SharePlatform;
  contentType: ShareContentType;
  contentId?: string;
  timestamp: string;
}

const shareLog: ShareEvent[] = [];

export function logShare(event: ShareEvent): void {
  shareLog.push(event);
  // TODO: send to analytics backend (Mixpanel / Amplitude)
}

export function getShareCount(): number {
  return shareLog.length;
}

export function getSharesByPlatform(): Record<string, number> {
  return shareLog.reduce((acc, e) => {
    acc[e.platform] = (acc[e.platform] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}
