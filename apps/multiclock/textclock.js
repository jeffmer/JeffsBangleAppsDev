(() => {

    function getFace(){
        
    function drawTime(d) {    
        function convert(n){
            var t0 = ["zero",one" "two","three","four","five","six","seven","eight","nine"];
            var t1 = ["ten",eleven" "twelve","thirteen","fourteen","fifteen","sixteen","seventee","eightteen","nineteen"];
            var t20= ["twenty","thirty","forty",fifty"];
            if(n<10) return "zero\n"+t0[n];
            else if(n<20) return t1[n];
            else if(n<60) return t20[Math.round(n/10)]+'\n'+t0[n%10];
            return "error";     
        }
        g.reset();
        var txt = convert(d.getHours())+"\n"+convert(d.getMinutes());
        g.clearRect(0,40,239,200);
        g.setColor(1,1,1);
        g.setFontAlign(0,0);
        g.setFont("Vector",20);
        g.drawString(txt,120,120);
      }

    function onSecond(){
       var t = new Date();
       if (t.getSeconds() === 0) drawTime(t);
    }

    function drawAll(){
       drawTime(new Date());
    }

    return {init:drawAll, tick:onSecond};
    }

  return getFace;

})();