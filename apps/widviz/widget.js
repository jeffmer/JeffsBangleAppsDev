(() => {

  var saved = null;
  
  function hide(){
    if (!Bangle.isLCDOn() || this.saved) return;
    this.saved = [];
    for (var wd of WIDGETS) {
      this.saved.push(wd.draw); 
      wd.draw=()=>{};
    }
    WIDGETS["viz"].draw=setup;
    g.setColor(0,0,0);
    g.fillRect(0,0,239,23);
  }
  
  function reveal(){
    if (!Bangle.isLCDOn() || !this.saved) return;
    for (var wd of WIDGETS) wd.draw = this.saved.shift();
    Bangle.drawWidgets(); 
    this.saved=null;
  }
  
  function setup(){
    setWatch(hide, BTN4, {repeat:true,edge:"rising"});
    setWatch(reveal, BTN5, {repeat:true,edge:"rising"});
  }
  
  function draw(){
    var img = E.toArrayBuffer(atob("GBgBAAAAAAAAAAAAAAAAAAAAAAAAAP8AB//gH//4P//8f//+/f+/+f+fef+eGP8YDP8wDjxwBwDgA4HAAf+AAH4AAAAAAAAAAAAA"));
    g.setColor(0x07ff);
    g.drawImage(img,this.x,this.y);
    setup();
  }
    
  WIDGETS["viz"] ={area:"tl", width:24,draw:draw};
    
})();
