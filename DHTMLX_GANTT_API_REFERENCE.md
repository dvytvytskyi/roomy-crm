# 📚 DHTMLX Gantt API Reference - Quick Guide

## 🎯 Core Methods

### Data Management
- `gantt.parse(data)` - Load data from client-side resource
- `gantt.load(url)` - Load data from external data source
- `gantt.serialize()` - Serialize data into JSON or XML format
- `gantt.clearAll()` - Remove all tasks and additional elements
- `gantt.refreshData()` - Refresh data in the Gantt chart
- `gantt.batchUpdate(callback)` - Update multiple tasks/links at once

### Task Operations
- `gantt.addTask(task, parent?, index?)` - Add a new task
- `gantt.getTask(id)` - Get task object by id
- `gantt.updateTask(id)` - Update the specified task
- `gantt.deleteTask(id)` - Delete the specified task
- `gantt.isTaskExists(id)` - Check whether task exists
- `gantt.getTaskByTime(start_date?, end_date?)` - Get tasks in time range
- `gantt.eachTask(callback, parent?)` - Iterate over all child tasks
- `gantt.eachParent(callback, id)` - Iterate over all parent tasks

### Link Operations
- `gantt.addLink(link)` - Add a new dependency link
- `gantt.getLink(id)` - Get link object by id
- `gantt.updateLink(id)` - Update the specified link
- `gantt.deleteLink(id)` - Delete the specified link
- `gantt.isLinkAllowed(from, to, type)` - Check if link is valid
- `gantt.getLinks()` - Get all links

### Display & Navigation
- `gantt.showTask(id)` - Make specified task visible
- `gantt.showDate(date)` - Scroll to make specified date visible
- `gantt.scrollTo(x, y)` - Scroll container to position
- `gantt.render()` - Render the whole Gantt chart
- `gantt.setSizes()` - Resize the Gantt chart

### Calendar & Work Time
- `gantt.createCalendar(config)` - Create a working calendar
- `gantt.addCalendar(calendar)` - Add a calendar into Gantt
- `gantt.getCalendar(id)` - Get worktime calendar by id
- `gantt.deleteCalendar(id)` - Delete a task calendar by its id
- `gantt.isWorkTime(date, unit?, task?)` - Check if date is working time
- `gantt.setWorkTime(config)` - Set working time for Gantt
- `gantt.getClosestWorkTime(config)` - Get closest working time

### Date Calculations
- `gantt.calculateDuration(start, end, task?)` - Calculate task duration
- `gantt.calculateEndDate(start, duration, unit?, task?)` - Calculate end date
- `gantt.roundDate(date)` - Round date to nearest scale mark
- `gantt.correctTaskWorkTime(task)` - Recalculate task duration in work time

### View & Layout
- `gantt.init(container)` - Initialize dhtmlxGantt inside container
- `gantt.destructor()` - Destroy the gantt instance
- `gantt.resetLayout()` - Rebuild Gantt layout
- `gantt.getLayoutView(name)` - Get layout view object by name
- `gantt.expand()` - Expand to full screen mode
- `gantt.collapse()` - Exit full screen mode

### Tree Operations
- `gantt.open(id)` - Open branch with specified id
- `gantt.close(id)` - Close branch with specified id
- `gantt.getChildren(id)` - Get 1st-level child tasks
- `gantt.hasChild(id)` - Check if task has children
- `gantt.getParent(id)` - Get id of parent task
- `gantt.isChildOf(child_id, parent_id)` - Check if task is child of another

### Selection
- `gantt.selectTask(id)` - Select specified task
- `gantt.unselectTask(id?)` - Remove selection from task
- `gantt.getSelectedId()` - Get id of selected task
- `gantt.getSelectedTasks()` - Get array of selected tasks
- `gantt.isSelectedTask(id)` - Check if task is selected

### Lightbox (Edit Form)
- `gantt.showLightbox(id)` - Open lightbox for specified task
- `gantt.hideLightbox()` - Close lightbox if active
- `gantt.getLightbox()` - Get lightbox's HTML element
- `gantt.resetLightbox()` - Remove current lightbox HTML element
- `gantt.getLightboxValues()` - Get values of lightbox sections
- `gantt.setLightboxValues(values)` - Set values in lightbox

