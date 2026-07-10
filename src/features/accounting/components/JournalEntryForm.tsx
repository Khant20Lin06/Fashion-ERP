"use client"

import { useMemo, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertTriangle, CheckCircle2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { EmptyState } from "@/components/ui/empty-state"
import { MoneyInput } from "@/components/accounting/MoneyInput"
import { formatCurrency } from "@/lib/format"
import { useAccounts } from "../hooks/useAccounts"
import { useCreateJournalEntry } from "../hooks/useLedger"
import { journalEntryFormSchema, type JournalEntryFormValues } from "../schemas/journal.schema"

/** Double-entry Journal Entry form — Debit must equal Credit before submission. */
export function JournalEntryForm({ onCreated }: { onCreated?: () => void }) {
  const { data: accounts } = useAccounts()
  const createEntry = useCreateJournalEntry()
  const [pendingAccountId, setPendingAccountId] = useState("")

  const form = useForm<JournalEntryFormValues>({
    resolver: zodResolver(journalEntryFormSchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      reference: "",
      description: "",
      lines: [],
    },
  })

  const { fields, append, remove, update } = useFieldArray({ control: form.control, name: "lines" })
  const lines = form.watch("lines")

  const totals = useMemo(() => {
    const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0)
    const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0)
    return { totalDebit, totalCredit, balanced: Math.abs(totalDebit - totalCredit) < 0.005 }
  }, [lines])

  function handleAddLine() {
    const account = (accounts ?? []).find((a) => a.id === pendingAccountId)
    if (!account) return
    append({ accountId: account.id, accountName: account.name, debit: 0, credit: 0, description: "" })
    setPendingAccountId("")
  }

  function onSubmit(values: JournalEntryFormValues) {
    createEntry.mutate(values, {
      onSuccess: () => {
        form.reset({ date: new Date().toISOString().slice(0, 10), reference: "", description: "", lines: [] })
        onCreated?.()
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Journal Entry</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. JE-2026-0105" className="font-mono" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What is this entry for?" rows={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Debit / Credit Lines</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1.5">
                <FormLabel>Account</FormLabel>
                <Select value={pendingAccountId} onValueChange={setPendingAccountId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {(accounts ?? []).map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.code} — {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" variant="outline" onClick={handleAddLine} disabled={!pendingAccountId}>
                <Plus /> Add Line
              </Button>
            </div>

            {fields.length === 0 ? (
              <EmptyState title="No lines added" description="Add at least two account lines (one debit, one credit)." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Debit</TableHead>
                    <TableHead>Credit</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const line = lines[index]
                    return (
                      <TableRow key={field.id}>
                        <TableCell className="font-medium">{field.accountName}</TableCell>
                        <TableCell>
                          <MoneyInput
                            value={line?.debit ?? 0}
                            onChange={(value) => update(index, { ...line, debit: value, credit: value > 0 ? 0 : line.credit })}
                            className="w-28"
                          />
                        </TableCell>
                        <TableCell>
                          <MoneyInput
                            value={line?.credit ?? 0}
                            onChange={(value) => update(index, { ...line, credit: value, debit: value > 0 ? 0 : line.debit })}
                            className="w-28"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={line?.description ?? ""}
                            onChange={(e) => update(index, { ...line, description: e.target.value })}
                            placeholder="Line description"
                            className="w-48"
                          />
                        </TableCell>
                        <TableCell>
                          <Button type="button" size="icon" variant="ghost" onClick={() => remove(index)} aria-label="Remove line">
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}

            {fields.length > 0 && (
              <div className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <div className="flex gap-6">
                  <span>
                    Total Debit: <span className="font-medium">{formatCurrency(totals.totalDebit)}</span>
                  </span>
                  <span>
                    Total Credit: <span className="font-medium">{formatCurrency(totals.totalCredit)}</span>
                  </span>
                </div>
                {totals.balanced ? (
                  <span className="flex items-center gap-1.5 font-medium text-success">
                    <CheckCircle2 className="size-4" /> Balanced
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 font-medium text-destructive">
                    <AlertTriangle className="size-4" /> Out of balance by {formatCurrency(Math.abs(totals.totalDebit - totals.totalCredit))}
                  </span>
                )}
              </div>
            )}
            {form.formState.errors.lines?.message && (
              <p className="text-sm text-destructive">{form.formState.errors.lines.message}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={!totals.balanced || fields.length < 2 || createEntry.isPending}>
            Save as Draft
          </Button>
        </div>
      </form>
    </Form>
  )
}
