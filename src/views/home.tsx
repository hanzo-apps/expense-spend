import { useState } from 'react'
import { useIam } from '@hanzo/iam/react'
import { useQuery } from '@hanzo/base/react'
import { YStack, XStack, Text } from '@hanzo/gui'
import { type Expense, sum, money, byCategory } from '../lib/expense'
import { Segmented, type SegOption, ink } from '../ui'
import { Log } from './log'
import { Summary } from './summary'

type Tab = 'log' | 'summary'

const TABS: readonly SegOption<Tab>[] = [
  { value: 'log', label: 'Log' },
  { value: 'summary', label: 'Summary' },
]

/**
 * Signed-in shell. Owns the one org-scoped `expenses` query and hands its rows
 * to both the log and the summary, so the hero total and both tabs read a single
 * source of truth. The header carries the wordmark, the tab switch, and sign-out.
 */
export function Home() {
  const { user, logout } = useIam()
  const who = user?.displayName || user?.name || user?.email || 'you'
  const [tab, setTab] = useState<Tab>('log')

  const { data: rows, isLoading, error, refetch } = useQuery<Expense>('expenses', {
    sort: '-date,-created',
    realtime: false,
  })

  const total = sum(rows)
  const cats = byCategory(rows).length

  return (
    <YStack flex={1} minHeight="100vh" backgroundColor="$background">
      {/* Top bar */}
      <XStack
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="$4"
        paddingVertical="$3"
        borderBottomWidth={1}
        borderColor={ink.hairline}
      >
        <XStack alignItems="center" gap="$2">
          <YStack
            width={26}
            height={26}
            borderRadius={8}
            backgroundColor={ink.accent}
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={15} fontWeight="900" color={ink.accentInk}>
              $
            </Text>
          </YStack>
          <Text fontSize={17} fontWeight="800" color={ink.strong} letterSpacing={0.2}>
            Expense Spend
          </Text>
        </XStack>

        <Segmented value={tab} options={TABS} onChange={setTab} />

        <XStack alignItems="center" gap="$3">
          <Text fontSize={13} color={ink.faint} numberOfLines={1}>
            {who}
          </Text>
          <Text
            onPress={() => logout()}
            cursor="pointer"
            fontSize={13}
            fontWeight="600"
            color={ink.muted}
            hoverStyle={{ color: ink.strong }}
          >
            Sign out
          </Text>
        </XStack>
      </XStack>

      {/* Body */}
      <YStack flex={1} alignItems="center" paddingVertical="$6" paddingHorizontal="$4">
        <YStack width="100%" maxWidth={880} gap="$6">
          {/* Hero total */}
          <YStack gap="$2">
            <Text fontSize={13} fontWeight="700" letterSpacing={0.6} color={ink.faint}>
              TOTAL SPEND
            </Text>
            <Text fontSize={54} fontWeight="900" letterSpacing={-1.2} color={ink.strong}>
              {money(total)}
            </Text>
            <Text fontSize={14} color={ink.muted}>
              {rows.length} {rows.length === 1 ? 'expense' : 'expenses'} across {cats}{' '}
              {cats === 1 ? 'category' : 'categories'}
            </Text>
          </YStack>

          {tab === 'log' ? (
            <Log rows={rows} isLoading={isLoading} error={error} refetch={refetch} />
          ) : (
            <Summary rows={rows} isLoading={isLoading} error={error} />
          )}
        </YStack>
      </YStack>
    </YStack>
  )
}
