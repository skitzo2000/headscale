# Quick Reference: Version Fix

## Run This:

```bash
./fix-version-script.sh
```

## Then Delete Old Release:

Web: https://github.com/skitzo2000/headscale/releases/tag/v1.0.0

Or CLI:
```bash
gh release delete v1.0.0 --yes
```

## Monitor New Release:

https://github.com/skitzo2000/headscale/actions/workflows/release.yml

---

For detailed instructions, see: `VERSION_FIX_INSTRUCTIONS.md`
