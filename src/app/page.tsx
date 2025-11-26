import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Shield, Users, Zap } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold text-blue-600">SaaS Platform</h1>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-6 text-5xl font-bold text-gray-900">
          Modern Multi-Tenant SaaS Platform
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
          Built with Next.js, Supabase, and TypeScript. Features enterprise-grade security,
          role-based access control, and complete data isolation.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="text-lg">
              Start Free Trial
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-lg">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
          Everything you need to scale
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <Shield className="mb-2 h-10 w-10 text-blue-600" />
              <CardTitle>Enterprise Security</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Row-level security with PostgreSQL RLS policies ensures complete data isolation
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="mb-2 h-10 w-10 text-blue-600" />
              <CardTitle>Role-Based Access</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Flexible role management with Super Admin, Org Admin, Contractor, and User roles
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="mb-2 h-10 w-10 text-blue-600" />
              <CardTitle>Lightning Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Server-side rendering with Next.js 14 App Router for optimal performance
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className="mb-2 h-10 w-10 text-blue-600" />
              <CardTitle>Production Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Fully tested authentication, authorization, and multi-tenancy features
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="border-t bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Built with modern technologies
          </h2>
          <div className="flex flex-wrap justify-center gap-8 text-gray-600">
            <div className="text-center">
              <p className="text-lg font-semibold">Next.js 14</p>
              <p className="text-sm">React Framework</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">Supabase</p>
              <p className="text-sm">Backend & Database</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">TypeScript</p>
              <p className="text-sm">Type Safety</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">Tailwind CSS</p>
              <p className="text-sm">Styling</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">shadcn/ui</p>
              <p className="text-sm">UI Components</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="mb-6 text-3xl font-bold text-gray-900">
          Ready to get started?
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
          Create your account and start building today. No credit card required.
        </p>
        <Link href="/signup">
          <Button size="lg" className="text-lg">
            Create Free Account
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2024 SaaS Platform. Built with Next.js, Supabase, and TypeScript.</p>
        </div>
      </footer>
    </div>
  )
}

