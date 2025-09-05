
'use client'

import React, { Suspense } from "react"
import { useUser } from "@/context/user-context"
import { PageHeader } from "@/components/page-header"
import { ReportClient } from "./client"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

function ReportsPageContent() {
  const { songs } = useUser();

  const handlePrint = () => {
    window.print();
  }

  return (
    <div>
      <PageHeader title="Reports" description="Generate and print reports for your music library." className="print:hidden">
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print Report
        </Button>
      </PageHeader>
      <div className="report-content">
        <ReportClient data={songs} />
      </div>
    </div>
  )
}


export default function ReportsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportsPageContent />
    </Suspense>
  )
}