### Markers
- `gantt.addMarker(marker)` - Add marker to timeline
- `gantt.getMarker(id)` - Get marker object
- `gantt.updateMarker(id)` - Update specified marker
- `gantt.deleteMarker(id)` - Delete specified marker
- `gantt.renderMarkers()` - Update all markers on page

### Auto-scheduling
- `gantt.autoSchedule(id?)` - Recalculate project schedule
- `gantt.isCriticalTask(task)` - Check if task is critical
- `gantt.isCriticalLink(link)` - Check if link is critical
- `gantt.findCycles()` - Find all dependency loops

### Undo/Redo
- `gantt.undo()` - Revert changes to gantt
- `gantt.redo()` - Apply reverted changes again
- `gantt.getUndoStack()` - Get stack of undo actions
- `gantt.getRedoStack()` - Get stack of redo actions
- `gantt.clearUndoStack()` - Clear undo stack
- `gantt.clearRedoStack()` - Clear redo stack

### Export
- `gantt.exportToPDF(config?)` - Export to PDF
- `gantt.exportToPNG(config?)` - Export to PNG
- `gantt.exportToExcel(config?)` - Export to Excel
- `gantt.exportToMSProject(config?)` - Export to MS Project
- `gantt.exportToJSON()` - Export to JSON object
- `gantt.exportToICal()` - Export to iCal string

### Import
- `gantt.importFromExcel(config)` - Import from Excel
- `gantt.importFromMSProject(config)` - Import from MS Project
- `gantt.importFromPrimaveraP6(config)` - Import from Primavera P6

### Events
- `gantt.attachEvent(name, handler)` - Attach event handler
- `gantt.detachEvent(id)` - Detach event handler
- `gantt.detachAllEvents()` - Detach all events
- `gantt.callEvent(name, params)` - Call an inner event
- `gantt.checkEvent(name)` - Check if event has handlers

### Utilities
- `gantt.uid()` - Generate unique id
- `gantt.copy(object)` - Create deep copy of object
- `gantt.defined(value)` - Check if value is defined
- `gantt.message(config)` - Show message box
- `gantt.alert(config)` - Show alert box
- `gantt.confirm(config)` - Show confirm box

---

## 🎨 Key Templates

### Task Display
- `gantt.templates.task_text(start, end, task)` - Text in task bars
- `gantt.templates.task_class(start, end, task)` - CSS class for tasks
- `gantt.templates.task_style(start, end, task)` - Inline styles for tasks
- `gantt.templates.rightside_text(start, end, task)` - Text on right side
- `gantt.templates.leftside_text(start, end, task)` - Text on left side

### Grid
- `gantt.templates.grid_row_class(start, end, task)` - CSS class for grid rows
- `gantt.templates.grid_header_class(columnName, column)` - CSS for grid headers
- `gantt.templates.grid_blank(task)` - Content before child items

### Timeline
- `gantt.templates.timeline_cell_class(task, date)` - CSS class for timeline cells
- `gantt.templates.timeline_cell_content(task, date)` - Custom HTML in timeline cells
- `gantt.templates.scale_cell_class(date)` - CSS class for scale cells

### Tooltip
- `gantt.templates.tooltip_text(start, end, task)` - Tooltip content

### Dates
- `gantt.templates.date_grid(date)` - Date format in grid
- `gantt.templates.date_scale(date)` - Date format in time scale
- `gantt.templates.task_date(date)` - Date format in lightbox

---

## ⚙️ Key Config Options

### View Configuration
- `gantt.config.scales` - Array of time scale configurations
- `gantt.config.columns` - Array of grid column configurations
- `gantt.config.row_height` - Height of grid rows (default: 30)
- `gantt.config.scale_height` - Height of time scale (default: 50)
- `gantt.config.bar_height` - Height of task bars

### Behavior
- `gantt.config.drag_move` - Enable drag to move tasks (default: true)
- `gantt.config.drag_resize` - Enable drag to resize tasks (default: true)
- `gantt.config.drag_progress` - Enable drag progress (default: true)
- `gantt.config.drag_links` - Enable creating links by drag (default: true)
- `gantt.config.details_on_dblclick` - Open lightbox on double-click (default: true)

### Work Time
- `gantt.config.work_time` - Enable work time calculations (default: false)
- `gantt.config.skip_off_time` - Hide non-working time (default: false)
- `gantt.config.correct_work_time` - Adjust dates to work time (default: false)

