# Contributing to Help Desk SaaS Platform

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## 🤝 How to Contribute

### Reporting Issues

1. **Search existing issues** to avoid duplicates
2. **Use issue templates** when available
3. **Provide detailed information**:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment details (OS, browser, Node version)

### Suggesting Features

1. Open an issue with the "feature request" label
2. Clearly describe the feature and its benefits
3. Provide examples or mockups if possible

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Follow code style guidelines** (see below)
5. **Test thoroughly**
6. **Commit with clear messages**:
   ```
   feat: add user invitation system
   fix: resolve RLS policy issue for contractors
   docs: update database schema documentation
   ```
7. **Push to your fork**
8. **Open a Pull Request** to the `main` branch

## 📝 Code Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint rules (run `npm run lint`)
- Use functional components and hooks
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable names

### React Components

```typescript
// Good
interface ButtonProps {
  onClick: () => void
  label: string
  variant?: 'primary' | 'secondary'
}

export function Button({ onClick, label, variant = 'primary' }: ButtonProps) {
  // Component logic
}

// Use for client components
'use client'

// Use for server components (default)
// No directive needed
```

### Naming Conventions

- **Components**: PascalCase (`UserDashboard.tsx`)
- **Files**: kebab-case for regular files (`user-utils.ts`)
- **Functions**: camelCase (`getUserProfile`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_USERS_PER_ORG`)
- **Types/Interfaces**: PascalCase (`UserProfile`, `DatabaseConfig`)

### Database

- Table names: lowercase, plural (`organizations`, `profiles`)
- Column names: snake_case (`created_at`, `organization_id`)
- Always include RLS policies for new tables
- Document schema changes in `supabase/DATABASE.md`

## 🧪 Testing

### Before Submitting

- [ ] Code builds without errors: `npm run build`
- [ ] Linting passes: `npm run lint`
- [ ] Manual testing completed
- [ ] Documentation updated if needed

### Testing Checklist

- [ ] Test with different user roles
- [ ] Test data isolation (multi-tenancy)
- [ ] Test on mobile/tablet/desktop
- [ ] Test edge cases and error handling

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Public auth pages
│   ├── (dashboard)/       # Protected dashboard pages
│   └── api/               # API routes (if needed)
├── components/
│   ├── ui/                # shadcn/ui components
│   └── shared/            # Shared custom components
├── lib/                   # Utility functions and configs
└── types/                 # TypeScript type definitions
```

## 🗄️ Database Changes

When making database changes:

1. Create a new migration file:
   ```sql
   -- supabase/migrations/002_your_feature_name.sql
   ```

2. Include:
   - Table creation/modification
   - Indexes
   - RLS policies
   - Triggers/functions

3. Update `supabase/DATABASE.md` with:
   - New tables/columns
   - Relationships
   - RLS policy descriptions

4. Test migration on a development database first

## 🎨 UI/UX Guidelines

- Use shadcn/ui components when possible
- Maintain consistent spacing (Tailwind classes)
- Ensure mobile responsiveness
- Follow accessibility best practices
- Use Lucide React for icons

### Example

```tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'

export function UserCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Users
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  )
}
```

## 📚 Documentation

When adding features:

- Update relevant `.md` files
- Add JSDoc comments for complex functions
- Include examples in code comments
- Update README.md if needed

```typescript
/**
 * Fetches user profile with organization data
 * @param userId - The UUID of the user
 * @returns User profile with organization details
 * @throws Error if user not found or RLS policy violation
 */
export async function getUserProfile(userId: string) {
  // Implementation
}
```

## 🔒 Security Considerations

- Never commit `.env.local` or secrets
- Always use RLS policies for data access
- Validate user input on both client and server
- Use parameterized queries (Supabase handles this)
- Test authorization for all routes

## 🚀 Deployment

- All merges to `main` trigger automatic deployment via Vercel
- Test on preview deployments before merging
- Verify environment variables are set in Vercel

## 📋 Commit Message Guidelines

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add project management module
fix: resolve authentication loop on login page
docs: update API documentation for user endpoints
refactor: optimize database queries in dashboard
```

## 🐛 Bug Fix Process

1. Create an issue describing the bug
2. Reference the issue in your PR: `Fixes #123`
3. Include steps to reproduce
4. Add tests to prevent regression
5. Update documentation if behavior changes

## ✨ Feature Development Process

1. Discuss feature in an issue first
2. Get approval from maintainers
3. Create feature branch
4. Implement with tests
5. Update documentation
6. Submit PR with detailed description

## 📞 Getting Help

- **Documentation**: Check `README.md`, `QUICKSTART.md`, etc.
- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community (link in README)

## 🎯 Priority Areas

We're especially looking for contributions in:

- [ ] Project management features
- [ ] Task assignment and tracking
- [ ] Time tracking for contractors
- [ ] Email notifications
- [ ] Billing integration
- [ ] Mobile app (React Native)
- [ ] API documentation
- [ ] Test coverage

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

## 🙏 Thank You!

Thank you for contributing to making this SaaS platform better! Every contribution, no matter how small, is valued and appreciated.

---

**Questions?** Open an issue or start a discussion!
