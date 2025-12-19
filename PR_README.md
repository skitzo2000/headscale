# Version Fix Pull Request

This PR provides a complete solution for correcting the release version from `v1.0.0` to `0.28.0-skitz0`.

## 📋 What This PR Contains

This PR includes all preparation work and documentation needed to fix the release versioning issue. The actual git tag operations require manual execution due to authentication requirements.

### Files Added

1. **fix-version-script.sh** (1.7 KB) - Executable automation script
2. **QUICK_START.md** (393 B) - One-page quick reference
3. **VERSION_FIX_SUMMARY.md** (5.3 KB) - Visual before/after guide
4. **VERSION_FIX_INSTRUCTIONS.md** (5.1 KB) - Complete detailed guide
5. **VERSION_FIX_CHECKLIST.md** (5.4 KB) - Pre/post execution verification
6. **PR_README.md** (this file) - Pull request overview

**Total documentation:** ~18 KB ensuring foolproof execution

### Local Git Changes

- ✅ Local tag `v1.0.0` deleted
- ✅ Local tag `0.28.0-skitz0` created on commit a4a3d4a
- ✅ Script tested and validated
- ✅ All documentation committed

## 🎯 Problem & Solution

### Problem
The fork was released as `v1.0.0`, making it appear ahead of upstream headscale (currently at 0.28.x).

### Solution
Re-release as `0.28.0-skitz0` to:
- Align with upstream version numbering (0.28.x)
- Add fork identifier suffix (-skitz0)
- Maintain version consistency

### Why 0.28.0-skitz0?

| Component | Purpose |
|-----------|---------|
| `0.28.0` | Aligns with upstream headscale version |
| `-skitz0` | Fork identifier suffix |
| No `v` prefix | SemVer convention (goreleaser adds it) |
| Prerelease suffix | Prevents marking as "latest" stable |

## 🚀 What You Need to Do

After merging this PR, execute these steps:

### Option 1: Automated (Recommended)

```bash
# Clone or pull latest changes
git pull origin main

# Run the automation script
./fix-version-script.sh
```

The script will:
1. Confirm action with you
2. Delete local v1.0.0 tag (if exists)
3. Create local 0.28.0-skitz0 tag
4. Delete remote v1.0.0 tag
5. Push new 0.28.0-skitz0 tag

### Option 2: Manual

```bash
# Delete old tag locally and remotely
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0

# Create and push new tag
git tag 0.28.0-skitz0 a4a3d4a
git push origin 0.28.0-skitz0
```

### Step 2: Delete Old GitHub Release

**Web UI:**
1. Go to: https://github.com/skitzo2000/headscale/releases
2. Find "v1.0.0" release
3. Click delete

**Or via CLI:**
```bash
gh release delete v1.0.0 --yes
```

### Step 3: Monitor New Release

The GitHub Actions workflow will automatically trigger and create the new release:
- Monitor: https://github.com/skitzo2000/headscale/actions/workflows/release.yml
- Duration: ~5-10 minutes

## 📊 Expected Outcome

### Before
```
Git Tags:      v1.0.0
Releases:      v1.0.0 with artifacts
Docker Images: ghcr.io/.../headscale:1.0.0, :latest, etc.
```

### After
```
Git Tags:      0.28.0-skitz0
Releases:      0.28.0-skitz0 with artifacts
Docker Images: ghcr.io/.../headscale:0.28.0-skitz0, etc.
```

### Release Artifacts (Auto-Generated)
- headscale_0.28.0-skitz0_linux_amd64
- headscale_0.28.0-skitz0_linux_amd64.deb
- headscale_0.28.0-skitz0_linux_arm64
- headscale_0.28.0-skitz0_linux_arm64.deb
- headscale_0.28.0-skitz0.tar.gz
- checksums.txt

## ✅ Verification

After completion, verify with:

```bash
# Check tags
git ls-remote --tags origin | grep -E "(v1.0.0|0.28.0-skitz0)"
# Should show only 0.28.0-skitz0

# Test binary
wget https://github.com/skitzo2000/headscale/releases/download/0.28.0-skitz0/headscale_0.28.0-skitz0_linux_amd64
chmod +x headscale_0.28.0-skitz0_linux_amd64
./headscale_0.28.0-skitz0_linux_amd64 version
# Should show: "headscale version 0.28.0-skitz0"

# Test Docker
docker pull ghcr.io/skitzo2000/headscale:0.28.0-skitz0
docker run --rm ghcr.io/skitzo2000/headscale:0.28.0-skitz0 version
```

## 📖 Documentation Guide

**Start here based on your preference:**

- **Quick action:** `QUICK_START.md` - 3 commands, done
- **Visual overview:** `VERSION_FIX_SUMMARY.md` - See before/after
- **Complete guide:** `VERSION_FIX_INSTRUCTIONS.md` - Everything explained
- **Verification:** `VERSION_FIX_CHECKLIST.md` - Step-by-step checks

## 🛠️ Technical Details

### No Code Changes
- Same commit (a4a3d4a) for both versions
- Identical binaries, different labels
- Zero functional differences
- Purely git tag manipulation

### goreleaser Behavior
- Detects version from git tags
- Marks as prerelease due to suffix
- Won't update "latest" tag
- Generates all artifacts automatically

### Impact
- ✅ No breaking changes
- ✅ Existing deployments unaffected
- ✅ Old binaries continue working
- ✅ Users can upgrade at their convenience

## 🔒 Security & Safety

- ✅ Script includes user confirmation
- ✅ Error handling with `set -e`
- ✅ Graceful handling of edge cases
- ✅ No forced operations
- ✅ Reversible if needed

## ❓ FAQ

**Q: Is this urgent?**  
A: No rush. Same code for both versions.

**Q: Will this break existing deployments?**  
A: No. Functionally identical.

**Q: Do I need to delete v1.0.0 release?**  
A: Recommended for clarity, but technically optional.

**Q: What about old Docker images?**  
A: They remain unless manually deleted. Safe to keep.

**Q: Can I reverse this?**  
A: Yes, though not recommended. Just delete 0.28.0-skitz0 tag and recreate v1.0.0.

## 🎓 References

- [goreleaser docs](https://goreleaser.com/)
- [GitHub releases docs](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [Semantic versioning](https://semver.org/)
- [Upstream headscale](https://github.com/juanfont/headscale/releases)

## 📝 Notes

- This PR does **NOT** modify any application code
- This PR does **NOT** change binary functionality
- This PR **ONLY** provides documentation and automation for version correction
- Actual tag operations require manual execution post-merge

## ✨ Summary

**Status:** All preparation complete, awaiting execution

**Time to execute:** ~15 minutes  
**Risk level:** Very low (reversible, no code changes)  
**Benefit:** Clear version alignment with upstream project

---

**Ready to merge and execute!** 🚀

Start with: `./fix-version-script.sh` after merging this PR.
