"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PerformanceReviewForm } from "@/features/hr/components/PerformanceReviewForm"
import { PerformanceReviewList } from "@/features/hr/components/PerformanceReviewList"

export default function PerformancePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Performance Management</h1>
        <p className="text-sm text-muted-foreground">Track goals, ratings, and manager feedback.</p>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Reviews</TabsTrigger>
          <TabsTrigger value="new">New Review</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-4">
          <PerformanceReviewList />
        </TabsContent>
        <TabsContent value="new" className="mt-4">
          <PerformanceReviewForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
