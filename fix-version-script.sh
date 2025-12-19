#!/bin/bash
# Script to fix release version from v1.0.0 to 0.28.0-skitz0
# Run this script locally with proper GitHub authentication

set -e

echo "====================================="
echo "Fix Release Version Script"
echo "From: v1.0.0"
echo "To: 0.28.0-skitz0"
echo "====================================="
echo ""

# Confirm with user
read -p "This will delete the v1.0.0 tag and create 0.28.0-skitz0. Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# Step 1: Delete local tag if it exists
echo "Step 1: Deleting local tag v1.0.0..."
git tag -d v1.0.0 2>/dev/null || echo "Local tag v1.0.0 not found (already deleted)"

# Step 2: Create new local tag
echo "Step 2: Creating new tag 0.28.0-skitz0 on commit a4a3d4a..."
git tag 0.28.0-skitz0 a4a3d4a 2>/dev/null || echo "Tag 0.28.0-skitz0 already exists locally"

# Step 3: Delete remote tag
echo "Step 3: Deleting remote tag v1.0.0..."
git push origin :refs/tags/v1.0.0

# Step 4: Push new tag
echo "Step 4: Pushing new tag 0.28.0-skitz0..."
git push origin 0.28.0-skitz0

echo ""
echo "====================================="
echo "✓ Git tags updated successfully!"
echo "====================================="
echo ""
echo "Next steps:"
echo "1. Delete the v1.0.0 GitHub release at:"
echo "   https://github.com/skitzo2000/headscale/releases/tag/v1.0.0"
echo ""
echo "2. The GitHub Actions workflow will automatically create a new release"
echo "   for 0.28.0-skitz0 when it detects the tag"
echo ""
echo "3. Monitor the release workflow at:"
echo "   https://github.com/skitzo2000/headscale/actions/workflows/release.yml"
echo ""
