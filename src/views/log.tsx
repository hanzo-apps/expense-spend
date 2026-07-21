import { useState } from 'react'
import { useMutation } from '@hanzo/base/react'
import { YStack, XStack, Input, Text, Spinner, Circle } from '@hanzo/gui'
import {
  type Expense,
  CATEGORIES,
  category,
  money,
  today,
  isValidDate,
  dayLabel,
} from '../lib/expense'
import { Panel, Chip, Action, ink } from '../ui'

interface LogProps {
  rows: Expense[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * The expense log view: an "add expense" compose panel over a tabular ledger.
 * Reads come from the shell's lifted query; writes are local mutations against
 * the org-scoped `expenses` collection, refetching after each change.
 */
export function Log({ rows, isLoading, error, refetch }: LogProps) {
  const create = useMutation('expenses', 'create')
  const remove = useMutation('expenses', 'delete')

  const [amount, setAmount] = useState('')
  const [cat, setCat] = useState<string>(CATEGORIES[0].id)
  const [note, setNote] = useState('')
  const [date, setDate] = useState(today())

  const value = parseFloat(amount)
  const canAdd = value > 0 && !create.isLoading

  async function add() {
    if (!canAdd) return
    await create.mutate({
      amount: Math.round(value * 100) / 100,
      category: cat,
      note: note.trim(),
      date: isValidDate(date) ? date : today(),
    })
    setAmount('')
    setNote('')
    await refetch()
  }

  async function del(id: string) {
    if (remove.isLoading) return
    await remove.mutate({ id })
    await refetch()
  }

  return (
    <YStack gap="$4">
      {/* Add expense */}
      <Panel>
        <Text fontSize={13} fontWeight="700" letterSpacing={0.4} color={ink.muted}>
          ADD EXPENSE
        </Text>

        <XStack gap="$3" flexWrap="wrap">
          <XStack
            flex={1}
            minWidth={200}
            alignItems="center"
            gap="$2"
            paddingHorizontal={14}
            height={52}
            borderWidth={1}
            borderColor={ink.panelBorder}
            borderRadius={12}
            backgroundColor="rgba(0,0,0,0.18)"
          >
            <Text fontSize={22} fontWeight="600" color={ink.faint}>
              $
            </Text>
            <Input
              flex={1}
              value={amount}
              onChangeText={setAmount}
              onSubmitEditing={add}
              placeholder="0.00"
              borderWidth={0}
              backgroundColor="transparent"
              paddingHorizontal={0}
              fontSize={22}
              fontWeight="700"
              color={ink.strong}
            />
          </XStack>

          <Input
            width={160}
            height={52}
            value={date}
            onChangeText={setDate}
            onSubmitEditing={add}
            placeholder="YYYY-MM-DD"
            borderWidth={1}
            borderColor={ink.panelBorder}
            borderRadius={12}
            backgroundColor="rgba(0,0,0,0.18)"
            fontSize={15}
            color={ink.strong}
          />
        </XStack>

        {/* Category picker */}
        <XStack flexWrap="wrap" gap="$2">
          {CATEGORIES.map((c) => {
            const on = c.id === cat
            return (
              <XStack
                key={c.id}
                onPress={() => setCat(c.id)}
                cursor="pointer"
                alignItems="center"
                gap="$2"
                paddingHorizontal={12}
                paddingVertical={7}
                borderRadius={999}
                borderWidth={1}
                borderColor={on ? c.color : ink.hairline}
                backgroundColor={on ? `${c.color}22` : 'transparent'}
                hoverStyle={{ borderColor: on ? c.color : ink.panelBorder }}
              >
                <Circle size={8} backgroundColor={c.color} />
                <Text fontSize={13} fontWeight="600" color={on ? c.color : ink.muted}>
                  {c.label}
                </Text>
              </XStack>
            )
          })}
        </XStack>

        <XStack gap="$3" alignItems="center" flexWrap="wrap">
          <Input
            flex={1}
            minWidth={220}
            height={48}
            value={note}
            onChangeText={setNote}
            onSubmitEditing={add}
            placeholder="What was it for? (optional)"
            borderWidth={1}
            borderColor={ink.panelBorder}
            borderRadius={12}
            backgroundColor="rgba(0,0,0,0.18)"
            fontSize={15}
            color={ink.strong}
          />
          <Action label="Add expense" onPress={add} disabled={!canAdd} />
        </XStack>

        {create.error ? (
          <Text color={ink.danger} fontSize={13}>
            {create.error.message}
          </Text>
        ) : null}
      </Panel>

      {/* Ledger */}
      <Panel>
        <XStack alignItems="center" justifyContent="space-between">
          <Text fontSize={13} fontWeight="700" letterSpacing={0.4} color={ink.muted}>
            EXPENSE LOG
          </Text>
          <Text fontSize={13} color={ink.faint}>
            {rows.length} {rows.length === 1 ? 'entry' : 'entries'}
          </Text>
        </XStack>

        {/* Column header */}
        <XStack alignItems="center" paddingBottom={4}>
          <Text width={84} fontSize={11} fontWeight="700" letterSpacing={0.5} color={ink.faint}>
            DATE
          </Text>
          <Text width={128} fontSize={11} fontWeight="700" letterSpacing={0.5} color={ink.faint}>
            CATEGORY
          </Text>
          <Text flex={1} fontSize={11} fontWeight="700" letterSpacing={0.5} color={ink.faint}>
            NOTE
          </Text>
          <Text width={110} textAlign="right" fontSize={11} fontWeight="700" letterSpacing={0.5} color={ink.faint}>
            AMOUNT
          </Text>
          <YStack width={34} />
        </XStack>

        {isLoading ? (
          <XStack gap="$2" alignItems="center" paddingVertical={16}>
            <Spinner /> <Text color={ink.muted}>Loading…</Text>
          </XStack>
        ) : error ? (
          <Text color={ink.danger} fontSize={14} paddingVertical={12}>
            Couldn’t reach Base ({error.message}). Confirm VITE_HANZO_BASE_URL and that you’re
            signed in.
          </Text>
        ) : rows.length === 0 ? (
          <YStack alignItems="center" gap="$2" paddingVertical={28}>
            <Text fontSize={15} color={ink.muted}>
              No expenses yet.
            </Text>
            <Text fontSize={13} color={ink.faint}>
              Add your first one above to start tracking spend.
            </Text>
          </YStack>
        ) : (
          <YStack>
            {rows.map((e) => (
              <XStack
                key={e.id}
                alignItems="center"
                paddingVertical={12}
                borderTopWidth={1}
                borderColor={ink.hairline}
                hoverStyle={{ backgroundColor: ink.hairline }}
              >
                <Text width={84} fontSize={13} color={ink.muted}>
                  {dayLabel(e.date)}
                </Text>
                <XStack width={128}>
                  <Chip category={category(e.category)} />
                </XStack>
                <Text flex={1} fontSize={14} color={e.note ? ink.strong : ink.faint} numberOfLines={1}>
                  {e.note || '—'}
                </Text>
                <Text width={110} textAlign="right" fontSize={15} fontWeight="700" color={ink.strong}>
                  {money(Number(e.amount) || 0)}
                </Text>
                <XStack
                  width={34}
                  justifyContent="flex-end"
                  onPress={() => del(e.id)}
                  cursor="pointer"
                  opacity={0.35}
                  hoverStyle={{ opacity: 1 }}
                >
                  <Text fontSize={18} color={ink.danger}>
                    ×
                  </Text>
                </XStack>
              </XStack>
            ))}
          </YStack>
        )}
      </Panel>
    </YStack>
  )
}
