#!/bin/bash
# Fix all gold gradient classes in page.tsx
FILE="$HOME/.openclaw/workspace/bking-one/src/app/page.tsx"

# Replace all occurrences of incorrect gold gradient classes
sed -i '' \
  -e 's/from-gold to-gold-light/from-gold-500 via-gold-300 to-gold-500/g' \
  -e 's/from-gold via-gold-light to-gold/from-gold-500 via-gold-300 to-gold-500/g' \
  "$FILE"

echo "Done. Verifying..."
grep -n 'from-gold\|to-gold\|via-gold' "$FILE" | grep -v 'gold-500\|gold-300\|gold-400\|gold/'