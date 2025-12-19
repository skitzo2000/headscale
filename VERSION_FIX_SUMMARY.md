# Version Fix Summary

## Problem
The headscale fork was incorrectly released as `v1.0.0`, making it appear ahead of the upstream project (which is at version 0.28.x).

## Solution
Re-release as `0.28.0-skitz0` to properly align with upstream versioning while maintaining fork identity.

---

## Current State → Target State

### Git Tags
```
BEFORE:                          AFTER:
├── v1.0.0 (commit a4a3d4a)  →  ├── 0.28.0-skitz0 (commit a4a3d4a)
```

### GitHub Releases
```
BEFORE:                                              AFTER:
├── v1.0.0                                       →  ├── 0.28.0-skitz0
│   ├── headscale_1.0.0_linux_amd64                 │   ├── headscale_0.28.0-skitz0_linux_amd64
│   ├── headscale_1.0.0_linux_amd64.deb             │   ├── headscale_0.28.0-skitz0_linux_amd64.deb
│   ├── headscale_1.0.0_linux_arm64                 │   ├── headscale_0.28.0-skitz0_linux_arm64
│   ├── headscale_1.0.0_linux_arm64.deb             │   ├── headscale_0.28.0-skitz0_linux_arm64.deb
│   ├── headscale_1.0.0.tar.gz                      │   ├── headscale_0.28.0-skitz0.tar.gz
│   └── checksums.txt                               │   └── checksums.txt
```

### Docker Images (GHCR)
```
BEFORE:                                    AFTER:
├── ghcr.io/.../headscale:latest       →  ├── ghcr.io/.../headscale:0.28.0-skitz0
├── ghcr.io/.../headscale:1.0.0            ├── ghcr.io/.../headscale:0.28.0-skitz0-debug
├── ghcr.io/.../headscale:1               ├── ghcr.io/.../headscale:sha-a4a3d4a
├── ghcr.io/.../headscale:v1.0.0           └── ghcr.io/.../headscale:sha-a4a3d4a-debug
├── ghcr.io/.../headscale:v1               
├── ghcr.io/.../headscale:stable              (Note: 'latest' will NOT be updated 
├── ghcr.io/.../headscale:1.0.0-debug          due to prerelease suffix)
├── ...debug variants...
└── ghcr.io/.../headscale:sha-a4a3d4a
```

---

## What to Do

### Quick Start (3 Steps)

1. **Run the script:**
   ```bash
   ./fix-version-script.sh
   ```

2. **Delete old release:**
   - Web: https://github.com/skitzo2000/headscale/releases/tag/v1.0.0
   - CLI: `gh release delete v1.0.0 --yes`

3. **Monitor new release:**
   https://github.com/skitzo2000/headscale/actions/workflows/release.yml

---

## Documentation

| File | Purpose |
|------|---------|
| `QUICK_START.md` | 📄 Fast reference (start here!) |
| `VERSION_FIX_INSTRUCTIONS.md` | 📖 Complete guide with details |
| `VERSION_FIX_CHECKLIST.md` | ✅ Pre/post verification steps |
| `fix-version-script.sh` | 🔧 Automation script |
| `VERSION_FIX_SUMMARY.md` | 📊 This file |

---

## Why 0.28.0-skitz0?

| Component | Reason |
|-----------|--------|
| `0.28.0` | Aligns with upstream headscale version (currently 0.28.x series) |
| `-skitz0` | Fork identifier suffix |
| No `v` prefix | Follows SemVer convention (goreleaser adds `v` automatically) |
| Suffix behavior | Makes goreleaser mark as prerelease, not "latest" stable |

---

## Technical Details

### Same Commit, Different Tag
Both versions point to the same git commit:
```
Commit: a4a3d4a0322cd4362838b67b2bccce5a5c11d21d
Message: "rework to re-enable package creation"
Date: 2025-12-19 12:54:42 -0500
```

### No Code Changes
This is **purely a tagging/versioning change**. The actual code and binaries are identical.

### Automatic Release Creation
goreleaser workflow automatically:
1. Detects the new git tag
2. Builds binaries for linux/amd64 and linux/arm64
3. Creates .deb packages
4. Publishes to GitHub Releases
5. Pushes Docker images to GHCR
6. Generates checksums

Duration: ~5-10 minutes

---

## Verification Commands

After completion, verify success:

### Check Git Tags
```bash
# Should show only 0.28.0-skitz0
git ls-remote --tags origin
```

### Download and Test Binary
```bash
wget https://github.com/skitzo2000/headscale/releases/download/0.28.0-skitz0/headscale_0.28.0-skitz0_linux_amd64
chmod +x headscale_0.28.0-skitz0_linux_amd64
./headscale_0.28.0-skitz0_linux_amd64 version

# Expected output:
# headscale version 0.28.0-skitz0
# commit: a4a3d4a...
```

### Test Docker Image
```bash
docker pull ghcr.io/skitzo2000/headscale:0.28.0-skitz0
docker run --rm ghcr.io/skitzo2000/headscale:0.28.0-skitz0 version
```

---

## FAQ

**Q: Will users who downloaded v1.0.0 be affected?**  
A: They will need to download the new release. Old binaries will continue to work, but won't receive updates.

**Q: Do I need to update my deployment?**  
A: If you deployed v1.0.0, update to 0.28.0-skitz0 when convenient. Functionally identical.

**Q: What happens to old Docker images?**  
A: They remain in GHCR unless manually deleted. Safe to keep or remove.

**Q: Can I skip deleting the v1.0.0 release?**  
A: Technically yes, but confusing for users. Recommended to delete for clarity.

**Q: Will this break anything?**  
A: No. Same code, different version label. Existing installations unaffected.

---

## Support

If you encounter issues:
1. Check `VERSION_FIX_CHECKLIST.md` troubleshooting section
2. Review GitHub Actions logs for workflow failures
3. Verify GitHub authentication for git operations

---

**Ready?** Start with: `./fix-version-script.sh` or see `QUICK_START.md`
