#!/bin/bash

# Script to organize documentation and SQL files
# Run this from the project root directory

echo "🗂️  Organizing project files..."

# Create directories if they don't exist
mkdir -p docs
mkdir -p sql/migrations
mkdir -p sql/seeds
mkdir -p sql/verification

echo "📁 Created directories: docs/, sql/"

# Move documentation files (keep README.md in root)
echo "📄 Moving documentation files..."
mv ADMIN_DASHBOARD_STATUS.md docs/ 2>/dev/null
mv ADMIN_SECURITY_IMPLEMENTATION.md docs/ 2>/dev/null
mv ADMIN_TABLES_MIGRATION.md docs/ 2>/dev/null
mv ADMIN_TABLES_SUMMARY.md docs/ 2>/dev/null
mv BUILD_FIXES_COMPLETE.md docs/ 2>/dev/null
mv BUTTON_REFACTOR_GUIDE.md docs/ 2>/dev/null
mv CRITICAL_FIXES_COMPLETE.md docs/ 2>/dev/null
mv DASHBOARD_BUTTON_REFACTOR_COMPLETE.md docs/ 2>/dev/null
mv DEPLOYMENT_CHECKLIST.md docs/ 2>/dev/null
mv ENROLLMENTS_FIX.md docs/ 2>/dev/null
mv ENROLLMENTS_REFACTOR.md docs/ 2>/dev/null
mv FIXES_APPLIED.md docs/ 2>/dev/null
mv FREE_SESSION_FIXES.md docs/ 2>/dev/null
mv JWT_SECRET_UPDATE.md docs/ 2>/dev/null
mv MULTI_SESSION_TYPE_REFACTOR.md docs/ 2>/dev/null
mv NXTAI101_SYSTEM_ARCHITECTURE.md docs/ 2>/dev/null
mv PROJECT_STATUS.md docs/ 2>/dev/null
mv QUICK_START_ADMIN_MIGRATION.md docs/ 2>/dev/null
mv REVIEW_STEP_ADDED.md docs/ 2>/dev/null
mv ROLE_TYPE_FIX.md docs/ 2>/dev/null
mv SECURE_ADMIN_SETUP.md docs/ 2>/dev/null
mv SECURITY_FIXES_SUMMARY.md docs/ 2>/dev/null
mv SESSION_FIXES_COMPLETE.md docs/ 2>/dev/null
mv SESSION_VIEW_EDIT_IMPLEMENTATION.md docs/ 2>/dev/null
mv SETUP_GUIDE.md docs/ 2>/dev/null
mv SHADCN_REFACTOR_COMPLETE.md docs/ 2>/dev/null
mv SIDEBAR_REFACTOR.md docs/ 2>/dev/null
mv SUPABASE_FUNCTION_SECURITY_FIX.md docs/ 2>/dev/null
mv TASKS_COMPLETED_SUMMARY.md docs/ 2>/dev/null
mv WHATS_LEFT_TODO.md docs/ 2>/dev/null

# Move SQL migration files
echo "🗄️  Moving SQL migration files..."
mv migration-add-admin-tables.sql sql/migrations/ 2>/dev/null
mv migration-add-password-security.sql sql/migrations/ 2>/dev/null
mv migration-add-price-and-fix-unique-index.sql sql/migrations/ 2>/dev/null
mv migration-add-session-type.sql sql/migrations/ 2>/dev/null
mv migration-fix-function-search-path.sql sql/migrations/ 2>/dev/null
mv migration-session-improvements.sql sql/migrations/ 2>/dev/null
mv rollback-admin-tables.sql sql/migrations/ 2>/dev/null

# Move SQL seed files
echo "🌱 Moving SQL seed files..."
mv seed-admin-user.sql sql/seeds/ 2>/dev/null

# Move SQL verification files
echo "✅ Moving SQL verification files..."
mv verify-admin-roles.sql sql/verification/ 2>/dev/null
mv verify-admin-tables.sql sql/verification/ 2>/dev/null

# Move main schema file
echo "📋 Moving main schema file..."
mv supabase-schema.sql sql/ 2>/dev/null

echo ""
echo "✅ File organization complete!"
echo ""
echo "📂 New structure:"
echo "   docs/              - All documentation files"
echo "   sql/"
echo "   ├── migrations/    - Database migration scripts"
echo "   ├── seeds/         - Database seed scripts"
echo "   ├── verification/  - Database verification scripts"
echo "   └── supabase-schema.sql - Main schema"
echo ""
echo "💡 Tip: Add these to .gitignore if needed:"
echo "   # Keep organized"
echo "   *.md"
echo "   !README.md"
echo "   !docs/**/*.md"
