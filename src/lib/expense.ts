import type { BaseRecord } from '@hanzo/base/react'

/**
 * One row of the `expenses` collection provisioned from schema.sql. Base adds
 * id/created/updated/owner/org; these four are the app's own columns.
 */
export interface Expense extends BaseRecord {
  amount: number
  category: string
  note: string
  date: string // yyyy-mm-dd
}

/** A spend category and its fintech accent (reads on the dark surface). */
export interface Category {
  id: string
  label: string
  color: string
}

/** The fixed category set — one chip colour each, ordered for the picker. */
export const CATEGORIES: readonly Category[] = [
  { id: 'food', label: 'Food', color: '#34d399' },
  { id: 'transport', label: 'Transport', color: '#60a5fa' },
  { id: 'housing', label: 'Housing', color: '#a78bfa' },
  { id: 'shopping', label: 'Shopping', color: '#f472b6' },
  { id: 'health', label: 'Health', color: '#2dd4bf' },
  { id: 'fun', label: 'Fun', color: '#fbbf24' },
  { id: 'bills', label: 'Bills', color: '#fb923c' },
  { id: 'other', label: 'Other', color: '#94a3b8' },
]

const BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]))

/** Resolve a category by id, falling back to a neutral chip. */
export function category(id: string): Category {
  return BY_ID.get(id) ?? { id: id || 'other', label: id || 'Other', color: '#94a3b8' }
}

/** A hex colour at ~13% alpha, for soft chip / bar-track fills. */
export function tint(hex: string): string {
  return `${hex}22`
}

const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

/** Format a number as USD, tolerating NaN/Infinity. */
export function money(n: number): string {
  return USD.format(Number.isFinite(n) ? n : 0)
}

/** Today as yyyy-mm-dd in local time. */
export function today(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/** Whether a yyyy-mm-dd string is a real, in-range calendar date. */
export function isValidDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const [y, m, d] = s.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
}

/** 'yyyy-mm' month key of an ISO date. */
export function monthKey(date: string): string {
  return (date || '').slice(0, 7)
}

/** 'Mon YYYY' label for a 'yyyy-mm' key. */
export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  if (!y || !m) return key
  return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'short', year: 'numeric' })
}

/** 'Jul 4' short day label for a yyyy-mm-dd string. */
export function dayLabel(date: string): string {
  const [y, m, d] = (date || '').split('-').map(Number)
  if (!y || !m || !d) return date
  return new Date(y, m - 1, d).toLocaleString('en-US', { month: 'short', day: 'numeric' })
}

/** A named total with its share (0..1) of the grand total. */
export interface Slice {
  key: string
  label: string
  color: string
  total: number
  share: number
}

/** Grand total of a set of expenses. */
export function sum(rows: readonly Expense[]): number {
  return rows.reduce((t, e) => t + (Number(e.amount) || 0), 0)
}

function group(
  rows: readonly Expense[],
  keyOf: (e: Expense) => string,
  meta: (key: string) => { label: string; color: string },
): Slice[] {
  const totals = new Map<string, number>()
  let grand = 0
  for (const e of rows) {
    const amt = Number(e.amount) || 0
    const k = keyOf(e)
    totals.set(k, (totals.get(k) ?? 0) + amt)
    grand += amt
  }
  const out: Slice[] = []
  for (const [key, total] of totals) {
    const m = meta(key)
    out.push({ key, label: m.label, color: m.color, total, share: grand ? total / grand : 0 })
  }
  return out.sort((a, b) => b.total - a.total)
}

/** Spend summed by category, largest first. */
export function byCategory(rows: readonly Expense[]): Slice[] {
  return group(
    rows,
    (e) => e.category,
    (id) => {
      const c = category(id)
      return { label: c.label, color: c.color }
    },
  )
}

/** Spend summed by month, most-recent first. */
export function byMonth(rows: readonly Expense[]): Slice[] {
  const slices = group(
    rows,
    (e) => monthKey(e.date),
    (k) => ({ label: monthLabel(k), color: '#818cf8' }),
  )
  return slices.sort((a, b) => (a.key < b.key ? 1 : -1))
}
