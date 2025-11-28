'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Send, MessageCircle, User } from 'lucide-react'
import { UserRole } from '@/types/database.types'

interface ChatMessage {
  id: string
  ticket_id: string
  user_id: string
  message: string
  created_at: string
  user: {
    full_name: string
    role: UserRole
  }
}

interface TicketChatProps {
  ticketId: string
  userRole: UserRole
  userId: string
}

export function TicketChat({ ticketId, userRole, userId }: TicketChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      } else {
        console.error('Failed to fetch messages')
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    
    try {
      const response = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage.trim()
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, data.message])
        setNewMessage('')
        setTimeout(scrollToBottom, 100)
      } else {
        const error = await response.json()
        alert(`Failed to send message: ${error.error}`)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800'
      case 'org_admin':
        return 'bg-blue-100 text-blue-800'
      case 'contractor':
        return 'bg-orange-100 text-orange-800'
      case 'user':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleDisplay = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'Admin'
      case 'org_admin':
        return 'Admin'
      case 'contractor':
        return 'Contractor'
      case 'user':
        return 'User'
      default:
        return 'User'
    }
  }

  useEffect(() => {
    fetchMessages()
    
    // Set up polling for new messages (every 5 seconds)
    const interval = setInterval(fetchMessages, 5000)
    
    return () => clearInterval(interval)
  }, [ticketId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <MessageCircle className="h-8 w-8 mb-2" />
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isCurrentUser = message.user_id === userId
              const showDateDivider = index === 0 || 
                new Date(messages[index - 1].created_at).toDateString() !== 
                new Date(message.created_at).toDateString()

              return (
                <div key={message.id}>
                  {showDateDivider && (
                    <div className="flex items-center justify-center my-4">
                      <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {new Date(message.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  
                  <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {!isCurrentUser && (
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {message.user.full_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <span className="text-xs font-medium text-gray-700">
                          {isCurrentUser ? 'You' : message.user.full_name}
                        </span>
                        <Badge className={`text-xs ${getRoleColor(message.user.role)}`}>
                          {getRoleDisplay(message.user.role)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      
                      <Card className={isCurrentUser ? 'bg-blue-50 border-blue-200' : 'bg-white'}>
                        <CardContent className="px-3 py-2">
                          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t p-4 bg-white">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={handleKeyPress}
            disabled={isSending}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}