### Display
- `gantt.config.show_grid` - Show grid area (default: true)
- `gantt.config.show_chart` - Show timeline area (default: true)
- `gantt.config.show_links` - Show dependency links (default: true)
- `gantt.config.show_progress` - Show progress in task bars (default: true)
- `gantt.config.show_task_cells` - Show cell borders in timeline (default: true)

### Selection
- `gantt.config.select_task` - Enable task selection (default: true)
- `gantt.config.multiselect` - Enable multi-task selection (default: false)

---

## 🎪 Key Events

### Task Events
- `onTaskClick(id, e)` - User clicks on task
- `onTaskDblClick(id, e)` - User double-clicks on task
- `onTaskSelected(id)` - Task is selected
- `onBeforeTaskAdd(id, task)` - Before task is added
- `onAfterTaskAdd(id, task)` - After task is added
- `onBeforeTaskUpdate(id, task)` - Before task is updated
- `onAfterTaskUpdate(id, task)` - After task is updated
- `onBeforeTaskDelete(id, task)` - Before task is deleted
- `onAfterTaskDelete(id, task)` - After task is deleted
- `onBeforeTaskDrag(id, mode, e)` - Before task drag starts
- `onTaskDrag(id, mode, task, original)` - While task is dragged
- `onAfterTaskDrag(id, mode, e)` - After task drag ends

### Link Events
- `onLinkClick(id, e)` - User clicks on link
- `onLinkDblClick(id, e)` - User double-clicks on link
- `onBeforeLinkAdd(id, link)` - Before link is added
- `onAfterLinkAdd(id, link)` - After link is added
- `onBeforeLinkUpdate(id, link)` - Before link is updated
- `onAfterLinkUpdate(id, link)` - After link is updated
- `onBeforeLinkDelete(id, link)` - Before link is deleted
- `onAfterLinkDelete(id, link)` - After link is deleted

### Lightbox Events
- `onBeforeLightbox(id)` - Before lightbox opens
- `onLightbox(id)` - After lightbox opens
- `onAfterLightbox()` - After lightbox closes
- `onLightboxSave(id, task, is_new)` - User clicks Save in lightbox
- `onLightboxCancel(id)` - User clicks Cancel in lightbox
- `onLightboxDelete(id)` - User clicks Delete in lightbox

### Render Events
- `onGanttReady()` - After Gantt initialization
- `onGanttRender()` - After Gantt is rendered
- `onDataRender()` - After data is rendered
- `onBeforeGanttRender()` - Before Gantt is rendered

---

## 💡 Common Use Cases

### Initialize Gantt
```javascript
gantt.init(container)
gantt.parse({ data: tasks, links: links })
```

### Load Data from API
```javascript
gantt.load('/api/data')
```

### Add Task Programmatically
```javascript
gantt.addTask({
  id: gantt.uid(),
  text: 'New Task',
  start_date: '2025-01-01',
  duration: 3
})
```

### Update Task
```javascript
const task = gantt.getTask(id)
task.text = 'Updated Name'
gantt.updateTask(id)
```

### Attach Event Handler
```javascript
gantt.attachEvent('onTaskClick', function(id, e) {
  console.log('Task clicked:', id)
  return true
})
```

### Configure Timeline Scale
```javascript
gantt.config.scales = [
  { unit: 'month', step: 1, format: '%F %Y' },
  { unit: 'day', step: 1, format: '%d' }
]
```

### Add Today Marker
```javascript
gantt.addMarker({
  start_date: new Date(),
  css: 'today',
  text: 'Today'
})
```

### Custom Task Template
```javascript
gantt.templates.task_text = function(start, end, task) {
  return task.text + ' (' + task.duration + 'd)'
}
```

### Custom Tooltip
```javascript
gantt.templates.tooltip_text = function(start, end, task) {
  return '<b>' + task.text + '</b><br/>' +
         'Start: ' + gantt.templates.tooltip_date_format(start) + '<br/>' +
         'End: ' + gantt.templates.tooltip_date_format(end)
}
```

### Enable Plugins
```javascript
gantt.plugins({
  tooltip: true,
  marker: true,
  fullscreen: true,
  auto_scheduling: true,
  keyboard_navigation: true,
  quick_info: true,
  undo: true
})
```

