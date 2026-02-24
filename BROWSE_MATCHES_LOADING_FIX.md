# Browse Matches Loading Experience Fix

## Problem
When clicking on Browse Matches, there was a 1-4 second delay between:
1. Loader disappearing
2. Actual data showing up

This created a poor user experience with a blank screen.

## Root Cause
React Query's `isLoading` becomes `false` immediately when API response arrives, but:
- Browser still needs time to parse and render the data
- React needs to create virtual DOM and update real DOM
- Images need to start loading
- This causes 1-4 second gap with blank screen

## Solution Implemented

### 1. Keep Previous Data While Fetching (Optimistic UI)
```javascript
placeholderData: (previousData) => previousData
```
- Shows old data immediately while fetching new data
- No blank screen between page loads
- Smooth transition

### 2. Show Skeleton Only When No Data
```javascript
if (isLoading || (isFetching && matches.length === 0)) {
    return <SkeletonLoader />;
}
```
- First load: Shows skeleton
- Subsequent loads: Shows old data + loading indicator
- Never shows blank screen

### 3. Subtle Loading Indicator for Refetch
```javascript
{isFetching && matches.length > 0 && (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-primary text-base-100 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm font-medium">{t('common.loading')}</span>
    </div>
)}
```
- Shows small loading badge at top when refetching
- Doesn't block the UI
- User can still see and interact with old data

## Benefits

### Before:
1. Click Browse Matches
2. See loader (1s)
3. Loader disappears
4. **Blank screen (1-4s)** ❌
5. Data appears

### After:
1. Click Browse Matches (first time)
2. See skeleton loader
3. Data appears immediately ✅

OR

1. Click Browse Matches (subsequent times)
2. See previous data immediately ✅
3. Small loading indicator at top
4. Data updates smoothly

## Technical Details

### React Query Configuration:
- `staleTime: 30000` - Data considered fresh for 30 seconds
- `placeholderData: (previousData) => previousData` - Keep old data while fetching
- `isFetching` - Track background refetch state
- `isLoading` - Track initial load state

### Loading States:
- **isLoading**: True only on first load (no cached data)
- **isFetching**: True whe