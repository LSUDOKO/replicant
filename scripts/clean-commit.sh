#!/bin/bash
# Clean commit script - ensures no sensitive data is committed

set -e

echo "🔍 Pre-commit Security Check..."

# Check for sensitive files
echo "Checking for .env files..."
if git diff --cached --name-only | grep -E "\.env$|\.env\.local$|\.env\.production$"; then
    echo "❌ ERROR: .env files detected in commit!"
    echo "Please remove them with: git reset HEAD <file>"
    exit 1
fi

# Check for private keys
echo "Checking for private keys..."
if git diff --cached | grep -iE "private.*key|PRIVATE_KEY.*=.*[0-9a-f]{64}"; then
    echo "❌ ERROR: Private key detected in commit!"
    echo "Please remove sensitive data before committing"
    exit 1
fi

# Check for secrets
echo "Checking for secrets..."
if git diff --cached | grep -iE "secret|password|token.*=.*[A-Za-z0-9]{20,}"; then
    echo "⚠️  WARNING: Potential secret detected in commit!"
    echo "Please review your changes carefully"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✅ Security check passed!"
echo ""
echo "📝 Files to be committed:"
git diff --cached --name-status

echo ""
read -p "Proceed with commit? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "✅ Proceeding with commit..."
else
    echo "❌ Commit cancelled"
    exit 1
fi
