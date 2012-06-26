goog-gestures
=============

A simple Closure touch gesture library. This will hopefully be merged into the
Closure Library at some point, but is here to play with until I can get it good
enough to justify getting it included :)

The library is written in Closurized javascript and is easily usable from code
that is using the Closure Library and Closure Compiler. It's also provided as
a standalone JS file for use in any environment (naked DOM/jQuery/whatever).
The code using the library is identical in both cases.

Using the library is fairly simple: attach one or more gestures to a DOM element
and respond to their state changes. Gesture recognizers are created and attached
with the `goog.events.gestures.attach*Gesture()` methods. The passed callback
(with an optional scope) will be called each time the gesture changes state.
Once you are done with an element, be sure to call `goog.events.gestures.unattachAllGestures()`
to clean up event handlers.

Gestures are either discrete (like tap), or continuous (like pinch), and by
default cannot recognize together without using `goog.events.gestures.allowSimultaneousRecognition()`.
The `attach*Gesture()` methods return the gesture objects to be passed to
such routines, as well as to change their parameters before recognition begins.
For example, tap gestures can have the number of taps required to recognize
changed with `setTapCount()`.

## Examples

### Taps

```javascript
// Attach a simple tap gesture to a box
var boxElement = document.getElementById('box');
goog.events.gestures.attachTapGesture(boxElement, function(gesture) {
  // Check to see if the gesture was recognized
  if (gesture.getState() == goog.dom.gestures.State.RECOGNIZED) {
    alert('tapped!');
  }
});
    
// Sometime later...
// If you remove the a DOM element with gestures attached, cleanup:
goog.events.gestures.unattachAllGestures(boxElement);
```

### Tap/swipe

```javascript
var boxElement = document.getElementById('box');
goog.events.gestures.attachTapGesture(boxElement, function(gesture) {
  // Check to see if the gesture was recognized
  if (gesture.getState() == goog.dom.gestures.State.RECOGNIZED) {
    alert('tapped!');
  }
});
goog.events.gestures.attachSwipeGesture(boxElement, function(gesture) {
  // Check to see if the gesture was recognized
  if (gesture.getState() == goog.dom.gestures.State.RECOGNIZED) {
    if (gesture.getDirection() == goog.dom.gestures.Direction.RIGHT) {
      alert('swiped right!');
    }
  }
});
```

### Complex Movable Box

A more complex example showing a robust translate/scale/rotate box. Touch events are ignored (the page can
scroll/etc) unless two fingers are down, in which case it should behave well even with many fingers at play.
Single taps are also recognized on the box, showing a discrete gesture mixed in with all of the continuous ones.

```javascript
// Support for display
var boxElement = document.getElementById('box');
var tx = 0, ty = 0;
var scale = 1;
var angle = 0;
function updateTransform() {
  boxElement.style.webkitTransform =
      'translateZ(0) ' +
      'translate(' + tx + 'px,' + ty + 'px) ' +
      'scale(' + scale + ') ' +
      'rotate(' + angle + 'rad)';
};

goog.events.gestures.attachTapGesture(boxElement, function(gesture) {
  if (gesture.getState() == goog.events.gestures.State.RECOGNIZED) {
    alert('tapped!');
  }
});

var panGesture = goog.events.gestures.attachPanGesture(boxElement, function(gesture) {
  switch (gesture.getState()) {
    case goog.events.gestures.State.CHANGED:
      // It's often better to use getTranslationX|Y() and a start
      // offset to prevent some precision errors
      tx += gesture.getTranslationDeltaX();
      ty += gesture.getTranslationDeltaY();
      updateTransform();
      break;
  }
});
// Require two touches to pan
panGesture.setMinimumTouchCount(2);

var pinchGesture = goog.events.gestures.attachPinchGesture(boxElement, function(gesture) {
  switch (gesture.getState()) {
    case goog.events.gestures.State.CHANGED:
      scale *= gesture.getScalingDelta();
      updateTransform();
      break;
  }
});

var rotationGesture = goog.events.gestures.attachRotationGesture(boxElement, function(gesture,) {
  switch (gesture.getState()) {
    case goog.events.gestures.State.CHANGED:
      angle += gesture.getRotationDelta();
      updateTransform();
      break;
  }
});
    
// Allow all gestures to recognize at the same time
goog.events.gestures.allowSimultaneousRecognition(panGesture, pinchGesture, rotationGesture);
```

## Setup

Wanna play around?

```
# ensure you have python and easy_install!
# clone the repo
git clone https://github.com/benvanik/goog-gestures.git
cd goog-gestures/
# run the setup script to initialize the repo and dependencies
sudo ./tools/setup.sh
# start a local webserver on :8080
anvil serve
# build debug, open http://localhost:8080/examples/example1.html?uncompiled
anvil build :debug
# build release, open http://localhost:8080/examples/example1.html
anvil build :release
# deploy a release build
anvil deploy -o /tmp/goog-gestures-release/ :release
```

## Contributing

Have a fix or feature? Submit a pull request - I love them!
Note that I do keep to the [style_guide](https://github.com/benvanik/games-framework/blob/master/docs/style_guide.md),
so please check it out first!

As this is a Google project, you *must* first e-sign the
[Google Contributor License Agreement](http://code.google.com/legal/individual-cla-v1.0.html) before I can accept any
code. It takes only a second and basically just says you won't sue us or claim copyright of your submitted code.

## License

All code except dependencies under third_party/ is licensed under the permissive Apache 2.0 license.
Feel free to fork/rip/etc and use as you wish!

## Credits

Code by [Ben Vanik](http://noxa.org). See [AUTHORS](https://github.com/benvanik/goog-gestures/blob/master/AUTHORS) for additional contributors.
