import { redirect } from 'next/navigation'

interface TicketPageProps {
  params: Promise<{ id: string }>
}

export default async function TicketDetailPage({ params }: TicketPageProps) {
  // Since we're using the modal approach for ticket details,
  // redirect individual ticket pages to the main tickets list
  const { id } = await params
  
  // You could add a query parameter to auto-open the modal for this ticket
  redirect(`/tickets?ticketId=${id}`)
}