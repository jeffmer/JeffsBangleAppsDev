# Navigation Compass

This is a tilt and roll compensated compass with a linear display. The compass will  display the same direction that it shows when flat as when it is tilted (rotation around the W-S axis) or rolled (rotation around the N-S) axis. 

![](screenshot.jpg)

## Calibration

Correct operation of this app depends critically on calibration. When first run on a Bangle, the app will request calibration. This lasts for 30 seconds during which you should move the watch slowly through figures of 8. It is important that during calibration the watch is  fully rotated around each of it axes. If the app does give the correct direction heading or is not stable with respect to tilt and roll - redo the calibration by pressing *BTN3*. Calibration data is recorded in a storage file named `magnav.json`. 

## Controls

*BTN1* - switches to your selected clock app.

*BTN2* - switches to the app launcher.

*BTN3* - invokes calibration ( can be cancelled if pressed accidentally)

*Touch Left* - marks the current heading with a blue circle - see screen shot. This can be used to take a bearing and then follow it.

*Touch Right* - cancels the marker (blue circle not displayed).


## Support

Please report bugs etc. by raising an issue [here](https://github.com/jeffmer/JeffsBangleAppsDev).