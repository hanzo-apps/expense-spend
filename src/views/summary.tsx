import type { ReactNode } from 'react'
import { YStack, XStack, Text, Spinner, Circle } from '@hanzo/gui'
import { type Expense, byCategory, byMonth, sum, money, monthKey, today } from '../lib/expense'
import { Panel, Bar, ink } from '../ui'

interface SummaryProps {
  rows: Expense[]
  isLoading: boolean
  error: Error | null
}

/** A labelled KPI tile — the fintech stat-row unit. */
function Stat({ label, value, accent }: { label: string; value: ReactNode; accent?: string }) {
  return (
    <YStack
      flex={1}
      minWidth={150}
      gap="$2"
      padding="$3"
      borderWidth={1}
      borderColor={ink.panelBorder}
      borderRadius={14}
      backgroundColor={ink.panel}
    >
      <Text fontSize={12} fontWeight="700" letterSpacing={0.4} color={ink.faint}>
        {label}
      </Text>
      <Text fontSize={22} fontWeight="800" color={accent ?? ink.strong}>
        {value}
      </Text>
    </YStack>
  )
}

/**
 * The spend summary view: KPI tiles, a by-category breakdown with proportion
 * bars, and a by-month bar chart. Pure client-side aggregation over the same
 * org-scoped rows the log reads — no extra query.
 */
export function Summary({ rows, isLoading, error }: SummaryProps) {
  if (isLoading) {
    return (
      <Panel>
        <XStack gap="$2" alignItems="center" paddingVertical={16}>
          <Spinner /> <Text color={ink.muted}>Loading…</Text>
        </XStack>
      </Panel>
    )
  }
  if (error) {
    return (
      <Panel>
        <Text color={ink.danger} fontSize={14}>
          Couldn’t reach Base ({error.message}).
        </Text>
      </Panel>
    )
  }
  if (rows.length === 0) {
    return (
      <Panel>
        <YStack alignItems="center" gap="$2" paddingVertical={28}>
          <Text fontSize={15} color={ink.muted}>
            Nothing to summarise yet.
          </Text>
          <Text fontSize={13} color={ink.faint}>
            Log a few expenses and your spend breakdown appears here.
          </Text>
        </YStack>
      </Panel>
    )
  }

  const total = sum(rows)
  const nowKey = monthKey(today())
  const thisMonth = sum(rows.filter((e) => monthKey(e.date) === nowKey))
  const cats = byCategory(rows)
  const catMax = Math.max(1, ...cats.map((s) => s.total))
  const top = cats[0]
  const avg = rows.length ? total / rows.length : 0

  const months = byMonth(rows).slice(0, 6).reverse() // oldest → newest, left to right
  const monthMax = Math.max(1, ...months.map((s) => s.total))

  return (
    <YStack gap="$4">
      {/* KPI row */}
      <XStack gap="$3" flexWrap="wrap">
        <Stat label="THIS MONTH" value={money(thisMonth)} accent={ink.accent} />
        <Stat label="TOP CATEGORY" value={top ? top.label : '—'} />
        <Stat label="AVG / ENTRY" value={money(avg)} />
        <Stat label="ENTRIES" value={String(rows.length)} />
      </XStack>

      {/* By category */}
      <Panel>
        <Text fontSize={13} fontWeight="700" letterSpacing={0.4} color={ink.muted}>
          BY CATEGORY
        </Text>
        <YStack gap="$3">
          {cats.map((s) => (
            <XStack key={s.key} alignItems="center" gap="$3">
              <XStack width={124} alignItems="center" gap="$2">
                <Circle size={9} backgroundColor={s.color} />
                <Text fontSize={14} color={ink.strong} numberOfLines={1}>
                  {s.label}
                </Text>
              </XStack>
              <YStack flex={1}>
                <Bar pct={s.total / catMax} color={s.color} height={10} />
              </YStack>
              <Text width={92} textAlign="right" fontSize={14} fontWeight="700" color={ink.strong}>
                {money(s.total)}
              </Text>
              <Text width={46} textAlign="right" fontSize={13} color={ink.muted}>
                {Math.round(s.share * 100)}%
              </Text>
            </XStack>
          ))}
        </YStack>
      </Panel>

      {/* By month */}
      <Panel>
        <XStack alignItems="center" justifyContent="space-between">
          <Text fontSize={13} fontWeight="700" letterSpacing={0.4} color={ink.muted}>
            BY MONTH
          </Text>
          <Text fontSize={13} color={ink.faint}>
            {money(total)} total
          </Text>
        </XStack>
        <XStack alignItems="flex-end" gap="$3" height={188} paddingTop="$2">
          {months.map((s) => (
            <YStack key={s.key} flex={1} alignItems="center" gap="$2">
              <Text fontSize={12} fontWeight="600" color={ink.muted}>
                {money(s.total)}
              </Text>
              <YStack width="58%" height={128} justifyContent="flex-end">
                <YStack
                  width="100%"
                  height={Math.max(6, (s.total / monthMax) * 128)}
                  backgroundColor={s.color}
                  borderRadius={8}
                />
              </YStack>
              <Text fontSize={12} color={ink.faint}>
                {s.label.split(' ')[0]}
              </Text>
            </YStack>
          ))}
        </XStack>
      </Panel>
    </YStack>
  )
}
