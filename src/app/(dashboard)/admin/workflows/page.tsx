import { redirect } from 'next/navigation';

/**
 * The workflow builder lives on the main Workflows page (create + steps +
 * run + execution history). This admin alias redirects there instead of
 * duplicating a second, unwired builder UI (assessment UX findings).
 */
export default function AdminWorkflowsPage() {
  redirect('/workflows');
}