### Zoom Controls
```javascript
gantt.ext.zoom.init({
  levels: [
    { name: 'day', scales: [...] },
    { name: 'week', scales: [...] },
    { name: 'month', scales: [...] }
  ]
})
gantt.ext.zoom.setLevel('day')
```

---

## 📋 Full Methods List

### Methods (Alphabetical)

**A**
- addCalendar, addLink, addLinkLayer, addMarker, addShortcut, addTask, addTaskLayer
- adjustTaskHeightForBaselines, alert, assert, attachEvent, autoSchedule

**B**
- batchUpdate, bind

**C**
- calculateDuration, calculateEndDate, calculateTaskLevel, callEvent
- changeLightboxType, changeLinkId, changeTaskId, checkEvent
- clearAll, clearRedoStack, clearUndoStack, close, collapse, columnIndexByDate
- confirm, copy, correctTaskWorkTime, createCalendar, createDataProcessor
- createDatastore, createTask

**D**
- dataProcessor, dateFromPos, defined, deleteCalendar, deleteLink
- deleteMarker, deleteTask, destructor, detachAllEvents, detachEvent

**E**
- eachParent, eachSelectedTask, eachTask, event, eventRemove
- expand, exportToExcel, exportToICal, exportToJSON, exportToMSProject
- exportToPDF, exportToPNG, exportToPrimaveraP6

**F**
- findCycles, focus

**G**
- getCalendar, getCalendars, getChildren, getClosestWorkTime, getColumnIndex
- getConnectedGroup, getConstraintLimitations, getConstraintType, getDatastore
- getFreeSlack, getGlobalTaskIndex, getGridColumn, getGridColumns, getLabel
- getLastSelectedTask, getLayoutView, getLightbox, getLightboxSection
- getLightboxType, getLightboxValues, getLink, getLinkCount, getLinkNode
- getLinks, getMarker, getNext, getNextSibling, getParent, getPrev
- getPrevSibling, getRedoStack, getResourceAssignments, getResourceCalendar
- getScale, getScrollState, getSelectedId, getSelectedTasks, getShortcutHandler
- getSiblings, getSlack, getState, getSubtaskDates, getSubtaskDuration
- getTask, getTaskAssignments, getTaskBarHeight, getTaskBaselines, getTaskBy
- getTaskByIndex, getTaskByTime, getTaskByWBSCode, getTaskCalendar
- getTaskCount, getTaskHeight, getTaskIndex, getTaskNode, getTaskPosition
- getTaskResources, getTaskRowNode, getTaskTop, getTaskType, getTotalSlack
- getUndoStack, getVisibleTaskCount, getWBSCode, getWorkHours, groupBy

**H**
- hasChild, hideCover, hideLightbox, hideQuickInfo

**I**
- importFromExcel, importFromMSProject, importFromPrimaveraP6, init
- isChildOf, isCircularLink, isCriticalLink, isCriticalTask, isLinkAllowed
- isLinkExists, isReadonly, isSelectedTask, isSplitTask, isSummaryTask
- isTaskExists, isTaskVisible, isUnscheduledTask, isWorkTime

**L**
- load, locate

**M**
- mergeCalendars, message, mixin, modalbox, moveTask

**O**
- open

**P**
- parse, plugins, posFromDate

**R**
- redo, refreshData, refreshLink, refreshTask, removeLinkLayer
- removeShortcut, removeTaskLayer, render, renderMarkers, resetLayout
- resetLightbox, resetProjectDates, resetSkin, resizeLightbox, roundDate
- roundTaskDates

**S**
- scrollLayoutCell, scrollTo, selectTask, serialize, serverList
- setParent, setSizes, setSkin, setWorkTime, showCover, showDate
- showLightbox, showQuickInfo, showTask, silent, sort

**T**
- toggleTaskSelection

**U**
- uid, undo, unselectTask, unsetWorkTime, updateCollection
- updateLink, updateMarker, updateTask, updateTaskAssignments

---

## 📝 Notes for Implementation

This API reference is ready for our Property Calendar implementation in:
- `app/calendar/page.tsx`
- `components/calendar/PropertyCalendar.tsx`

We can use any of these methods to extend functionality as needed.

---

**Version:** DHTMLX Gantt Standard/Open Source Edition  
**Documentation:** https://docs.dhtmlx.com/gantt/  
**License:** GPL v2 or Commercial

