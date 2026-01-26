# WebRTC Connection Troubleshooting

## What Changed

The WebRTC connection has been updated with:

1. **TURN Servers** - Added free public TURN servers from Open Relay Project
2. **Better Logging** - Console logs now show detailed connection states
3. **Timeout Protection** - ICE gathering has a 5-second timeout to prevent hanging
4. **Multiple Protocols** - TURN servers on ports 80, 443, and 443/TCP

## Configuration

```typescript
iceServers: [
  // STUN servers (for direct connections)
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },

  // TURN servers (for relayed connections when direct fails)
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  },
  {
    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject'
  }
]
```

## How to Test

1. Open browser console (F12) in both windows
2. Follow the normal connection steps (Host → Join → Exchange offers/answers)
3. Watch the console logs for:
   - `ICE gathering state: gathering/complete`
   - `ICE candidate: host/srflx/relay`
   - `ICE connection state: checking/connected/completed`
   - `Connection state: connecting/connected`

## Connection Flow

### Successful Connection Logs
```
ICE gathering state: gathering
ICE candidate: host udp
ICE candidate: srflx udp  (STUN worked - good!)
ICE candidate: relay udp  (TURN available - fallback ready)
ICE gathering state: complete
ICE connection state: checking
ICE connection state: connected
Connection state: connected
```

### What the Candidate Types Mean
- **host**: Direct local network connection (fastest)
- **srflx**: Server reflexive (through STUN server - fast)
- **relay**: Relayed through TURN server (slower but works through restrictive NATs)

## Common Issues & Solutions

### Issue: "ICE connection failed"

**Symptoms:**
- Connection never completes
- Console shows: `ICE connection state: failed`

**Solutions:**
1. Check browser console for which candidates are being generated
2. If you only see `host` candidates, firewall is blocking STUN/TURN
3. Try disabling VPN or restrictive firewall temporarily
4. Make sure both peers complete the full offer/answer exchange

### Issue: Connection works locally but not remotely

**Symptoms:**
- Works on same network
- Fails across different networks

**Solutions:**
1. This is expected - you need TURN servers (now configured!)
2. Open browser DevTools → `about:webrtc` (Firefox) or `chrome://webrtc-internals` (Chrome)
3. Look for "relay" candidates - if missing, TURN servers aren't reachable
4. Corporate/school networks may block TURN - try different network

### Issue: "ICE gathering timeout"

**Symptoms:**
- Console shows: `ICE gathering timeout - proceeding anyway`

**Solutions:**
1. This is normal on slow networks
2. Connection may still succeed with partial candidates
3. If it continues failing, network may be blocking all ICE candidates

## Testing Locally (Same Machine)

If testing on the same machine in two browser windows/tabs:

1. Open two separate browser windows (not just tabs - some browsers share WebRTC state)
2. Or use two different browsers (Chrome + Firefox)
3. Or use incognito/private mode for one window

## Testing Remotely (Different Networks)

The real test is different networks:

1. One person uses their computer
2. Another person uses a different computer on a different network
3. Exchange offers/answers via copy/paste (Discord, Slack, text message, etc.)

## Production TURN Servers

The free Open Relay Project servers are:
- ✅ Great for testing
- ⚠️ Rate limited (shared by many users)
- ⚠️ May have downtime

For production, consider:
- [Twilio TURN](https://www.twilio.com/stun-turn) - Free tier available
- [Metered TURN](https://www.metered.ca/tools/openrelay/) - Generous free tier
- Self-hosted [coturn](https://github.com/coturn/coturn) server

## How to Add Your Own TURN Server

Edit `src/lib/webrtc/connection.svelte.ts`:

```typescript
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'your-username',
      credential: 'your-password'
    }
  ]
};
```

## Browser Compatibility

WebRTC is supported in:
- ✅ Chrome/Edge 56+
- ✅ Firefox 44+
- ✅ Safari 11+
- ✅ Chrome/Safari on iOS
- ✅ Chrome on Android

Not supported in:
- ❌ Internet Explorer
- ❌ Old browsers

## Debugging Tips

1. **Check `about:webrtc` or `chrome://webrtc-internals`**
   - Shows detailed connection statistics
   - Lists all ICE candidates
   - Shows which candidate pair was selected

2. **Browser Console**
   - All WebRTC events are logged
   - Look for errors or warnings

3. **Network Tab**
   - STUN/TURN traffic uses UDP (won't show in network tab)
   - But initial HTTPS loads should work

4. **Test TURN Server**
   ```bash
   # Test if TURN server is reachable
   curl https://openrelay.metered.ca
   ```

## Still Having Issues?

1. Make sure both peers have completed all steps
2. Try refreshing both browser windows
3. Check browser console for specific error messages
4. Test on a different network
5. Try a different browser
6. Ensure WebRTC is not disabled in browser settings
