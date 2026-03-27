import { redirect } from 'next/navigation'

export default function WhiteLabelRedirect() {
  redirect('/management/settings/branding')
}