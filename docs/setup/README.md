# Setup Guides

Configuration and setup documentation for JustTheRip application.

## 🔧 Available Setup Guides

### Storage & Media
- **[Avatar Setup](./avatar_setup.md)** - Complete guide for configuring avatar storage in Supabase, including bucket creation and RLS policies

## 📋 Setup Checklist

### Initial Project Setup

- [ ] Configure Supabase project
- [ ] Set up environment variables
- [ ] Run database migrations
- [ ] Configure storage buckets (see Avatar Setup)
- [ ] Apply RLS policies

### Storage Configuration

- [ ] Create avatar bucket (see Avatar Setup guide)
- [ ] Configure bucket policies
- [ ] Set up image optimization
- [ ] Test upload functionality

## 🚀 Quick Setup

For a new environment:

1. **Database**: Execute migrations from `../database/migrations/`
2. **Storage**: Follow avatar_setup.md for storage configuration
3. **Policies**: Apply RLS policies from `../database/policies/`
4. **Verify**: Test basic functionality

## 🔗 Related Documentation

- [Database Documentation](../database/)
- [Feature Guides](../guides/)
- [Main Documentation](../README.md)

## 💡 Contributing

When adding new setup guides:

1. Document all required steps clearly
2. Include prerequisite requirements
3. Provide example configurations
4. Add troubleshooting section
5. Update this README with the new guide
