# Cooking Timer Feature ✅

## Overview

A new cooking timer feature has been added to the "Add Meal" screen that allows users to track cooking time while preparing a recipe.

## Features

- **Start Timer**: Begin tracking cooking time
- **Pause Timer**: Pause the timer (can resume later)
- **Stop/Reset Timer**: Stop the timer and reset to zero
- **Auto-fill**: Automatically fills the "Total Time" field as you cook
- **Visual Feedback**: 
  - Timer display shows elapsed time (HH:MM:SS or MM:SS format)
  - Status indicators (⏱️ Cooking, ⏸️ Paused, ⏹️ Stopped)
  - Timer badge appears on the Total Time input when active

## How to Use

1. Go to "Add Meal" screen
2. Scroll to the "Cooking Timer" section
3. Tap "▶️ Show Cooking Timer"
4. Tap "▶️ Start Timer" when you begin cooking
5. Use "⏸️ Pause" if you need to take a break
6. Tap "▶️ Resume" to continue
7. Tap "⏹️ Stop" when done (automatically saves time to Total Time field)
8. The tracked time will appear in the Total Time field
9. You can clear the tracked time if needed

## Implementation Details

### Components

- **CookingTimer.tsx**: Reusable timer component with start/pause/stop functionality
  - Uses React hooks (useState, useEffect, useRef)
  - Updates every second while running
  - Handles pause/resume correctly
  - Formats time display nicely

### Integration

- Integrated into `AddMealScreen.tsx`
- Timer automatically updates the "Total Time" field
- When timer is active, the Total Time field is read-only (protected from manual edits)
- Timer can be hidden/shown with toggle button
- Tracked time persists until manually cleared

## Code Location

- Component: `mobile/src/components/CookingTimer.tsx`
- Usage: `mobile/src/screens/AddMealScreen.tsx`

## Future Enhancements

- Multiple timer intervals (prep time, cook time separately)
- Timer notifications/alerts
- Save timer history
- Share cooking time with friends

