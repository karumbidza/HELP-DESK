import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AssignTicketRequest } from '@/types/tickets'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*, organization:organizations(*)')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Check if user is admin or super admin
    if (!['org_admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get the ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    // Check if admin can access this ticket
    if (profile.role !== 'super_admin' && ticket.organization_id !== profile.organization_id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Parse request body
    const body: AssignTicketRequest = await request.json()

    if (!body.contractor_id) {
      return NextResponse.json(
        { error: 'contractor_id is required' },
        { status: 400 }
      )
    }

    // Verify contractor exists and is in the same organization
    const { data: contractor, error: contractorError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', body.contractor_id)
      .eq('role', 'contractor')
      .single()

    if (contractorError || !contractor) {
      return NextResponse.json(
        { error: 'Contractor not found or invalid' },
        { status: 400 }
      )
    }

    if (profile.role !== 'super_admin' && contractor.organization_id !== profile.organization_id) {
      return NextResponse.json(
        { error: 'Contractor must be in the same organization' },
        { status: 400 }
      )
    }

    // Update the ticket
    const updateData: any = {
      contractor_id: body.contractor_id,
      admin_id: user.id,
      status: 'assigned',
      updated_at: new Date().toISOString()
    }

    if (body.estimated_duration) {
      updateData.estimated_duration = body.estimated_duration
    }

    if (body.scheduled_arrival) {
      updateData.scheduled_arrival = body.scheduled_arrival
    }

    if (contractor.full_name) {
      updateData.contractor_name = contractor.full_name
    }

    const { data: updatedTicket, error: updateError } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        requester:profiles!tickets_requester_id_fkey(id, full_name, email),
        admin:profiles!tickets_admin_id_fkey(id, full_name, email),
        contractor:profiles!tickets_contractor_id_fkey(id, full_name, email),
        organization:organizations(id, name)
      `)
      .single()

    if (updateError) {
      console.error('Error updating ticket:', updateError)
      return NextResponse.json(
        { error: 'Failed to assign ticket' },
        { status: 500 }
      )
    }

    // Create ticket update record
    const { error: updateRecordError } = await supabase
      .from('ticket_updates')
      .insert({
        ticket_id: id,
        update_type: 'assigned',
        description: `Ticket assigned to ${contractor.full_name}`,
        notes: body.notes || null,
        created_by: user.id,
        metadata: {
          contractor_id: body.contractor_id,
          contractor_name: contractor.full_name,
          estimated_duration: body.estimated_duration,
          scheduled_arrival: body.scheduled_arrival,
          assigned_by: profile.full_name
        }
      })

    if (updateRecordError) {
      console.error('Error creating ticket update:', updateRecordError)
      // Don't fail the request for this
    }

    // Create notification for the contractor
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        organization_id: ticket.organization_id,
        user_id: body.contractor_id,
        ticket_id: id,
        message: `New ${ticket.priority} priority ticket assigned: ${ticket.title}`,
        notification_type: 'email',
        metadata: {
          ticket_priority: ticket.priority,
          ticket_category: ticket.category,
          assigned_by: profile.full_name,
          estimated_duration: body.estimated_duration,
          scheduled_arrival: body.scheduled_arrival,
          notes: body.notes
        }
      })

    if (notificationError) {
      console.error('Error creating notification:', notificationError)
      // Don't fail the request for this
    }

    return NextResponse.json({
      message: 'Ticket assigned successfully',
      ticket: updatedTicket,
      contractor: {
        id: contractor.id,
        name: contractor.full_name,
        email: contractor.email
      }
    })

  } catch (error) {
    console.error('Error in ticket assignment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || !['org_admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Unassign the ticket (set it back to open)
    const { data: updatedTicket, error: updateError } = await supabase
      .from('tickets')
      .update({
        contractor_id: null,
        contractor_name: null,
        status: 'open',
        estimated_duration: null,
        scheduled_arrival: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        requester:profiles!tickets_requester_id_fkey(id, full_name, email),
        admin:profiles!tickets_admin_id_fkey(id, full_name, email),
        organization:organizations(id, name)
      `)
      .single()

    if (updateError) {
      console.error('Error unassigning ticket:', updateError)
      return NextResponse.json(
        { error: 'Failed to unassign ticket' },
        { status: 500 }
      )
    }

    // Create ticket update record
    const { error: updateRecordError } = await supabase
      .from('ticket_updates')
      .insert({
        ticket_id: id,
        update_type: 'created', // Back to open
        description: 'Ticket unassigned and moved back to open',
        created_by: user.id,
        metadata: {
          unassigned_by: profile.full_name,
          previous_status: 'assigned'
        }
      })

    if (updateRecordError) {
      console.error('Error creating ticket update:', updateRecordError)
    }

    return NextResponse.json({
      message: 'Ticket unassigned successfully',
      ticket: updatedTicket
    })

  } catch (error) {
    console.error('Error in ticket unassignment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}