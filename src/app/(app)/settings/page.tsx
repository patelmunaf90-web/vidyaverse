import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SchoolProfileForm } from './school-profile-form'
import { MasterReset } from './master-reset'

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">School Profile</CardTitle>
          <CardDescription>
            Manage your school's information and branding.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SchoolProfileForm />
        </CardContent>
      </Card>
      <MasterReset />
    </div>
  )
}
