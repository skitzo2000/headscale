# Version Fix Instructions: v1.0.0 → 0.28.0-skitz0

## Problem Statement

The initial release was tagged as `v1.0.0`, which makes this fork appear ahead of the main headscale project's release cycle (currently at 0.28.x). We need to re-release as `0.28.0-skitz0` to maintain proper version alignment.

## Current State

- **Current Tag:** v1.0.0 (commit: a4a3d4a)
- **Current Release:** https://github.com/skitzo2000/headscale/releases/tag/v1.0.0
- **Target Tag:** 0.28.0-skitz0 (same commit: a4a3d4a)

## Solution Overview

Since the tag has already been pushed and a GitHub release has been created, we need to:

1. Delete the incorrect tag (v1.0.0) locally and remotely
2. Create and push the correct tag (0.28.0-skitz0)
3. Delete the old GitHub release
4. Let GitHub Actions automatically create the new release

## Automated Method (Recommended)

A script has been provided to automate the git tag operations:

```bash
# From your local headscale repository directory
./fix-version-script.sh
```

The script will:
- Delete the local v1.0.0 tag
- Create the new 0.28.0-skitz0 tag
- Push the deletion to GitHub
- Push the new tag to GitHub

## Manual Method

If you prefer to run the commands manually:

### Step 1: Update Git Tags

```bash
# Delete the local v1.0.0 tag
git tag -d v1.0.0

# Create the new tag on the same commit
git tag 0.28.0-skitz0 a4a3d4a

# Delete the remote v1.0.0 tag
git push origin :refs/tags/v1.0.0

# Push the new tag
git push origin 0.28.0-skitz0
```

### Step 2: Delete Old GitHub Release

You need to delete the v1.0.0 release from GitHub:

**Option A: Via GitHub Web UI**

1. Go to https://github.com/skitzo2000/headscale/releases
2. Find the "v1.0.0" release
3. Click the trash/delete icon or "Edit" → "Delete"
4. Confirm deletion

**Option B: Via GitHub CLI**

```bash
gh release delete v1.0.0 --yes
```

### Step 3: Monitor New Release Creation

The GitHub Actions workflow will automatically trigger when it detects the new tag:

1. Watch the workflow run at: https://github.com/skitzo2000/headscale/actions/workflows/release.yml
2. Once complete, verify the new release at: https://github.com/skitzo2000/headscale/releases/tag/0.28.0-skitz0

## Expected Results

After completing these steps:

### Git Tags
- ❌ `v1.0.0` - Deleted
- ✅ `0.28.0-skitz0` - Active

### GitHub Releases
- ❌ v1.0.0 release - Deleted
- ✅ 0.28.0-skitz0 release - Created with artifacts:
  - `headscale_0.28.0-skitz0_linux_amd64`
  - `headscale_0.28.0-skitz0_linux_amd64.deb`
  - `headscale_0.28.0-skitz0_linux_arm64`
  - `headscale_0.28.0-skitz0_linux_arm64.deb`
  - `headscale_0.28.0-skitz0.tar.gz`
  - `checksums.txt`

### Docker Images
The release workflow will also publish Docker images to GHCR:
- `ghcr.io/skitzo2000/headscale:0.28.0-skitz0`
- `ghcr.io/skitzo2000/headscale:0.28.0-skitz0-debug`
- `ghcr.io/skitzo2000/headscale:sha-a4a3d4a`
- `ghcr.io/skitzo2000/headscale:sha-a4a3d4a-debug`

Note: The `latest` tag will NOT be updated since this is a prerelease version (contains a suffix).

## Verification

After the new release is created, verify the version:

```bash
# Download and check the binary
wget https://github.com/skitzo2000/headscale/releases/download/0.28.0-skitz0/headscale_0.28.0-skitz0_linux_amd64
chmod +x headscale_0.28.0-skitz0_linux_amd64
./headscale_0.28.0-skitz0_linux_amd64 version
```

Expected output should show:
```
headscale version 0.28.0-skitz0
commit: a4a3d4a...
...
```

## Troubleshooting

### "Authentication failed" when pushing
Make sure you have proper GitHub credentials configured:
```bash
# For HTTPS
git remote -v  # Should show https://github.com/skitzo2000/headscale

# For SSH
git remote set-url origin git@github.com:skitzo2000/headscale.git
```

### Tag already exists locally
```bash
git tag -d 0.28.0-skitz0
git tag 0.28.0-skitz0 a4a3d4a
```

### Tag already exists on remote
```bash
git push origin :refs/tags/0.28.0-skitz0
git push origin 0.28.0-skitz0
```

### Release workflow doesn't trigger
- Check that the tag was pushed: `git ls-remote --tags origin`
- Check GitHub Actions: https://github.com/skitzo2000/headscale/actions
- Manually trigger if needed: Go to Actions → Release → Run workflow

## Why This Version?

The version `0.28.0-skitz0` was chosen because:

1. **0.28.0** - Aligns with the upstream headscale project version (0.28.x series)
2. **-skitz0** - Suffix identifies this as a custom fork/build
3. **No 'v' prefix** - Follows semantic versioning convention; goreleaser adds 'v' when needed
4. **Prerelease format** - The suffix makes goreleaser treat this as a prerelease, preventing it from being marked as "latest"

## Additional Notes

- This change is purely about git tags and releases - no code changes are required
- The same commit (a4a3d4a) is used for both the old and new tag
- Users who downloaded v1.0.0 artifacts will need to re-download from the new release
- Docker images from v1.0.0 can be deleted manually from GHCR if desired

## References

- Main headscale releases: https://github.com/juanfont/headscale/releases
- goreleaser documentation: https://goreleaser.com/
- GitHub releases API: https://docs.github.com/en/rest/releases
