(function(back) {
  const ANCSFILE = "widancs.json";

  // initialize with default settings...
  let s = {
    'enabled': false,
    'category':[1,2,4]
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
  
  function setcategory(){
    const names = ["Other","Call ","Missed Call","Voicemail","Messages ","Calendar","Email","News ","Fitness ","Busniness","Location ","Entertainmeng"];
    function hascat(n){return s.category.includes(n)}
    function setcat(n){s.category.push(n)}
    function clearcat(n){
    const menu = {
    '': { 'title': 'Set Categories' }
    };
    for (var i=0; i<names.length();++i)
        menu[names[i]]={
             format:()=(hascat(i):?'Yes':'No'),
             onchange:()=(if (has at(i
  }

  E.showMenu({
     'Enable ANCS': {
      value: s.enabled,
      format: () => (s.enabled ? 'Yes' : 'No'),
      onchange: () => {
        s.enabled = !s.enabled;
        save();
      },
    },
    'Set Category':setcategory,
    '< Back': back,
  })
});