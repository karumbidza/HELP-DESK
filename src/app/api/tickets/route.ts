import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateTicketRequest, Ticket, TicketUpdate } from '@/types/tickets'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user profile with organization
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

    // Parse request body
    const body: CreateTicketRequest = await request.json()

    // Validate required fields
    if (!body.title || body.title.length < 5 || body.title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be between 5 and 200 characters' },
        { status: 400 }
      )
    }

    if (!body.description || body.description.length < 10) {
      return NextResponse.json(
        { error: 'Description must be at least 10 characters' },
        { status: 400 }
      )
    }

    if (!body.category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      )
    }

    if (!body.priority) {
      return NextResponse.json(
        { error: 'Priority is required' },
        { status: 400 }
      )
    }

    // Find appropriate admin based on category (simple assignment for now)
    // In a real system, you might have more complex assignment logic
    const { data: admins, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .eq('role', 'admin')
      .limit(1)

    if (adminError) {
      console.error('Error finding admin:', adminError)
    }

    const assignedAdmin = admins?.[0] || null

    // Create the ticket
    const ticketData = {
      organization_id: profile.organization_id,
      title: body.title.trim(),
      description: body.description.trim(),
      priority: body.priority,
      category: body.category,
      site_location: body.site_location?.trim() || null,
      requester_id: user.id,
      admin_id: assignedAdmin?.id || null,
      status: 'open' as const
    }

    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select(`
        *,
        requester:profiles!tickets_requester_id_fkey(id, full_name, email),
        admin:profiles!tickets_admin_id_fkey(id, full_name, email),
        organization:organizations(id, name)
      `)
      .single()

    if (ticketError) {
      console.error('Error creating ticket:', ticketError)
      return NextResponse.json(
        { error: 'Failed to create ticket' },
        { status: 500 }
      )
    }

    // Create initial ticket update
    const { error: updateError } = await supabase
      .from('ticket_updates')
      .insert({
        ticket_id: ticket.id,
        update_type: 'created',
        description: 'Ticket created',
        created_by: user.id,
        metadata: {
          initial_priority: body.priority,
          initial_category: body.category
        }
      })

    if (updateError) {
      console.error('Error creating ticket update:', updateError)
      // Don't fail the request for this
    }

    // TODO: Send notification to assigned admin
    if (assignedAdmin) {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          organization_id: profile.organization_id,
          user_id: assignedAdmin.id,
          ticket_id: ticket.id,
          message: `New ${body.priority} priority ticket assigned: ${body.title}`,
          notification_type: 'email',
          metadata: {
            ticket_priority: body.priority,
            ticket_category: body.category,
            requester_name: profile.full_name
          }
        })

      if (notificationError) {
        console.error('Error creating notification:', notificationError)
        // Don't fail the request for this
      }
    }

    return NextResponse.json(
      {
        message: 'Ticket created successfully',
        ticket,
        assigned_admin: assignedAdmin ? {
          id: assignedAdmin.id,
          name: assignedAdmin.full_name,
          email: assignedAdmin.email
        } : null
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error in ticket creation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
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

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Build query based on filters and user role
    let query = supabase
      .from('tickets')
      .select(`
        *,
        requester:profiles!tickets_requester_id_fkey(id, full_name, email),
        admin:profiles!tickets_admin_id_fkey(id, full_name, email),
        contractor:profiles!tickets_contractor_id_fkey(id, full_name, email),
        organization:organizations(id, name),
        updates:ticket_updates(
          id, update_type, description, created_at,
          created_by_user:profiles!ticket_updates_created_by_fkey(id, full_name)
        ),
        documents:documents(id, document_type, file_name, uploaded_at)
      `)

    // Apply organization filter (unless super admin)
    if (profile.role !== 'super_admin') {
      query = query.eq('organization_id', profile.organization_id)
    }

    // Apply role-based filters
    switch (profile.role) {
      case 'user':
        // Regular users see only their own tickets
        query = query.eq('requester_id', user.id)
        break
      case 'contractor':
        // Contractors see tickets assigned to them or open tickets they can take
        query = query.or(`contractor_id.eq.${user.id},status.eq.open`)
        break
      case 'admin':
        // Admins see all tickets in their organization (already filtered above)
        break
      case 'super_admin':
        // Super admins see everything (no additional filters)
        break
    }

    // Apply URL filters
    const status = searchParams.get('status')
    if (status) {
      query = query.eq('status', status)
    }

    const priority = searchParams.get('priority')
    if (priority) {
      query = query.eq('priority', priority)
    }

    const category = searchParams.get('category')
    if (category) {
      query = query.eq('category', category)
    }

    // Order by most recent first
    query = query.order('created_at', { ascending: false })

    // Apply pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    query = query.range(offset, offset + limit - 1)

    const { data: tickets, error: ticketsError } = await query

    if (ticketsError) {
      console.error('Error fetching tickets:', ticketsError)
      return NextResponse.json(
        { error: 'Failed to fetch tickets' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', profile.organization_id)

    return NextResponse.json({
      tickets: tickets || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}