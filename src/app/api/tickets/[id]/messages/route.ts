import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to check permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get the ticket to validate permissions
    const { data: ticket } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single()

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Check if user has access to this ticket
    const hasAccess = 
      profile.role === 'super_admin' ||
      (profile.role === 'org_admin' && ticket.organization_id === profile.organization_id) ||
      (profile.role === 'user' && ticket.requester_id === user.id) ||
      (profile.role === 'contractor' && ticket.contractor_id === user.id)

    if (!hasAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Fetch messages for this ticket
    const { data: messages, error: messagesError } = await supabase
      .from('ticket_comments')
      .select(`
        id,
        ticket_id,
        user_id,
        message,
        created_at,
        user:profiles!ticket_comments_user_id_fkey(full_name, role)
      `)
      .eq('ticket_id', id)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({ messages: messages || [] })

  } catch (error) {
    console.error('Messages fetch error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { message } = await request.json()

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to check permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get the ticket to validate permissions
    const { data: ticket } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single()

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Check if user has access to this ticket
    const hasAccess = 
      profile.role === 'super_admin' ||
      (profile.role === 'org_admin' && ticket.organization_id === profile.organization_id) ||
      (profile.role === 'user' && ticket.requester_id === user.id) ||
      (profile.role === 'contractor' && ticket.contractor_id === user.id)

    if (!hasAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Insert the new message
    const { data: newMessage, error: insertError } = await supabase
      .from('ticket_comments')
      .insert({
        ticket_id: id,
        user_id: user.id,
        message: message.trim()
      })
      .select(`
        id,
        ticket_id,
        user_id,
        message,
        created_at,
        user:profiles!ticket_comments_user_id_fkey(full_name, role)
      `)
      .single()

    if (insertError) {
      console.error('Error inserting message:', insertError)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return NextResponse.json({ message: newMessage })

  } catch (error) {
    console.error('Message send error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}