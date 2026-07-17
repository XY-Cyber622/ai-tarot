#!/bin/bash
# Vite dev server starter (fully detached)
cd /Users/xy/Desktop/tarot

# Kill any existing
pkill -9 -f "node_modules/.bin/vite" 2>/dev/null
pkill -9 -f "node.*vite" 2>/dev/null
sleep 2

# Clear cache
rm -rf node_modules/.vite

# Start with setsid (new session) so it survives shell exit
setsid ./node_modules/.bin/vite > /tmp/vite.log 2>&1 < /dev/null &
echo "Started PID: $!"

# Wait for it to be ready
for i in 1 2 3 4 5 6 7 8 9 10; do
  sleep 1
  if /usr/bin/curl -s -m 1 -o /dev/null -w "%{http_code}" http://127.0.0.1:5173/ 2>/dev/null | grep -q 200; then
    echo "✅ Vite is up after ${i}s"
    break
  fi
done

echo "---LOG---"
head -10 /tmp/vite.log
echo "---STATUS---"
/usr/bin/curl -s -m 5 -o /dev/null -w "Root: HTTP %{http_code} | %{time_total}s\n" http://127.0.0.1:5173/
