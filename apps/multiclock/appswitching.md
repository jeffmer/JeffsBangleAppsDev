When you switch apps on the Bangle all the volatile state of the currently running app and of the current set of active widgets is lost. This is because the Bangle loader completely replaces the currently running app. This contributes greatly to the robustness of the Bangle since an error in an app is contained. However, it does mean that any widget state such as a Bluetooth connection is lost - see [here](http://forum.espruino.com/comments/15251491/).

I frequently switch between different clock apps to increase visibility, for more information etc and it occurred to me that a full app context switch is not necessary. Consequently, I have developed **multiclock** an app which supports multiple clock faces. You can try it from my development repository app loader at [jeffmer.github.io](https://jeffmer.github.io/JeffsBangleAppsDev/).

It currently has three clock faces. Each clock face is described by a javascript file with the following format:

```
(() => {
    function getFace(){
	    function onSecond(){
	       //draw digits, hands etc
	    }
	    function drawAll(){
	       //draw background + initial state of digits, hands etc
	    }
    	return {init:drawAll, tick:onSecond};
    }
    return getFace;
})();
```
For those familiar with the structure of widgets, this is similar, however, there is an additional level of function nesting. This means that although faces are loaded when the clock app starts running they are not instantiated until their `getFace` function is called, i.e.  memory is not allocated to structures such as image buffer arrays declared in `getFace` until the face is selected. Consequently, adding a face does not require a lot of extra memory. 

The app at start up loads all files `*.face.js`. The simplest way of adding a new face is thus to load it into Storage using the WebIDE.

I have not submitted a PR for the official repository as I am not sure that this is a problem that only I have due to the ANCS widget. However, it does allow very fast clock face switches.



