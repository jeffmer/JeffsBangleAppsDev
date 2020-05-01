(function(back) {
  const ANCSFILE = "widancs.json";

  // initialize with default settings...
  let s = {
    'enabled': false,
  }
  // ...and overwrite them with any saved values
  // This way saved values are preserved if a new version adds more settings
  const storage = require('Storage');
  const d = storage.readJSON(ANCSFILE, 1) || {};
  const saved = d.settings || {}
  for (const key in saved) {
    s[key] = saved[key];
  }

  function save() {
    d.settings = s;
    storage.write(ANCSFILE, d);
  }

  E.showMenu({
     'Enable ANCS': {
      value: s.progress,
      format: () => (s.enabled ? 'Yes' : 'No'),
      onchange: () => {
        s.enabled = !s.enabled;
        save();
      },
    },
    '< Back': back,
  })
})