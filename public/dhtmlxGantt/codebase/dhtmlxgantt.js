/**
 * DHTMLX Gantt JavaScript Placeholder
 * 
 * IMPORTANT: Replace this file with your actual dhtmlxgantt.js from the DHTMLX Gantt package
 * 
 * This is a minimal placeholder to prevent 404 errors.
 * Copy your dhtmlxgantt.js file to this location.
 */

console.warn('DHTMLX Gantt placeholder loaded. Please replace with actual dhtmlxgantt.js file.');

// Minimal Gantt object to prevent errors
window.gantt = window.gantt || {
  config: {
    lightbox: {
      sections: []
    },
    scales: [],
    columns: [],
    date_format: '%Y-%m-%d',
    xml_date: '%Y-%m-%d',
    scale_height: 90,
    row_height: 44,
    min_column_width: 60,
    grid_width: 350,
    autosize: false,
    fit_tasks: false,
    layout: {
      css: "gantt_container",
      rows: [
        {
          cols: [
            { view: "grid", scrollX: "gridScroll", scrollable: true, scrollY: "scrollVer" },
            { resizer: true, width: 1 },
            { view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer" },
            { view: "scrollbar", id: "scrollVer" }
          ]
        },
        { view: "scrollbar", id: "scrollHor", height: 20 }
      ]
    },
    drag_links: false,
    drag_progress: true,
    drag_resize: true,
    drag_move: true,
    details_on_dblclick: true,
    show_task_cells: true,
    show_grid: true,
    readonly: false,
    work_time: true,
    skip_off_time: false,
    start_date: new Date(),
    end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
  },
  templates: {
    task_class: function() { return ''; },
    task_text: function() { return ''; },
    rightside_text: function() { return ''; },
    timeline_cell_class: function() { return ''; },
    scale_cell_class: function() { return ''; },
    tooltip_text: function() { return ''; },
    task_style: function() { return ''; }
  },
  plugins: function() {},
  init: function() {
    console.log('🎯 DHTMLX Gantt placeholder initialized');
    if (this.config && this.config.container) {
      this.config.container.innerHTML = `
        <div style="
          display: flex; 
          align-items: center; 
          justify-content: center; 
          height: 400px; 
          background: #f8fafc; 
          border: 2px dashed #cbd5e1; 
          border-radius: 8px;
          flex-direction: column;
          gap: 16px;
        ">
          <div style="font-size: 48px;">📅</div>
          <div style="text-align: center;">
            <h3 style="color: #374151; margin: 0 0 8px 0;">DHTMLX Gantt Calendar</h3>
            <p style="color: #6b7280; margin: 0 0 16px 0;">Please copy your DHTMLX Gantt files to:</p>
            <code style="background: #e5e7eb; padding: 8px 12px; border-radius: 4px; font-family: monospace;">
              public/dhtmlxGantt/codebase/
            </code>
          </div>
        </div>
      `;
    }
  },
  parse: function() {
    console.log('📊 DHTMLX Gantt placeholder parse called');
  },
  render: function() {
    console.log('🎨 DHTMLX Gantt placeholder render called');
  },
  addMarker: function() {},
  attachEvent: function() {},
  getTask: function() { return null; },
  date: {
    date_to_str: function() { return function() { return ''; }; }
  },
  addCalendar: function() {},
  createDataProcessor: function() {},
  destructor: function() {},
  showDate: function() {},
  scrollDetached: function() {}
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.gantt;
}

console.log('DHTMLX Gantt placeholder initialized. Please replace with actual files.');
