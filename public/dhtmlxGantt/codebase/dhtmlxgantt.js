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
  config: {},
  templates: {},
  plugins: function() {},
  init: function() {},
  parse: function() {},
  render: function() {},
  addMarker: function() {},
  attachEvent: function() {},
  getTask: function() {},
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
