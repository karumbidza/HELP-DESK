# 🚀 Help Desk - Multi-Tenant SaaS Platform

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, scalable SaaS platform built with Next.js 14, Supabase, and TypeScript. Features role-based access control, multi-tenancy, and enterprise-grade security.

**🔗 Repository**: [github.com/karumbidza/HELP-DESK](https://github.com/karumbidza/HELP-DESK)

## ✨ Features

- 🔐 **Authentication & Authorization**: Supabase Auth with role-based access control
- 🏢 **Multi-Tenancy**: Complete data isolation with PostgreSQL RLS
- 👥 **Role Management**: Super Admin, Org Admin, Contractor, and User roles
- 🎨 **Modern UI**: Built with shadcn/ui and Tailwind CSS
- 📱 **Responsive Design**: Mobile-first approach
- 🔒 **Security**: Row Level Security policies for data protection
- ⚡ **Performance**: Server-side rendering with Next.js App Router

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Styling**: Tailwind CSS, shadcn/ui
- **Deployment**: Vercel (Frontend), Railway (Database)

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account ([sign up here](https://supabase.com))
- npm or pnpm package manager

## 🚀 Getting Started

### 1. Clone and Install

```bash
cd saas-platform
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy your project URL and anon key

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database

1. Open your Supabase project's SQL Editor
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Execute the SQL to create tables, RLS policies, and triggers

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
saas-platform/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Authentication pages
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/      # Protected dashboard routes
│   │   │   ├── admin/        # Admin-only pages
│   │   │   ├── dashboard/    # Main dashboard
│   │   │   └── layout.tsx    # Dashboard layout
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   └── shared/          # Shared app components
│   ├── lib/
│   │   ├── supabase/        # Supabase client configs
│   │   ├── utils.ts         # Utility functions
│   │   ├── env.ts           # Environment validation
│   │   └── tenant-utils.ts  # Multi-tenancy helpers
│   └── types/
│       └── database.types.ts # TypeScript types
├── supabase/
│   ├── migrations/          # SQL migration files
│   └── DATABASE.md          # Database documentation
└── middleware.ts            # Route protection
```

## 👥 User Roles

### Super Admin (`super_admin`)
- Full system access
- Manage all organizations
- Create and manage users across all tenants
- View platform-wide analytics

### Organization Admin (`org_admin`)
- Full access within their organization
- Manage organization users
- Configure organization settings
- View organization analytics

### Contractor (`contractor`)
- Project-based access
- Time tracking capabilities
- Limited to assigned projects

### User (`user`)
- Basic platform access
- View assigned tasks and projects
- Update own profile

## 🔒 Security Features

- **Row Level Security (RLS)**: PostgreSQL-level data isolation
- **JWT Authentication**: Secure token-based auth
- **Role-based Authorization**: Fine-grained access control
- **Automatic Profile Creation**: Trigger-based user setup
- **Secure Password Policies**: Enforced through Supabase Auth

## 🚀 Deployment

### Vercel (Frontend)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Railway (Database - Optional)

If you want to self-host Supabase:

1. Create a new Railway project
2. Add PostgreSQL service
3. Deploy Supabase stack
4. Update environment variables

## 📊 Database Schema

See `supabase/DATABASE.md` for detailed schema documentation.

### Core Tables

- **organizations**: Tenant/customer data
- **profiles**: User profiles with role assignments

### Key Features

- Automatic timestamps
- Foreign key relationships
- Comprehensive RLS policies
- Audit logging ready

## 🧪 Testing

### Manual Testing Checklist

- [ ] User signup and login
- [ ] Role-based access control
- [ ] Multi-tenant data isolation
- [ ] Dashboard functionality
- [ ] User management
- [ ] Organization management (super admin)

### Test Accounts

Create test users with different roles to verify:

```sql
-- Super Admin (create in SQL Editor)
INSERT INTO profiles (id, email, full_name, role)
VALUES ('user-id-from-auth', 'admin@example.com', 'Super Admin', 'super_admin');
```

## 📝 Development Roadmap

### Phase 1: Foundation ✅
- [x] Project setup
- [x] Authentication
- [x] Database schema
- [x] Role-based dashboards

### Phase 2: Core Features (Next)
- [ ] Project management
- [ ] Task assignment
- [ ] Time tracking
- [ ] User invitations

### Phase 3: Advanced Features
- [ ] Billing integration
- [ ] Analytics dashboard
- [ ] API endpoints
- [ ] Webhooks

### Phase 4: Polish
- [ ] Email notifications
- [ ] Activity logs
- [ ] Advanced search
- [ ] Export functionality

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Start for Contributors

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/HELP-DESK.git`
3. Create a branch: `git checkout -b feature/your-feature`
4. Make your changes
5. Commit: `git commit -m 'feat: add some feature'`
6. Push: `git push origin feature/your-feature`
7. Open a Pull Request

## 🆘 Support

For issues and questions:

- **Issues**: [GitHub Issues](https://github.com/karumbidza/HELP-DESK/issues)
- **Discussions**: [GitHub Discussions](https://github.com/karumbidza/HELP-DESK/discussions)
- **Documentation**: Check [Database Documentation](supabase/DATABASE.md)
- **Supabase**: [Supabase Docs](https://supabase.com/docs)
- **Next.js**: [Next.js Docs](https://nextjs.org/docs)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Next Steps

1. **Complete Supabase Setup**: Run the database migrations
2. **Create Test Data**: Add sample organizations and users
3. **Explore Dashboards**: Test different role-based views
4. **Customize Styling**: Adjust colors and branding
5. **Add Features**: Implement project management, billing, etc.

## ⭐ Star History

If you find this project useful, please consider giving it a star on GitHub!

---

Built with ❤️ using Next.js, Supabase, and TypeScript

**Repository**: [github.com/karumbidza/HELP-DESK](https://github.com/karumbidza/HELP-DESK)
