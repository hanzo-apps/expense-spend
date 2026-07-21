import { useIam } from '@hanzo/iam/react'
import { YStack, XStack, Text } from '@hanzo/gui'
import { category, money } from '../lib/expense'
import { Panel, Chip, Bar, Action, ink } from '../ui'

/** An illustrative by-category card — a sample of the product surface. */
const SAMPLE: readonly { cat: string; amount: number }[] = [
  { cat: 'housing', amount: 1450 },
  { cat: 'food', amount: 612 },
  { cat: 'transport', amount: 240 },
  { cat: 'fun', amount: 186 },
  { cat: 'bills', amount: 132 },
]

/**
 * Signed-out landing. A fintech pitch beside a live sample of the app's own
 * by-category card, with one action: PKCE sign-in via Hanzo (hanzo.id). No local
 * credential form — Hanzo IAM owns every credential interaction.
 */
export function SignedOut() {
  const { login, isLoading } = useIam()
  const sampleTotal = SAMPLE.reduce((t, s) => t + s.amount, 0)
  const sampleMax = Math.max(...SAMPLE.map((s) => s.amount))

  return (
    <YStack
      flex={1}
      minHeight="100vh"
      alignItems="center"
      justifyContent="center"
      padding="$6"
      backgroundColor="$background"
    >
      <XStack width="100%" maxWidth={1040} gap="$9" alignItems="center" flexWrap="wrap">
        {/* Pitch */}
        <YStack flex={1} minWidth={320} gap="$5">
          <XStack alignItems="center" gap="$2">
            <YStack
              width={24}
              height={24}
              borderRadius={7}
              backgroundColor={ink.accent}
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize={14} fontWeight="900" color={ink.accentInk}>
                $
              </Text>
            </YStack>
            <Text fontSize={13} fontWeight="800" letterSpacing={1.4} color={ink.muted}>
              EXPENSE SPEND
            </Text>
          </XStack>

          <YStack gap="$4">
            <Text fontSize={46} fontWeight="900" letterSpacing={-1.4} lineHeight={50} color={ink.strong}>
              See where your money actually goes.
            </Text>
            <Text fontSize={17} lineHeight={26} color={ink.muted} maxWidth={460}>
              Log every expense in seconds, tag it to a category, and watch clean totals build up
              by category and by month. Your spend stays org-scoped and private on Hanzo Base.
            </Text>
          </YStack>

          <XStack gap="$3" alignItems="center" flexWrap="wrap">
            <Action
              label={isLoading ? 'Loading…' : 'Sign in with Hanzo'}
              onPress={() => login()}
              disabled={isLoading}
              height={52}
              fontSize={16}
            />
            <Text fontSize={13} color={ink.faint}>
              Free · PKCE via hanzo.id
            </Text>
          </XStack>

          <XStack gap="$2" flexWrap="wrap" paddingTop="$2">
            {['Tabular log', 'Category chips', 'Monthly charts'].map((f) => (
              <XStack
                key={f}
                paddingHorizontal={12}
                paddingVertical={6}
                borderRadius={999}
                borderWidth={1}
                borderColor={ink.hairline}
              >
                <Text fontSize={13} color={ink.muted}>
                  {f}
                </Text>
              </XStack>
            ))}
          </XStack>
        </YStack>

        {/* Sample card */}
        <YStack flex={1} minWidth={320} maxWidth={460}>
          <Panel>
            <XStack alignItems="center" justifyContent="space-between">
              <Text fontSize={12} fontWeight="700" letterSpacing={0.5} color={ink.faint}>
                THIS MONTH
              </Text>
              <Text fontSize={11} color={ink.faint}>
                Sample
              </Text>
            </XStack>
            <Text fontSize={38} fontWeight="900" letterSpacing={-1} color={ink.strong}>
              {money(sampleTotal)}
            </Text>

            <YStack gap="$3">
              {SAMPLE.map((s) => {
                const c = category(s.cat)
                return (
                  <XStack key={s.cat} alignItems="center" gap="$3">
                    <XStack width={116}>
                      <Chip category={c} />
                    </XStack>
                    <YStack flex={1}>
                      <Bar pct={s.amount / sampleMax} color={c.color} height={9} />
                    </YStack>
                    <Text width={78} textAlign="right" fontSize={14} fontWeight="700" color={ink.strong}>
                      {money(s.amount)}
                    </Text>
                  </XStack>
                )
              })}
            </YStack>
          </Panel>
        </YStack>
      </XStack>
    </YStack>
  )
}
