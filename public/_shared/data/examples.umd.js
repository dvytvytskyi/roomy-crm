

const examples = {
  'Power demos': {
    items: [{
      folder: 'backlog',
      group: 'Power demos',
      title: 'Locking backlog events at the top of the view',
      since: '6.0.0'
    }, {
      folder: 'bigdataset',
      title: 'Big data set',
      updated: '5.2.5'
    }, {
      folder: 'bigdataset-tree',
      title: 'Big data set tree',
      since: '4.3.1'
    }, {
      folder: 'bigdataset-vertical',
      title: 'Big data set vertical',
      since: '2.2',
      updated: '6.1.6'
    }, {
      folder: 'booking',
      title: 'Property booking',
      since: '5.2.0',
      updated: '6.0.5'
    }, {
      folder: 'infinite-scroll',
      title: 'Infinite scroll',
      since: '6.0.0'
    }, {
      folder: 'infinite-scroll-tree',
      title: 'Infinite scroll tree',
      since: '6.2.4'
    }, {
      folder: 'nestedevents',
      title: 'Nested events',
      updated: '6.0'
    }, {
      folder: 'paged',
      title: 'Paged Scheduler',
      since: '6.1.0'
    }, {
      folder: 'partners',
      title: 'Partnered Schedulers',
      updated: '2.3'
    }, {
      folder: 'stress',
      title: 'Stress test',
      since: '4.1'
    }, {
      folder: 'tasks',
      title: 'Tasks application'
    }, {
      folder: 'timeaxis',
      title: 'Non-continuous time axis',
      since: '2.0',
      updated: '5.3.3'
    }, {
      folder: 'timelinehistogram',
      title: 'Rows with histograms',
      since: '5.4.0'
    }, {
      folder: 'websockets',
      title: 'WebSockets online',
      build: true,
      since: '2.0'
    }]
  },
  'Drag & drop': {
    items: [{
      folder: 'drag-between-schedulers',
      title: 'Drag drop tasks between different Scheduler instances',
      updated: '5.4'
    }, {
      folder: 'dragfromgrid',
      title: 'Drag drop from a grid',
      updated: '4.2.0'
    }, {
      folder: 'drag-from-grid-custom',
      title: 'Customized drag drop from a grid',
      since: '5.4.0'
    }, {
      folder: 'drag-from-grid-to-tree',
      title: 'Drag drop from a grid to a tree',
      since: '5.3.5'
    }, {
      folder: 'drag-from-list',
      title: 'Drag drop objects from a list',
      since: '5.0'
    }, {
      folder: 'drag-from-tree',
      title: 'Drag drop from a tree',
      since: '5.0',
      updated: '6.2.3'
    }, {
      folder: 'drag-onto-tasks',
      title: 'Drag drop objects onto tasks',
      updated: '5.6.3'
    }, {
      folder: 'drag-outside',
      title: 'Drag events out of the scheduler',
      since: '5.0'
    }]
  },
  Charts: {
    items: [{
      folder: 'charts',
      title: 'Chart designer',
      since: '6.3.0'
    }, {
      folder: 'sparklines',
      title: 'Sparklines',
      since: '6.3.0'
    }, {
      folder: 'scheduler-chart',
      title: 'Scheduler with chart',
      since: '6.3.0'
    }]
  },
  Basics: {
    items: [{
      folder: 'basic',
      title: 'Basic'
    }, {
      folder: 'configuration',
      title: 'Configuration',
      updated: '5.2.0'
    }, {
      folder: 'columns',
      title: 'Columns',
      since: '2.0',
      updated: '5.6.7'
    }, {
      folder: 'rowheight',
      title: 'Row height',
      updated: '5.6.0'
    }, {
      folder: 'scrollto',
      title: 'Scrolling'
    }, {
      folder: 'timeresolution',
      title: 'Time resolution',
      updated: '6.0.5'
    }, {
      folder: 'state',
      title: 'Saving UI state',
      since: '5.3.3'
    }]
  },
  'Event layout & styling': {
    items: [{
      folder: 'animations',
      title: 'Animations'
    }, {
      folder: 'customeventstyling',
      title: 'Custom event styling',
      updated: '4.3.4'
    }, {
      folder: 'rough',
      title: 'Custom styling with Rough.js',
      since: '2.0'
    }, {
      folder: 'custom-theme',
      title: 'Custom theme',
      updated: '6.1.3'
    }, {
      folder: 'layouts',
      title: 'Event layouts',
      updated: '6.3.2'
    }, {
      folder: 'eventstyles',
      title: 'Event styles',
      updated: '4.0.0'
    }, {
      folder: 'milestonelayout',
      title: 'Milestone layout',
      updated: '6.0.0'
    }, {
      folder: 'icons',
      title: 'Milestone icons',
      updated: '5.6.2'
    }]
  },
  Features: {
    items: [{
      folder: 'collapsible-columns',
      title: 'Collapsible columns',
      since: '5.2.0'
    }, {
      folder: 'dragselection',
      title: 'Drag drop selection mode',
      since: '2.0',
      updated: '6.2.5'
    }, {
      folder: 'dependencies',
      title: 'Dependencies',
      updated: '6.2.5'
    }, {
      folder: 'vertical-dependencies',
      title: 'Dependencies in vertical mode',
      since: '5.1.0'
    }, {
      folder: 'fieldfilters',
      title: 'Advanced filtering',
      since: '5.5.3',
      updated: '6.1.8'
    }, {
      folder: 'fillticks',
      title: 'Fill ticks',
      updated: '6.0.5'
    }, {
      folder: 'filtering',
      title: 'Filtering',
      updated: '6.2.0'
    }, {
      folder: 'grouping',
      title: 'Grouping'
    }, {
      folder: 'groupsummary',
      title: 'Group summary',
      updated: '5.6.10'
    }, {
      folder: 'infinite-timeline-scroll',
      title: 'Infinite timeline scrolling',
      since: '4.2.0'
    }, {
      folder: 'labels',
      title: 'Labels',
      updated: '4.1'
    }, {
      folder: 'merge-cells',
      title: 'Merge cells',
      since: '4.3.0'
    }, {
      folder: 'multiassign',
      title: 'Multi assignment'
    }, {
      folder: 'multiassign-resourceids',
      title: 'Multi assignment using resourceIds',
      since: '5.3.8'
    }, {
      folder: 'multiassign-with-dependencies',
      title: 'Multi assignment + dependencies',
      since: '2.0'
    }, {
      folder: 'multisummary',
      title: 'Multi summary'
    }, {
      folder: 'nonworkingdays',
      title: 'Non-working days',
      updated: '6.0.0'
    }, {
      folder: 'recurrence',
      title: 'Recurring events',
      since: '2.3'
    }, {
      folder: 'recurringtimeranges',
      title: 'Recurring time ranges',
      since: '3.0.3',
      updated: '5.6.9'
    }, {
      folder: 'resource-collapsing',
      title: 'Resource collapsing',
      since: '4.1.5'
    }, {
      folder: 'resourcetimeranges',
      title: 'Resource time ranges',
      since: '1.2',
      updated: '5.6.0'
    }, {
      folder: 'responsive',
      title: 'Responsive'
    }, {
      folder: 'scroll-buttons',
      title: 'Scroll Buttons demo',
      since: '6.0.0'
    }, {
      folder: 'simpleeditor',
      title: 'Simple event editor',
      since: '2.0'
    }, {
      folder: 'schedule-context',
      title: 'Schedule hover widgets',
      since: '6.0.0'
    }, {
      folder: 'schedule-context-advanced',
      title: 'Complex schedule hover widgets',
      since: '6.0.0'
    }, {
      folder: 'split',
      title: 'Splitting the Scheduler',
      since: '5.5'
    }, {
      folder: 'summary',
      title: 'Summary',
      updated: '6.0.4'
    }, {
      folder: 'header-summary',
      title: 'Summary shown in time axis header',
      since: '5.6.7',
      updated: '5.6.8'
    }, {
      folder: 'histogramsummary',
      title: 'Summary with histogram'
    }, {
      folder: 'timeranges',
      title: 'Time ranges',
      updated: '5.5.1'
    }, {
      folder: 'timezone',
      title: 'Time zone support',
      since: '5.3.0',
      updated: '5.6.11'
    }, {
      folder: 'time-selection',
      title: 'Time selection',
      since: '5.2',
      updated: '6.0.5'
    }, {
      folder: 'tree',
      title: 'Tree'
    }, {
      folder: 'tree-summary',
      title: 'Tree summary',
      since: '6.2.0'
    }, {
      folder: 'tree-summary-custom',
      title: 'Tree summary custom',
      since: '6.2.0'
    }, {
      folder: 'tree-grouping',
      title: 'Tree grouping',
      since: '5.2'
    }, {
      folder: 'undoredo',
      title: 'Undo/Redo'
    }, {
      folder: 'vertical',
      title: 'Vertical mode',
      since: '2.2',
      updated: '5.3.0'
    }, {
      folder: 'vertical-resource-widths',
      title: 'Vertical mode with variable column widths',
      since: '5.0.2'
    }, {
      folder: 'workingtime',
      title: 'Working hours & days',
      since: '2.0'
    }, {
      folder: 'multi-groups',
      title: 'Resources with multi-group membership',
      since: '5.6.0'
    }, {
      folder: 'multi-treegroups',
      title: 'Resources with multi-TreeGroup membership',
      since: '5.6.0'
    }, {
      folder: 'lock-rows',
      title: 'Locking resources at top of view',
      since: '6.0.0',
      updated: '6.1.8'
    }]
  },
  Customization: {
    items: [{
      folder: 'custom-event-rendering',
      title: 'Customized event rendering',
      since: '5.5'
    }, {
      folder: 'airport',
      title: 'Custom rendering for airport scheduling',
      since: '5.5',
      updated: '6.0.5'
    }, {
      folder: 'docked-editor',
      title: 'Docked event editor',
      since: '5.2.9'
    }, {
      folder: 'eventeditor',
      title: 'Event editor customization',
      updated: '5.4'
    }, {
      folder: 'eventeditor-combos',
      title: 'Event editor with cascading combos'
    }, {
      folder: 'eventeditor-tinymce',
      title: 'Rich text editor',
      since: '6.3.0'
    }, {
      folder: 'eventmenu',
      title: 'Event menu customization',
      since: '1.2',
      updated: '4.1.6'
    }, {
      folder: 'layers',
      title: 'Customizing layers',
      since: '5.6.0',
      updated: '6.0.0'
    }, {
      folder: 'localization',
      title: 'Localization',
      updated: '6.1.8'
    }, {
      folder: 'tooltips',
      title: 'Tooltip customization',
      updated: '5.6.9'
    }, {
      folder: 'custom-event-buttons',
      title: 'Shows custom buttons inside the event bars',
      since: '5.5',
      updated: '6.0.5'
    }, {
      folder: 'custom-event-editor',
      title: 'Replace the event editor',
      since: '4.0',
      updated: '4.2.0'
    }, {
      folder: 'custom-eventmenu',
      title: 'Replace the event menu',
      since: '4.0'
    }, {
      folder: 'validation',
      title: 'Validation when dragging, creating or resizing tasks',
      updated: '6.0.0'
    }]
  },
  Export: {
    items: [{
      folder: 'export',
      title: 'Export to PDF/PNG',
      since: '3.0',
      updated: '6.3.0'
    }, {
      folder: 'print',
      title: 'Print',
      since: '5.6.0'
    }, {
      folder: 'exporttoexcel',
      title: 'Export to Excel'
    }, {
      folder: 'exporttoics',
      title: 'Export to ICS',
      since: '4.0'
    }, {
      folder: 'test-case',
      title: 'Extracting a test case',
      since: '5.0'
    }]
  },
  Integration: {
    items: [{
      folder: 'crudmanager',
      title: 'Backend in PHP + CrudManager',
      overlay: 'php',
      offline: true,
      updated: '6.0.0'
    }, {
      folder: 'csp',
      title: 'Content-Security-Policy (CSP)'
    }, {
      folder: 'esmodule',
      title: 'Include using EcmaScript module'
    }, {
      folder: 'extjsclassic',
      title: 'ExtJS Classic App integration',
      overlay: 'extjs',
      version: 'ExtJS 7.4.0',
      since: '6.3.2'
    }, {
      folder: 'extjsmodern',
      title: 'ExtJS Modern App integration',
      overlay: 'extjs',
      version: 'ExtJS 7.4.0',
      updated: '6.3.2'
    }, {
      folder: 'php',
      title: 'Backend in PHP',
      overlay: 'php'
    }, {
      folder: 'salesforce',
      title: 'Integrate with Salesforce Lightning',
      globalUrl: 'https://bryntum-dev-ed.develop.lightning.force.com/lightning/n/BryntumScheduler',
      since: '4.0',
      updated: '5.4.1',
      overlay: 'salesforce'
    }, {
      folder: 'scripttag',
      title: 'Include using script tag'
    }, {
      folder: 'webcomponents',
      title: 'Use as web component'
    }, {
      folder: 'frameworks/aspnet',
      title: 'ASP.NET',
      overlay: 'dotnet',
      offline: true,
      since: '3.1.0'
    }, {
      folder: 'frameworks/aspnetcore',
      title: 'ASP.NET Core',
      overlay: 'dotnet',
      offline: true,
      since: '3.1.0'
    }, {
      folder: 'frameworks/ionic/ionic-4',
      title: 'Integrate with Ionic',
      build: true,
      overlay: 'ionic',
      version: 'Ionic 5 + Angular 10 + TypeScript 3',
      since: '1.2.1'
    }, {
      folder: 'frameworks/ionic/themes',
      title: 'Themes with Ionic',
      build: true,
      overlay: 'ionic',
      version: 'Ionic 5 + Angular 10 + TypeScript 3',
      since: '3.0',
      updated: '5.3.3'
    }, {
      folder: 'frameworks/webpack/basic',
      title: 'Custom build using WebPack',
      overlay: 'webpack',
      version: 'WebPack 5',
      since: '2.3',
      updated: '6.1.4',
      offline: true
    }, {
      folder: 'frameworks/webpack/basic-thin',
      title: 'Custom thin build using WebPack',
      overlay: 'webpack',
      version: 'WebPack 5',
      since: '6.1.4'
    }]
  },
  'Angular examples': {
    overlay: 'angular',
    tab: 'angular',
    build: true,
    items: [{
      folder: 'frameworks/angular/advanced',
      title: 'Angular Routing + NgRx',
      version: 'Angular 13 + TypeScript 4',
      since: '2.0',
      updated: '6.0.0'
    }, {
      folder: 'frameworks/angular/angular-11-routing',
      title: 'Angular 11 Routing',
      version: 'Angular 11 + TypeScript 4',
      since: '4.1.1',
      updated: '6.0.0'
    }, {
      folder: 'frameworks/angular/animations',
      title: 'Animations',
      version: 'Angular 17 + TypeScript 5',
      since: '2.0',
      updated: '6.0.0'
    }, {
      folder: 'frameworks/angular/basic',
      title: 'Basic setup',
      version: 'Angular 17 + TypeScript 5',
      since: '2.0',
      updated: '6.0.0'
    }, {
      folder: 'frameworks/angular/basic-thin',
      title: 'Basic thin setup',
      version: 'Angular 17 + TypeScript 5',
      since: '6.1.4'
    }, {
      folder: 'frameworks/angular/booking',
      title: 'Property booking',
      version: 'Angular 16 + TypeScript 4',
      since: '5.6.3',
      updated: '6.0.5'
    }, {
      folder: 'frameworks/angular/columns',
      title: 'Columns',
      version: 'Angular 13 + TypeScript 4',
      since: '5.1',
      updated: '6.0.0'
    }, {
      folder: 'frameworks/angular/custom-event-editor',
      title: 'Custom event editor',
      version: 'Angular 13 + TypeScript 4',
      since: '2.2.5',
      updated: '6.0.0'
    }, {
      folder: 'frameworks/angular/dependencies',
      title: 'Dependencies',
      version: 'Angular 15 + TypeScript 4',
      since: '2.0',
      updated: '6.0.0'
    }, {
      folder: 'frameworks/angular/drag-between-schedulers',
      title: 'Drag between schedulers',
      version: 'Angular 15 + TypeScript 4',
      since: '2.0',
      updated: '6.0.0'
    }, {
      folder: 'frameworks/angular/drag-from-grid',
      title: 'Drag tasks from grid',
      version: 'Angular 18 + TypeScript 5',
      since: '2.0',
      updated: '6.1.6'
    }, {
      folder: 'frameworks/angular/drag-onto-tasks',
      title: 'Drop equipment onto tasks',
      version: 'Angular 15 + TypeScript 4',
      since: '2.0',
      updated: '6.0.0'
    }, {
      folder: 'frameworks/angular/eventeditor-combos',
      title: 'Event Editor with Cascading Combos',
      version: 'Angular 19 + TypeScript 5',
      since: '6.3.1'
    }, {
      folder: 'frameworks/angular/filtering',
      title: 'Filtering',
      version: 'Angular 15 + TypeScript 4',
      since: '2.0',
      updated: '6.1.1.'
    }, {
      folder: 'frameworks/angular/infinite-scroll-tree',
      title: 'Infinite scroll tree',
      version: 'Angular 20 + TypeScript 5',
      since: '6.2.5'
    }, {
      folder: 'frameworks/angular/localization',
      title: 'Localization',
      version: 'Angular 15 + TypeScript 4',
      since: '2.0',
      updated: '6.0.0'
    }, {
      folder: 'frameworks/angular/pdf-export',
      title: 'PDF export (offline)',
      version: 'Angular 15 + TypeScript 4',
      since: '3.0',
      offline: true,
      updated: '6.0.0'
    }, {
      folder: 'frameworks/angular/recurring-events',
      title: 'Recurring events',
      version: 'Angular 15 + TypeScript 4',
      since: '3.1',
      updated: '6.0.0'
    }, {
      folder: 'frameworks/angular/recurring-timeranges',
      title: 'Recurring timeranges',
      version: 'Angular 13 + TypeScript 4',
      since: '4.3.4',
      updated: '6.0.0'
    }, {
      folder: 'frameworks/angular/simpleeditor',
      title: 'Simple editor',
      version: 'Angular 13 + TypeScript 4',
      since: '5.1',
      updated: '6.0.0'
    }, {
      folder: 'frameworks/angular/tasks',
      title: 'Tasks',
      version: 'Angular 15 + TypeScript 4',
      since: '2.0',
      updated: '6.0.0'
    }, {
      folder: 'frameworks/angular/timelinehistogram',
      title: 'Timeline histogram',
      version: 'Angular 16 + TypeScript 4',
      since: '5.6.4',
      updated: '6.0.0'
    }]
  },
  'React + Vite examples': {
    overlay: 'react',
    tab: 'react',
    build: true,
    items: [{
      folder: 'frameworks/react-vite/basic',
      title: 'Basic setup',
      version: 'React 18 + Vite 5 + TypeScript 5',
      since: '6.1.2'
    }, {
      folder: 'frameworks/react-vite/basic-thin',
      title: 'Basic thin setup',
      version: 'React 18 + Vite 5 + TypeScript 5',
      since: '6.1.3'
    }, {
      folder: 'frameworks/react-vite/bigdataset',
      title: 'Big dataset with React JSX events rendering',
      version: 'React 18 + Vite 4 + TypeScript 4',
      since: '5.5.3'
    }, {
      folder: 'frameworks/react-vite/booking',
      title: 'Property booking',
      version: 'React 18 + Vite 5 + TypeScript 5',
      since: '6.0.0',
      updated: '6.0.5'
    }, {
      folder: 'frameworks/react-vite/drag-from-grid',
      title: 'Drag from grid demo',
      version: 'React 18 + Vite 5 + TypeScript 5',
      since: '2.0',
      updated: '6.1.8'
    }, {
      folder: 'frameworks/react-vite/eventeditor-combos',
      title: 'Event Editor Combos',
      version: 'React 19 + Vite 6 + TypeScript 5',
      since: '6.2.4'
    }, {
      folder: 'frameworks/react-vite/infinite-scroll-tree',
      title: 'Infinite scroll tree',
      version: 'React 19 + Vite 7 + TypeScript 5',
      since: '6.2.5'
    }, {
      folder: 'frameworks/react-vite/nonworkingdays',
      title: 'Non-Working days',
      version: 'React 18 + Vite 5 + TypeScript 5',
      since: '6.0.0'
    }, {
      folder: 'frameworks/react-vite/react-events',
      title: 'React JSX component as event renderer',
      version: 'React 19 + Vite 6 + TypeScript 5',
      since: '5.3.0',
      updated: '6.2.4'
    }, {
      folder: 'frameworks/react-vite/renderer-context',
      title: 'Using React Context with renderers',
      version: 'React 18 + Vite 4 + TypeScript 5',
      since: '5.6.1'
    }, {
      folder: 'frameworks/react-vite/timelinehistogram',
      title: 'Timeline histogram',
      version: 'React 18 + Vite 4 + TypeScript 4',
      since: '5.6.4'
    }, {
      folder: 'frameworks/react-vite/vertical',
      title: 'Vertical mode',
      version: 'React 18 + Vite 5 + TypeScript 5',
      since: '4.1',
      updated: '6.1.6'
    }]
  },
  'React examples': {
    overlay: 'react',
    tab: 'react',
    build: true,
    items: [{
      folder: 'frameworks/react/javascript/advanced',
      title: 'React + Redux Toolkit advanced',
      version: 'React 18',
      since: '2.0'
    }, {
      folder: 'frameworks/react/javascript/animations',
      title: 'Animations',
      version: 'React 16',
      since: '2.0'
    }, {
      folder: 'frameworks/react/javascript/columns',
      title: 'Columns',
      version: 'React 18',
      since: '5.1'
    }, {
      folder: 'frameworks/react/javascript/custom-event-editor',
      title: 'Custom event editor',
      version: 'React 16',
      since: '2.2'
    }, {
      folder: 'frameworks/react/javascript/dependencies',
      title: 'Dependencies',
      version: 'React 16',
      since: '2.0'
    }, {
      folder: 'frameworks/react/javascript/drag-between-schedulers',
      title: 'Drag between schedulers',
      version: 'React 16',
      since: '2.0'
    }, {
      folder: 'frameworks/react/javascript/drag-onto-tasks',
      title: 'Drag onto tasks',
      version: 'React 16',
      since: '2.0',
      updated: '5.6.3'
    }, {
      folder: 'frameworks/react/javascript/filtering',
      title: 'Filtering',
      version: 'React 16',
      since: '2.2'
    }, {
      folder: 'frameworks/react/javascript/localization',
      title: 'Localization',
      version: 'React 16',
      since: '2.1'
    }, {
      folder: 'frameworks/react/javascript/pdf-export',
      title: 'PDF export (offline)',
      version: 'React 16',
      since: '3.0',
      offline: true
    }, {
      folder: 'frameworks/react/javascript/react-state',
      title: 'Using state',
      version: 'React 17',
      since: '4.3.2'
    }, {
      folder: 'frameworks/react/javascript/react-tooltips',
      title: 'Using React JSX components in tooltips',
      version: 'React 18',
      since: '5.2.6'
    }, {
      folder: 'frameworks/react/javascript/simple',
      title: 'Simple setup',
      version: 'React 16',
      since: '2.0',
      updated: '2.3'
    }, {
      folder: 'frameworks/react/javascript/simpleeditor',
      title: 'Simple editor',
      version: 'React 18',
      since: '5.1'
    }, {
      folder: 'frameworks/react/typescript/filtering',
      title: 'Filtering with TypeScript',
      version: 'React 16 + TypeScript 4',
      since: '2.2',
      updated: '5.0.3'
    }, {
      folder: 'frameworks/react/typescript/recurring-events',
      title: 'Recurring events with TypeScript',
      version: 'React 16 + TypeScript 4',
      since: '3.1',
      updated: '5.0.3'
    }, {
      folder: 'frameworks/react/typescript/recurring-timeranges',
      title: 'Recurring timeranges with TypeScript',
      version: 'React 16 + TypeScript 4',
      since: '4.3.4',
      updated: '5.0.3'
    }, {
      folder: 'frameworks/react/typescript/sharepoint-fabric',
      title: 'SharePoint Workbench with TypeScript',
      version: 'React 17 + TypeScript 4',
      offline: true,
      since: '6.0.1'
    }, {
      folder: 'frameworks/react/typescript/sharepoint-fabric-drag-from-grid',
      title: 'SharePoint Workbench Drag from Grid with TypeScript',
      version: 'React 17 + TypeScript 4',
      offline: true,
      since: '6.1.8'
    }]
  },
  'React + Remix examples': {
    overlay: 'react',
    tab: 'react',
    build: true,
    items: [{
      folder: 'frameworks/react-remix/basic',
      title: 'Basic setup',
      version: 'React 18 + Remix 2 + Vite 5 + TypeScript 5',
      offline: true,
      since: '6.0.0'
    }]
  },
  'Vue 3 + Vite examples': {
    overlay: 'vue',
    tab: 'vue',
    build: true,
    items: [{
      folder: 'frameworks/vue-3-vite/basic',
      title: 'Basic setup',
      version: 'Vue 3 + Vite 5 + TypeScript 5',
      since: '6.1.2'
    }, {
      folder: 'frameworks/vue-3-vite/basic-thin',
      title: 'Basic thin setup',
      version: 'Vue 3 + Vite 5 + TypeScript 5',
      since: '6.1.4'
    }, {
      folder: 'frameworks/vue-3-vite/booking',
      title: 'Property booking',
      version: 'Vue 3 + Vite 5 + TypeScript 4',
      since: '6.0.0',
      updated: '6.0.5'
    }, {
      folder: 'frameworks/vue-3-vite/custom-event-editor',
      title: 'Custom event editor',
      version: 'Vue 3 + Vite 5 + TypeScript 5',
      since: '2.2.5',
      updated: '6.2.3'
    }, {
      folder: 'frameworks/vue-3-vite/drag-from-grid',
      title: 'Drag tasks from grid',
      version: 'Vue 3 + Vite 5 + TypeScript 5',
      since: '6.0.6'
    }, {
      folder: 'frameworks/vue-3-vite/event-rendering',
      title: 'Event rendering demo',
      version: 'Vue 3 + Vite 5 + TypeScript 5',
      since: '6.0.6'
    }, {
      folder: 'frameworks/vue-3-vite/infinite-scroll-tree',
      title: 'Infinite scroll tree',
      version: 'Vue 3 + Vite 7 + TypeScript 5',
      since: '6.2.5'
    }, {
      folder: 'frameworks/vue-3-vite/timelinehistogram',
      title: 'Timeline histogram',
      version: 'Vue 3 + Vite 4 + TypeScript 4',
      since: '5.6.4'
    }, {
      folder: 'frameworks/vue-3-vite/widget-rendering',
      title: 'Vue Component in widget and tooltip',
      version: 'Vue 3 + Vite 6 + TypeScript 5',
      since: '6.1.5'
    }]
  },
  'Vue 3 examples': {
    overlay: 'vue',
    tab: 'vue',
    build: true,
    items: [{
      folder: 'frameworks/vue-3/javascript/columns',
      title: 'Columns',
      version: 'Vue 3',
      since: '5.1',
      updated: '5.3.0'
    }, {
      folder: 'frameworks/vue-3/javascript/simple',
      title: 'Simple setup',
      version: 'Vue 3',
      since: '4.1',
      updated: '5.3.0'
    }, {
      folder: 'frameworks/vue-3/javascript/simpleeditor',
      title: 'Simple editor',
      version: 'Vue 3',
      since: '5.1',
      updated: '5.3.0'
    }]
  },
  'Vue 2 examples': {
    overlay: 'vue',
    tab: 'vue',
    build: true,
    items: [{
      folder: 'frameworks/vue/javascript/advanced',
      title: 'Advanced',
      version: 'Vue 2',
      since: '2.0.4'
    }, {
      folder: 'frameworks/vue/javascript/animations',
      title: 'Animations',
      version: 'Vue 2',
      since: '2.0.4'
    }, {
      folder: 'frameworks/vue/javascript/dependencies',
      title: 'Dependencies',
      version: 'Vue 2',
      since: '2.0.4'
    }, {
      folder: 'frameworks/vue/javascript/drag-between-schedulers',
      title: 'Drag between schedulers',
      version: 'Vue 2',
      since: '2.0.4'
    }, {
      folder: 'frameworks/vue/javascript/drag-onto-tasks',
      title: 'Drag onto tasks',
      version: 'Vue 2',
      since: '2.0.4',
      updated: '5.6.3'
    }, {
      folder: 'frameworks/vue/javascript/localization',
      title: 'Localization',
      version: 'Vue 2',
      since: '2.0.4'
    }, {
      folder: 'frameworks/vue/javascript/pdf-export',
      title: 'PDF export',
      version: 'Vue 2',
      since: '3.0',
      offline: true
    }, {
      folder: 'frameworks/vue/javascript/simple',
      title: 'Simple setup',
      version: 'Vue 2',
      since: '2.0.4'
    }, {
      folder: 'frameworks/vue/javascript/tasks',
      title: 'Tasks',
      version: 'Vue 2',
      since: '2.0.4'
    }, {
      folder: 'frameworks/vue/javascript/vue-renderer',
      title: 'Cell renderer',
      version: 'Vue 2',
      since: '4.1'
    }]
  }
};

// Flatten examples tree
window.examples = Object.entries(examples).flatMap(([group, parent]) => parent.items.map(item => Object.assign(item, parent, {
  group,
  items: undefined
})));