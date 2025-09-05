
'use client'

import React from "react"
import { useUser } from "@/context/user-context"
import { ReportClient } from "./client"

export default function ReportsPage() {
  const { songs } = useUser();

  return (
    <div>
      <ReportClient data={songs} />
    </div>
  )
}
