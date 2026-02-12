/**
 * Orbit Pro - Android Home Screen Widget
 *
 * Built with react-native-android-widget.
 * Renders a beautiful dark-themed widget showing:
 * - Circular progress ring (today's habit completion)
 * - Current streak with flame emoji
 * - Next upcoming habit with time
 * - XP level indicator
 *
 * The widget is rendered declaratively using the widget UI primitives
 * from react-native-android-widget.
 */

import React from 'react';

// react-native-android-widget provides these declarative UI components
// that compile to Android RemoteViews
let FlexWidget: any;
let TextWidget: any;
let SvgWidget: any;
let ListWidget: any;
let ClickActionWidget: any;

try {
  const rnaw = require('react-native-android-widget');
  FlexWidget = rnaw.FlexWidget;
  TextWidget = rnaw.TextWidget;
  SvgWidget = rnaw.SvgWidget;
  ListWidget = rnaw.ListWidget;
  ClickActionWidget = rnaw.ClickActionWidget;
} catch {
  // Fallback stubs for when the native module isn't available (web, iOS)
  const Stub = (props: any) => null;
  FlexWidget = Stub;
  TextWidget = Stub;
  SvgWidget = Stub;
  ListWidget = Stub;
  ClickActionWidget = Stub;
}

// ============================================
// TYPES
// ============================================
interface WidgetProps {
  progress: number;       // 0-100
  completed: number;
  total: number;
  streak: number;
  xp: number;
  level: number;
  nextHabit: {
    name: string;
    emoji: string;
    time: string | null;
  } | null;
  updatedAt: string;
}

// ============================================
// COLORS
// ============================================
const COLORS = {
  background: '#0A0A0F',
  surface: '#141420',
  accent: '#00D9A5',
  accentDim: '#00D9A540',
  text: '#FFFFFF',
  textSecondary: '#8B95B0',
  textMuted: '#4A5270',
  streak: '#FF6B6B',
  xp: '#FFE66D',
};

