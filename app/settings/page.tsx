import { SettingsForm } from "@/components/settings-form"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      <SettingsForm />
    </div>
  )
}

