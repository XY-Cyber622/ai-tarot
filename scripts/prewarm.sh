#!/bin/bash
# Pre-warm Vite by fetching every route so the browser opens instantly.
set -e
BASE="http://127.0.0.1:5173"
PATHS=(
  "/"
  "/src/main.tsx"
  "/src/App.tsx"
  "/src/index.css"
  "/src/router.tsx"
  "/src/components/index.ts"
  "/src/components/Loading.tsx"
  "/src/components/Background.tsx"
  "/src/components/Button.tsx"
  "/src/components/Card.tsx"
  "/src/components/Container.tsx"
  "/src/components/Deck.tsx"
  "/src/components/Logo.tsx"
  "/src/components/PageHeader.tsx"
  "/src/components/Progress.tsx"
  "/src/components/QuestionInput.tsx"
  "/src/components/SpreadCard.tsx"
  "/src/services/http.ts"
  "/src/services/ai.ts"
  "/src/services/index.ts"
  "/src/utils/prompt.ts"
  "/src/utils/validate.ts"
  "/src/hooks/useLocalStorage.ts"
  "/src/hooks/useSession.ts"
  "/src/context/SessionContext.tsx"
  "/src/pages/Landing/index.tsx"
  "/src/pages/Question/index.tsx"
  "/src/pages/Spread/index.tsx"
  "/src/pages/Shuffle/index.tsx"
  "/src/pages/Draw/index.tsx"
  "/src/pages/Result/index.tsx"
  "/src/pages/History/index.tsx"
  "/src/data/major-arcana.ts"
  "/src/data/spreads.ts"
  "/src/data/deck.ts"
)
echo "🔥 Pre-warming Vite (${#PATHS[@]} modules)..."
for p in "${PATHS[@]}"; do
  code=$(/usr/bin/curl -s -m 20 -o /dev/null -w "%{http_code}" "${BASE}${p}")
  t=$(/usr/bin/curl -s -m 20 -o /dev/null -w "%{time_total}" "${BASE}${p}")
  printf "  %s  %ss  %s\n" "$code" "$t" "$p"
done
echo ""
echo "✅ Done. Vite is fully warm."
