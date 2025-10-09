# 📅 Calendar Setup Instructions

## DHTMLX Gantt Integration

### Step 1: Copy DHTMLX Gantt Files

After downloading **DHTMLX Gantt Standard/Open Source Edition**, copy the files as follows:

```bash
# From your dhtmlxGantt download, copy the codebase folder:
cp -r /path/to/dhtmlxGantt/codebase /Users/vytvytskyi/Desktop/roomy/public/dhtmlxGantt
```

**Expected structure:**
```
roomy/
└── public/
    └── dhtmlxGantt/
        └── codebase/
            ├── dhtmlxgantt.js
            ├── dhtmlxgantt.css
            ├── dhtmlxgantt.d.ts
            └── (other files)
```

### Step 2: Verify Files

Run this command to verify the files are in place:

```bash
cd /Users/vytvytskyi/Desktop/roomy
ls -la public/dhtmlxGantt/codebase/
```

You should see:
- ✅ `dhtmlxgantt.js`
- ✅ `dhtmlxgantt.css`
- ✅ `dhtmlxgantt.d.ts` (optional TypeScript definitions)

### Step 3: Access Calendar

Once files are copied, the calendar will be available at:
- **http://localhost:3000/calendar**

### Current Implementation

**Calendar Features:**
- ✅ Full-width timeline view
- ✅ Properties as rows (with photos, city, capacity)
- ✅ Reservations as colored bars
- ✅ Color coding by status (Pending, Confirmed, Checked In, etc.)
- ✅ Drag & drop to reschedule
- ✅ Double-click to edit
- ✅ Day/Week/Month views
- ✅ Zoom controls
- ✅ Today marker
- ✅ Weekend highlighting
- ✅ Tooltips with full reservation details
- ✅ Stats bar with counts
- ✅ Group by City/Type/Owner/Agent (coming soon)

**Files Created:**
- `app/calendar/page.tsx` - Main calendar page
- `components/calendar/PropertyCalendar.tsx` - Gantt wrapper component
- `components/calendar/calendar.css` - Custom styles

### Alternative: Manual File Placement

If you prefer, you can also:

1. Download DHTMLX Gantt from: https://dhtmlx.com/docs/products/dhtmlxGantt/
2. Extract the archive
3. Copy the `codebase` folder to `public/dhtmlxGantt/`

### Troubleshooting

**If calendar doesn't load:**
1. Check browser console for errors
2. Verify files are in `public/dhtmlxGantt/codebase/`
3. Check that paths in `PropertyCalendar.tsx` match your folder structure
4. Try hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

**File paths in code:**
- CSS: `/dhtmlxGantt/codebase/dhtmlxgantt.css`
- JS: `/dhtmlxGantt/codebase/dhtmlxgantt.js`

If your folder structure is different, update these paths in:
- `components/calendar/PropertyCalendar.tsx` (lines 75 and 83)

---

**Ready to go!** Once files are copied, refresh the page and enjoy your property booking calendar! 🎉

