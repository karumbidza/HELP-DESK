import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { TicketStatus } from '@/types/tickets'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status, note } = await request.json()

    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get the ticket to validate permissions and current state
    const { data: ticket } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single()

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Check permissions
    const canUpdate = 
      profile.role === 'super_admin' ||
      (profile.role === 'org_admin' && ticket.organization_id === profile.organization_id) ||
      (profile.role === 'contractor' && ticket.contractor_id === user.id)

    if (!canUpdate) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Validate status transitions
    const validStatuses: TicketStatus[] = ['open', 'assigned', 'accepted', 'in_progress', 'completed', 'closed', 'cancelled']
    
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Update the ticket status
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating ticket:', updateError)
      return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 })
    }

    // Create a ticket update record if there's a note
    if (note) {
      const { error: updateRecordError } = await supabase
        .from('ticket_updates')
        .insert({
          ticket_id: id,
          user_id: user.id,
          update_type: 'status_change',
          description: note,
          old_status: ticket.status,
          new_status: status
        })

      if (updateRecordError) {
        console.error('Error creating update record:', updateRecordError)
        // Don't fail the request if update record creation fails
      }
    }

    return NextResponse.json({ 
      message: 'Ticket status updated successfully',
      status: status
    })

  } catch (error) {
    console.error('Status update error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}