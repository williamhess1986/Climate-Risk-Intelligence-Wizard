# 🚀 Softgen Release Checklist - Climate Risk Wizard

**Single Source of Truth for Production Deployments**

This runbook ensures every deployment is validated, tested, and production-ready.

---

## 📋 Pre-Release Checklist

### ✅ 1. Environment Configuration

**Staging:**
```bash
NEXT_PUBLIC_API_MODE=real
NEXT_PUBLIC_API_BASE_URL=https://api.staging.climatewizard.ai/v1
NEXT_PUBLIC_LOG_LEVEL=verbose
NEXT_PUBLIC_API_TIMEOUT=30000
```

**Production:**
```bash
NEXT_PUBLIC_API_MODE=real
NEXT_PUBLIC_API_BASE_URL=https://api.climatewizard.ai/v1
NEXT_PUBLIC_LOG_LEVEL=normal
NEXT_PUBLIC_API_TIMEOUT=30000
```

**Verify Configuration:**
```bash
# Check current mode
echo $NEXT_PUBLIC_API_MODE

# Verify API base URL
echo $NEXT_PUBLIC_API_BASE_URL
```

---

### ✅ 2. Run All Tests

**Unit Tests:**
```bash
npm test -- src/__tests__/api/wizard-dashboard.test.ts
```

**Expected Output:**
- ✅ All assertions pass
- ✅ Required fields validated
- ✅ Severity in [0, 1]
- ✅ Drift direction in [↑, ↓, →]
- ✅ Dataset versions present

**Staging Integration Test (BLOCKING GATE):**
```bash
npm run test:staging
```

**Expected Output:**
```
✅ Dashboard fetched from staging
✅ Zod validation passed
✅ Severity invariants: all nodes in [0, 1]
✅ Drift enum valid: ↑|↓|→
✅ Dataset versions: 3 sources logged
✅ Request correlation: X-Request-ID traced
```

**If Staging Test Fails:**
- ❌ DO NOT DEPLOY
- Review error logs
- Check contract mismatches
- Verify staging API health
- Re-run after fixes

---

### ✅ 3. Manual Smoke Test Path

**Complete Wizard Flow:**

1. **Step 1: Location**
   - Enter valid location (e.g., "Manhattan, NY")
   - Verify normalized address appears
   - Click "Next"

2. **Step 2: Climate Hazards**
   - Select at least one hazard (e.g., "Heat", "Flood")
   - Click "Next"

3. **Step 3: System Concern**
   - Select system (e.g., "Health")
   - Click "Generate Dashboard"
   - ✅ Verify loading spinner appears
   - ✅ Wait for dashboard fetch (~5-10s)

4. **Step 4: Warming Baseline**
   - ✅ Verify warming estimate displays (e.g., +2.4°C)
   - ✅ Verify confidence level shows (High/Medium/Low)
   - Click "Next"

5. **Step 5: Risk Chain**
   - ✅ Verify nodes display with severity bars
   - ✅ Verify drift indicators (↑/↓/→)
   - Click "Next"

6. **Step 6: Full Dashboard**
   - ✅ Verify severity chart displays
   - ✅ Verify drift summary counts
   - ✅ Verify spillover communities list
   - ✅ Verify metadata shows dataset versions

**Test Input Change Invalidation:**

1. On Step 6, navigate back to Step 2
2. Change hazard selection (add or remove)
3. ✅ Verify toast notification: "Inputs Changed. Please regenerate the dashboard."
4. ✅ Verify navigation blocked on Steps 4-6
5. Return to Step 3
6. Click "Regenerate Dashboard"
7. ✅ Verify new dashboard fetches with updated inputs

**Test Error Handling:**

1. Manually break API (set invalid base URL or simulate network error)
2. Try generating dashboard
3. ✅ Verify error banner displays
4. ✅ Click "Copy Debug Info"
5. ✅ Verify clipboard contains:
   - Error message
   - Timestamp
   - Wizard inputs
   - Request key
6. ✅ Verify "Retry" button works

**Test Export & Reproduce:**

1. On Step 6, click "Export Data"
2. ✅ Verify JSON file downloads with correct structure
3. Click "Reproduce Assessment"
4. ✅ Verify clipboard contains:
   - wizard_inputs
   - dashboard_request_key
   - dataset_versions
   - as_of_timestamp
   - instructions

---

### ✅ 4. Verify Observability

**Server-Side Logs (Vercel Dashboard):**
```
[API:INFO] Dashboard request {
  cacheKey: "...",
  inputs: { location_key: "...", selected_hazards: [...], ... },
  mode: "real"
}

[API:INFO] ✅ Dashboard validated {
  cacheKey: "...",
  as_of_timestamp: "2024-02-15T16:30:00Z",
  dataset_versions: [
    { source_id: "IPCC-AR6", version: "CMIP6-v1.2", as_of: "2023-11-10" },
    { source_id: "NOAA", version: "v5.1", as_of: "2024-01-15" },
    { source_id: "CDC-Wonder", version: "2023", as_of: "2024-01-05" }
  ],
  node_count: 7
}
```

