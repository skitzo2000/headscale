# Version Fix - Pre-Execution Checklist

Before running the version fix script, verify these conditions:

## Prerequisites

- [ ] You have cloned this repository locally
- [ ] You are in the repository root directory
- [ ] You have GitHub authentication configured (HTTPS token or SSH key)
- [ ] You have write access to the skitzo2000/headscale repository

## Current State Verification

Run these commands to verify the current state:

```bash
# Should show v1.0.0 exists remotely
git ls-remote --tags origin | grep v1.0.0

# Should show 0.28.0-skitz0 exists locally only
git tag | grep 0.28.0

# Should show commit a4a3d4a exists
git log --oneline | grep a4a3d4a
```

Expected output:
- Remote has `v1.0.0` tag
- Local has `0.28.0-skitz0` tag
- Commit `a4a3d4a` exists with message "rework to re-enable package creation"

## Execution Steps

### 1. Run the Fix Script

```bash
./fix-version-script.sh
```

The script will:
1. Prompt for confirmation (press 'y' to continue)
2. Delete local v1.0.0 tag (if exists)
3. Create local 0.28.0-skitz0 tag
4. Delete remote v1.0.0 tag
5. Push new 0.28.0-skitz0 tag to GitHub

### 2. Delete GitHub Release

**Option A: Web UI**
1. Navigate to: https://github.com/skitzo2000/headscale/releases
2. Find the "v1.0.0" release
3. Click "Edit" or the trash icon
4. Confirm deletion

**Option B: GitHub CLI**
```bash
gh release delete v1.0.0 --yes --repo skitzo2000/headscale
```

### 3. Wait for New Release

The release workflow will automatically trigger. Monitor at:
https://github.com/skitzo2000/headscale/actions/workflows/release.yml

Typical workflow duration: 5-10 minutes

## Post-Execution Verification

After the workflow completes, verify:

### Git Tags
```bash
# Should NOT show v1.0.0
git ls-remote --tags origin | grep v1.0.0

# Should show 0.28.0-skitz0
git ls-remote --tags origin | grep 0.28.0-skitz0
```

### GitHub Release
Visit: https://github.com/skitzo2000/headscale/releases/tag/0.28.0-skitz0

Should show:
- Release title: "0.28.0-skitz0" (or similar)
- Assets: 6 files (2 amd64, 2 arm64, 1 tarball, 1 checksums)
- Pre-release badge (due to -skitz0 suffix)

### Download and Test Binary
```bash
# Download the amd64 binary
wget https://github.com/skitzo2000/headscale/releases/download/0.28.0-skitz0/headscale_0.28.0-skitz0_linux_amd64

# Make executable
chmod +x headscale_0.28.0-skitz0_linux_amd64

# Check version
./headscale_0.28.0-skitz0_linux_amd64 version
```

Expected output should contain:
```
headscale version 0.28.0-skitz0
commit: a4a3d4a...
```

### Docker Images
Check that images were published:

```bash
# Pull the image
docker pull ghcr.io/skitzo2000/headscale:0.28.0-skitz0

# Check version
docker run --rm ghcr.io/skitzo2000/headscale:0.28.0-skitz0 version
```

## Troubleshooting

### Script fails with "Authentication failed"

**Problem:** Git cannot authenticate to GitHub

**Solution:**
- For HTTPS: Ensure GitHub PAT (Personal Access Token) is configured
  ```bash
  git config credential.helper store
  ```
- For SSH: Ensure SSH key is added to GitHub
  ```bash
  git remote set-url origin git@github.com:skitzo2000/headscale.git
  ```

### Tag already exists on remote

**Problem:** Someone else created 0.28.0-skitz0 tag

**Solution:**
```bash
# Force update the tag
git push origin :refs/tags/0.28.0-skitz0
git push origin 0.28.0-skitz0
```

### Release workflow doesn't trigger

**Problem:** GitHub Actions didn't detect the new tag

**Solution:**
1. Check Actions tab: https://github.com/skitzo2000/headscale/actions
2. Look for a "Release" workflow run
3. If missing, manually trigger:
   - Go to: https://github.com/skitzo2000/headscale/actions/workflows/release.yml
   - Click "Run workflow"
   - Select branch: main
   - Run

### Release workflow fails

**Problem:** Build or upload error in GitHub Actions

**Solution:**
1. Check the workflow logs: https://github.com/skitzo2000/headscale/actions
2. Look for specific error messages
3. Common issues:
   - Go module issues: May need to update dependencies
   - Docker registry auth: Check GITHUB_TOKEN permissions
   - goreleaser errors: Check .goreleaser.yml configuration

### Old v1.0.0 Docker images still exist

**Problem:** GHCR still shows v1.0.0 images

**Solution:**
Docker images from v1.0.0 will remain unless manually deleted:

1. Go to: https://github.com/skitzo2000?tab=packages
2. Find "headscale" package
3. Click on it → "Package settings"
4. Find v1.0.0 tags and delete them

Note: This is optional - they can coexist with new version

## Cleanup (Optional)

After successful release, you can optionally:

1. **Remove helper files from repository:**
   ```bash
   git rm fix-version-script.sh VERSION_FIX_INSTRUCTIONS.md QUICK_START.md VERSION_FIX_CHECKLIST.md
   git commit -m "Clean up version fix helper files"
   git push
   ```

2. **Delete v1.0.0 Docker images** (see troubleshooting section above)

## Success Criteria

✅ All checks passed when:
- [ ] v1.0.0 git tag deleted locally and remotely
- [ ] 0.28.0-skitz0 git tag exists locally and remotely
- [ ] v1.0.0 GitHub release deleted
- [ ] 0.28.0-skitz0 GitHub release exists with all artifacts
- [ ] Binary version command shows "0.28.0-skitz0"
- [ ] Docker images published to GHCR with correct tag
- [ ] Release marked as pre-release (not latest)

## Need Help?

Refer to detailed documentation:
- **Quick Start:** `QUICK_START.md`
- **Full Instructions:** `VERSION_FIX_INSTRUCTIONS.md`
- **Repository Info:** `README.md`
