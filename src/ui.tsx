import type { ReactNode } from 'react'
import { XStack, YStack, Text, Circle } from '@hanzo/gui'
import type { Category } from './lib/expense'

/**
 * The app's fintech ink palette and the handful of presentational primitives
 * every view composes from — panels, category chips, proportion bars, and the
 * segmented control. One place, so the whole surface reads as a single system.
 * All built from @hanzo/gui primitives with Tamagui LONGHAND style props.
 */
export const ink = {
  panel: 'rgba(255,255,255,0.025)',
  panelBorder: 'rgba(255,255,255,0.09)',
  hairline: 'rgba(255,255,255,0.06)',
  track: 'rgba(255,255,255,0.055)',
  segActive: 'rgba(255,255,255,0.10)',
  strong: '#f4f7fb',
  muted: 'rgba(233,238,245,0.56)',
  faint: 'rgba(233,238,245,0.34)',
  accent: '#5eead4',
  accentInk: '#04241f',
  danger: '#f87171',
} as const

/** A raised card surface — the one panel look, reused everywhere. */
export function Panel({ children }: { children: ReactNode }) {
  return (
    <YStack
      backgroundColor={ink.panel}
      borderWidth={1}
      borderColor={ink.panelBorder}
      borderRadius={18}
      padding="$4"
      gap="$4"
    >
      {children}
    </YStack>
  )
}

/** A colour-coded category pill: a dot plus the label. */
export function Chip({ category: c, muted }: { category: Category; muted?: boolean }) {
  return (
    <XStack
      alignItems="center"
      gap="$2"
      paddingHorizontal={10}
      paddingVertical={4}
      borderRadius={999}
      backgroundColor={muted ? 'transparent' : `${c.color}22`}
    >
      <Circle size={8} backgroundColor={c.color} />
      <Text fontSize={12} fontWeight="600" color={muted ? ink.muted : c.color}>
        {c.label}
      </Text>
    </XStack>
  )
}

/** A horizontal proportion bar (share of the largest slice). */
export function Bar({ pct, color, height = 8 }: { pct: number; color: string; height?: number }) {
  const w = Math.max(0, Math.min(1, Number.isFinite(pct) ? pct : 0)) * 100
  return (
    <YStack height={height} borderRadius={999} backgroundColor={ink.track} overflow="hidden">
      <YStack height={height} width={`${w}%`} backgroundColor={color} borderRadius={999} />
    </YStack>
  )
}

/**
 * The primary action button, in the app's mint accent. Built from a pressable
 * stack (the @hanzogui/button frame doesn't take a text `color` prop), so the
 * whole surface uses one button look.
 */
export function Action({
  label,
  onPress,
  disabled,
  height = 48,
  fontSize = 15,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
  height?: number
  fontSize?: number
}) {
  return (
    <XStack
      onPress={disabled ? undefined : onPress}
      cursor={disabled ? 'default' : 'pointer'}
      alignItems="center"
      justifyContent="center"
      height={height}
      paddingHorizontal={24}
      borderRadius={12}
      backgroundColor={ink.accent}
      opacity={disabled ? 0.45 : 1}
      hoverStyle={disabled ? {} : { backgroundColor: '#7ff0dd' }}
      pressStyle={disabled ? {} : { backgroundColor: '#46d3bd' }}
    >
      <Text fontSize={fontSize} fontWeight="800" color={ink.accentInk}>
        {label}
      </Text>
    </XStack>
  )
}

/** A pill segmented control — the app's tab switch. */
export interface SegOption<T extends string> {
  value: T
  label: string
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: readonly SegOption<T>[]
  onChange: (v: T) => void
}) {
  return (
    <XStack backgroundColor={ink.track} borderRadius={999} padding={3} gap={2}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <XStack
            key={o.value}
            onPress={() => onChange(o.value)}
            cursor="pointer"
            alignItems="center"
            justifyContent="center"
            paddingHorizontal={16}
            paddingVertical={7}
            borderRadius={999}
            backgroundColor={active ? ink.segActive : 'transparent'}
            hoverStyle={{ backgroundColor: active ? ink.segActive : ink.hairline }}
          >
            <Text fontSize={13} fontWeight="600" color={active ? ink.strong : ink.muted}>
              {o.label}
            </Text>
          </XStack>
        )
      })}
    </XStack>
  )
}
