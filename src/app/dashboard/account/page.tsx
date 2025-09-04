
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AccountForm } from "./account-form"

export default function AccountPage() {
  return (
    <div>
      <PageHeader
        title="My Account"
        description="Manage your account settings and profile information."
      />
      <Card>
        <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>This is how others will see you on the site.</CardDescription>
        </CardHeader>
        <CardContent>
          <AccountForm />
        </CardContent>
      </Card>
    </div>
  )
}
