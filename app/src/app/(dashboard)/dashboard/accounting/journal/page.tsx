"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { JournalEntryForm } from "@/features/accounting/components/JournalEntryForm"
import { JournalEntryList } from "@/features/accounting/components/JournalEntryList"

export default function JournalEntriesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Journal Entries</h1>
        <p className="text-sm text-muted-foreground">Record double-entry transactions — Draft → Submitted → Approved → Posted.</p>
      </div>

      <Tabs defaultValue="new">
        <TabsList>
          <TabsTrigger value="new">New Entry</TabsTrigger>
          <TabsTrigger value="list">All Entries</TabsTrigger>
        </TabsList>
        <TabsContent value="new" className="mt-4">
          <JournalEntryForm />
        </TabsContent>
        <TabsContent value="list" className="mt-4">
          <JournalEntryList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