**Client-Side Console (Browser DevTools):**
```
Dashboard error context: {
  error: "...",
  timestamp: "2024-02-15T16:30:15Z",
  inputs: { ... },
  request_key: "{...}"
}
```

**Request Correlation:**
- ✅ Verify X-Request-ID header sent from client
- ✅ Verify same ID appears in server logs
- ✅ Verify same ID appears in error debug info

---

## 🚢 Deployment Steps

### Staging Deployment

1. **Set Staging Environment Variables (Vercel Dashboard):**
   - `NEXT_PUBLIC_API_MODE=real`
   - `NEXT_PUBLIC_API_BASE_URL=https://api.staging.climatewizard.ai/v1`
   - `NEXT_PUBLIC_LOG_LEVEL=verbose`

2. **Deploy to Staging:**
   ```bash
   vercel --env staging
   ```

3. **Run Post-Deploy Validation:**
   - Complete manual smoke test
   - Verify logs in Vercel dashboard
   - Check dataset versions in metadata

### Production Deployment

1. **Confirm Staging Gate Passed:**
   - ✅ `npm run test:staging` passed
   - ✅ Manual smoke test passed
   - ✅ Observability logs verified

2. **Set Production Environment Variables (Vercel Dashboard):**
   - `NEXT_PUBLIC_API_MODE=real`
   - `NEXT_PUBLIC_API_BASE_URL=https://api.climatewizard.ai/v1`
   - `NEXT_PUBLIC_LOG_LEVEL=normal`

3. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

4. **Post-Deploy Validation:**
   - Test complete wizard flow (Steps 1-6)
   - Verify dashboard data displays correctly
   - Test error handling
   - Verify observability logs
   - Monitor for 15 minutes

---

## 🛡️ Rollback Procedure

**If Production Issues Detected:**

1. **Immediate Rollback:**
   ```bash
   vercel rollback
   ```

2. **Investigate:**
   - Check Vercel logs for errors
   - Review "Copy Debug Info" from users
   - Check contract validation failures
   - Verify staging API health

3. **Fix and Re-Deploy:**
   - Fix issues in development
   - Re-run all tests
   - Re-deploy to staging first
   - Validate before production deploy

---

## 🎯 Success Criteria

**Deployment is successful when:**

- ✅ All unit tests pass
- ✅ Staging integration test passes
- ✅ Manual smoke test completed without errors
- ✅ Input change invalidation works correctly
- ✅ Error handling displays debug info
- ✅ Export and Reproduce features work
- ✅ Server logs show dataset versions
- ✅ Request correlation traceable (X-Request-ID)
- ✅ No TypeScript compilation errors
- ✅ No runtime validation failures

---

## 📊 Key Metrics to Monitor

**Post-Deploy (First 24 Hours):**

1. **API Response Times:**
   - Target: < 5 seconds for dashboard fetch
   - Alert: > 10 seconds

2. **Validation Failures:**
   - Target: 0 Zod validation errors
   - Alert: > 1% failure rate

3. **User-Reported Errors:**
   - Monitor "Copy Debug Info" submissions
   - Track error types and frequency

4. **Dataset Version Consistency:**
   - Verify all requests show same dataset versions
   - Alert on version mismatches

---

## 🔧 Troubleshooting

**Common Issues:**

1. **Staging Test Fails:**
   - Check `NEXT_PUBLIC_API_BASE_URL` is correct
   - Verify staging API is online
   - Check Zod schema matches staging response
   - Review contract validation errors

2. **Dashboard Not Loading:**
   - Check browser console for errors
   - Verify X-Request-ID in network tab
   - Check Vercel logs for API errors
   - Test with "Copy Debug Info"

3. **Stale Dashboard Not Invalidating:**
   - Verify `dashboardRequestKey` generation
   - Check `useEffect` dependencies
   - Review toast notification triggers

4. **Export/Reproduce Not Working:**
   - Check clipboard API permissions
   - Verify JSON structure in download
   - Test reproduce blob structure

---

## 📝 Release Notes Template

```markdown
## Release vX.Y.Z - [Date]

### ✅ Features
- [Feature description]

### 🐛 Bug Fixes
- [Bug fix description]

### 🔧 Infrastructure
- Staging integration test: PASSED
- Contract validation: PASSED
- Manual smoke test: PASSED

### 📊 Dataset Versions
- IPCC-AR6: CMIP6-v1.2 (as of 2023-11-10)
- NOAA: v5.1 (as of 2024-01-15)
- CDC-Wonder: 2023 (as of 2024-01-05)

### 🎯 Metrics
- API Response Time: X.Xs avg
- Validation Success Rate: XX%
- User-Reported Errors: X

### 🔗 Links
- Staging: https://staging.climatewizard.ai
- Production: https://climatewizard.ai
- Logs: [Vercel Dashboard Link]
```

---

**This runbook ensures every deployment is production-ready! 🚀**