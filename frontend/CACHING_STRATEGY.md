# Caching Strategy

## Overview

This document explains the multi-layer caching strategy implemented in the application to minimize unnecessary API calls and improve performance.

## The Problem

Previously, the application was making API calls to the backend on every page load, even when navigating back to previously visited pages. This was happening because:

1. **Server-side fetching was not cached**: Next.js fetches were not configured with cache options
2. **React Query staleTime was too short**: Data was becoming stale after only 5 seconds
3. **Conflicting cache strategies**: Using both `initialData` and `placeholderData` caused confusion

## The Solution

### 1. Server-Side Caching (Next.js)

**File: `src/lib/apiClient.ts`**

Added Next.js cache configuration to the `apiClient`:

```typescript
interface RequestOptions {
  cache?: RequestCache;
  revalidate?: number | false;
}

// For GET requests, default to 60-second server-side cache
if (method === "GET") {
  config.next = { revalidate: 60 };
}
```

**Benefits:**

- Server-rendered pages cache data for 60 seconds
- Reduces load on the backend
- Faster initial page loads for users
- Works with Next.js ISR (Incremental Static Regeneration)

### 2. Client-Side Caching (React Query)

**File: `src/hooks/useClients.ts`**

Improved React Query configuration:

```typescript
{
  staleTime: 60 * 1000,      // Data is fresh for 60 seconds
  gcTime: 5 * 60 * 1000,     // Keep unused data for 5 minutes
}
```

**Benefits:**

- Data stays fresh for 60 seconds (matching server cache)
- No refetch during staleTime window
- Old queries kept in cache for 5 minutes for instant navigation
- Background refetching only when data is actually stale

### 3. Simplified Initial Data Handling

**File: `src/app/clients/ClientsClient.tsx`**

Removed conflicting cache strategies:

```typescript
// Before: Used both initialData and placeholderData
{
  initialData,
  placeholderData: (previousData) => previousData,
}

// After: Use only initialData
{
  initialData, // Server-rendered data
  // React Query handles caching automatically
}
```

**Benefits:**

- Clear separation: server provides initial data, React Query manages updates
- No confusion between initial data and cached data
- Predictable refetch behavior

## Cache Flow

### First Visit to `/clients`

1. **Server**: Fetches data from backend → caches for 60s
2. **Client**: Receives server data as `initialData`
3. **React Query**: Stores data, marks as fresh for 60s

### Navigate Away and Back (Within 60s)

1. **Server**: Returns cached data (no backend call)
2. **Client**: React Query has fresh cached data
3. **Result**: ⚡ Instant load, **no API call**

### Revisit After 60s (But Within 5 Minutes)

1. **Server**: Fetches fresh data from backend
2. **Client**: React Query data is stale, shows cached data immediately
3. **React Query**: Refetches in background, updates UI when ready
4. **Result**: 🎯 Instant display + fresh data

### Revisit After 5 Minutes

1. **Server**: Fetches fresh data from backend
2. **Client**: React Query cache expired
3. **React Query**: Uses server `initialData`, shows loading state briefly
4. **Result**: 🔄 Quick load with server data

## Query Key Strategy

React Query uses the following query key:

```typescript
["clients", page, size, sortBy, sortDir, search, status];
```

**Important:**

- Each unique combination creates a separate cache entry
- Changing pagination/filters = new query = new fetch
- Going back to previous page/filter = cache hit (if fresh)

## Monitoring Cache Behavior

### React Query Devtools

The app includes React Query Devtools (dev mode only):

```typescript
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

<ReactQueryProvider>
  {children}
  <ReactQueryDevtools initialIsOpen={false} />
</ReactQueryProvider>;
```

**To use:**

1. Look for floating React Query icon in bottom-left corner
2. Click to expand and see all queries
3. Check query status: fresh (green), stale (yellow), inactive (gray)
4. View cache data, refetch status, and timing

### Browser DevTools Network Tab

**What you should see:**

- **First load**: API call to `/patients`
- **Immediate return**: No API call (React Query cache hit)
- **Return after 60s**: API call (data was stale)
- **Navigate within same params**: No API call

**What you should NOT see:**

- ❌ API call on every page navigation
- ❌ Duplicate concurrent requests
- ❌ Requests for data you just viewed

## Best Practices

### When to Invalidate Cache

Use `queryClient.invalidateQueries()` only when:

1. **After mutations**: User creates/updates/deletes a client
2. **Manual refresh**: User clicks a "Refresh" button
3. **WebSocket updates**: Real-time data changes from other users

```typescript
// Example: After creating a client
const { mutate } = useMutation({
  mutationFn: createClient,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["clients"] });
  },
});
```

### When NOT to Invalidate

- ❌ On component mount
- ❌ On navigation
- ❌ After a successful query
- ❌ "Just to be safe"

### Adjusting Cache Times

**For frequently changing data:**

```typescript
staleTime: 30 * 1000,  // 30 seconds
```

**For rarely changing data:**

```typescript
staleTime: 5 * 60 * 1000,  // 5 minutes
```

**For real-time data:**

```typescript
staleTime: 0,  // Always refetch
refetchInterval: 5000,  // Poll every 5 seconds
```

## Performance Metrics

### Before Optimization

- Every page load: 1 API call
- Navigation back: 1 API call
- Total requests (5 navigations): 5 calls

### After Optimization

- First load: 1 API call
- Navigation back (within 60s): 0 calls
- Navigation back (after 60s): 1 background call (cached data shown immediately)
- Total requests (5 navigations within 60s): 1 call

**Result: 80% reduction in API calls** 🎉

## Troubleshooting

### "I'm still seeing API calls on every load"

**Check:**

1. Are searchParams changing? (Different page/sort/filter)
2. Is the backend URL correct? (`NEXT_PUBLIC_API_URL`)
3. Are you in dev mode? (Some extra refetching is normal)
4. Check React Query Devtools - is data actually stale?

### "Data is not updating when it should"

**Solutions:**

1. Reduce `staleTime` if data changes frequently
2. Add manual invalidation after mutations
3. Implement optimistic updates for better UX

### "Cache is taking too much memory"

**Solutions:**

1. Reduce `gcTime` (currently 5 minutes)
2. Limit number of pages cached
3. Clear cache on logout/significant state change

## Related Files

- `src/lib/apiClient.ts` - API client with Next.js cache config
- `src/hooks/useClients.ts` - React Query hook with cache settings
- `src/hooks/useApi.ts` - Base React Query wrapper
- `src/providers/ReactQueryProvider.tsx` - Global React Query config
- `src/app/clients/page.tsx` - Server-side data fetching
- `src/app/clients/ClientsClient.tsx` - Client-side data consumption

## Further Reading

- [React Query Caching](https://tanstack.com/query/latest/docs/react/guides/caching)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)
