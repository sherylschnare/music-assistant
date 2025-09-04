import { PageHeader } from "@/components/page-header"
import { CopyrightForm } from "./copyright-form"
import { Card, CardContent } from "@/components/ui/card"

export default function CopyrightPage() {
  return (
    <div>
      <PageHeader
        title="Copyright Information Lookup"
        description="Use AI to get a summary of copyright information for a piece of music."
      />
      <Card>
        <CardContent className="pt-6">
          <CopyrightForm />
        </CardContent>
      </Card>
    </div>
  )
}
