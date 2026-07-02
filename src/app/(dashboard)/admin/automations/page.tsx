import { redirect } from 'next/navigation';

/** See /automations - single source of truth for rule management. */
export default function AdminAutomationsPage() {
  redirect('/automations');
}