// ============================================
// PROGRESS RING SVG
// ============================================
function createProgressRingSvg(progress: number, size: number = 80): string {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const cx = size / 2;
  const cy = size / 2;

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <!-- Background circle -->
      <circle
        cx="${cx}" cy="${cy}" r="${radius}"
        stroke="${COLORS.accentDim}"
        stroke-width="${strokeWidth}"
        fill="none"
      />
      <!-- Progress arc -->
      <circle
        cx="${cx}" cy="${cy}" r="${radius}"
        stroke="${COLORS.accent}"
        stroke-width="${strokeWidth}"
        fill="none"
        stroke-linecap="round"
        stroke-dasharray="${circumference}"
        stroke-dashoffset="${offset}"
        transform="rotate(-90 ${cx} ${cy})"
      />
    </svg>
  `.trim();
}

// ============================================
// LEVEL NAMES
// ============================================
function getLevelName(level: number): string {
  const names: Record<number, string> = {
    1: '🌱', 2: '🌿', 3: '🌳', 4: '⚡', 5: '🔥',
    6: '💎', 7: '🏆', 8: '⭐', 9: '🌟', 10: '👼', 11: '👑',
  };
  return names[level] || '🌱';
}

// ============================================
// MAIN WIDGET
// ============================================
export function OrbitWidget(props: WidgetProps) {
  const { progress, completed, total, streak, xp, level, nextHabit } = props;
  const ringSvg = createProgressRingSvg(progress, 72);
  const levelEmoji = getLevelName(level);

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: COLORS.background,
        borderRadius: 24,
        padding: 16,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      clickAction="OPEN_APP"
    >
      {/* Top Row: Progress Ring + Streak */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: 'match_parent',
        }}
      >
        {/* Progress Ring with percentage */}
        <FlexWidget
          style={{
            width: 72,
            height: 72,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <SvgWidget svg={ringSvg} />
          <FlexWidget
            style={{
              position: 'absolute',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <TextWidget
              text={`${progress}%`}
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: COLORS.accent,
              }}
            />
          </FlexWidget>
        </FlexWidget>

        {/* Right side: Streak + Level */}
        <FlexWidget
          style={{
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 4,
          }}
        >
          {/* Streak */}
          <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <TextWidget
              text="🔥"
              style={{ fontSize: 18 }}
            />
            <TextWidget
              text={`${streak}`}
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: streak > 0 ? COLORS.streak : COLORS.textMuted,
              }}
            />
          </FlexWidget>

          {/* Level + XP */}
          <FlexWidget style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <TextWidget
              text={levelEmoji}
              style={{ fontSize: 14 }}
            />
            <TextWidget
              text={`${xp} XP`}
              style={{
                fontSize: 12,
                color: COLORS.xp,
                fontWeight: '600',
              }}
            />
          </FlexWidget>
        </FlexWidget>
      </FlexWidget>

      {/* Middle: Status */}
      <FlexWidget
        style={{
          width: 'match_parent',
          paddingVertical: 4,
        }}
      >
        <TextWidget
          text={`${completed}/${total} habits today`}
          style={{
            fontSize: 13,
            color: COLORS.textSecondary,
          }}
        />
      </FlexWidget>

      {/* Bottom: Next Habit */}
      <FlexWidget
        style={{
          width: 'match_parent',
          backgroundColor: COLORS.surface,
          borderRadius: 12,
          padding: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {nextHabit ? (
          <>
            <TextWidget
              text={nextHabit.emoji}
              style={{ fontSize: 18 }}
            />
            <FlexWidget style={{ flex: 1, flexDirection: 'column' }}>
              <TextWidget
                text={nextHabit.name}
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: COLORS.text,
                }}
                maxLines={1}
              />
              {nextHabit.time && (
                <TextWidget
                  text={`🕐 ${nextHabit.time}`}
                  style={{
                    fontSize: 11,
                    color: COLORS.textMuted,
                  }}
                />
              )}
            </FlexWidget>
          </>
        ) : (
          <>
            <TextWidget
              text="✅"
              style={{ fontSize: 18 }}
            />
            <TextWidget
              text={progress >= 100 ? 'All done! 🎉' : 'No upcoming habits'}
              style={{
                fontSize: 13,
                color: progress >= 100 ? COLORS.accent : COLORS.textMuted,
                fontWeight: progress >= 100 ? '600' : 'normal',
              }}
            />
          </>
        )}
      </FlexWidget>

      {/* Brand footer */}
      <FlexWidget
        style={{
          width: 'match_parent',
          alignItems: 'center',
          paddingTop: 4,
        }}
      >
        <TextWidget
          text="🪐 Orbit Pro"
          style={{
            fontSize: 10,
            color: COLORS.textMuted,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

// ============================================
// WIDGET REGISTRATION
// ============================================

/**
 * Widget task handler for react-native-android-widget.
 * This is called by the native side when the widget needs to render.
 */
export async function widgetTaskHandler(props: {
  widgetName: string;
  widgetAction: string;
  renderWidget: (component: any) => void;
  widgetInfo: any;
}) {
  const { widgetName, renderWidget } = props;

  if (widgetName === 'OrbitWidget') {
    // Read the latest data from AsyncStorage
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const raw = await AsyncStorage.getItem('orbit_widget_data');
      const data = raw ? JSON.parse(raw) : {
        progress: 0, completed: 0, total: 0,
        streak: 0, xp: 0, level: 1,
        nextHabit: null, updatedAt: new Date().toISOString(),
      };

      renderWidget(OrbitWidget(data));
    } catch (e) {
      // Fallback empty state
      renderWidget(OrbitWidget({
        progress: 0, completed: 0, total: 0,
        streak: 0, xp: 0, level: 1,
        nextHabit: null, updatedAt: new Date().toISOString(),
      }));
    }
  }
}
