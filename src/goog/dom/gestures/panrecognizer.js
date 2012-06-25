/**
 * Copyright 2012 Google, Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

goog.provide('goog.dom.gestures.PanRecognizer');

goog.require('goog.asserts');
goog.require('goog.dom.gestures.Recognizer');
goog.require('goog.dom.gestures.State');



/**
 * A pan gesture recognizer.
 * @constructor
 * @extends {goog.dom.gestures.Recognizer}
 * @param {!Element} target DOM element to attach to.
 */
goog.dom.gestures.PanRecognizer = function(target) {
  goog.base(this, target);

  /**
   * Minimum number of touches required for the gesture to recognize.
   * @private
   * @type {number}
   */
  this.minTouchCount_ = 1;

  /**
   * Maximum number of touches required for the gesture to recognize.
   * @private
   * @type {number}
   */
  this.maxTouchCount_ = 999;

  /**
   * Number of pixels of movement in a touch to activate the gesture.
   * @private
   * @type {number}
   */
  this.moveHysteresis_ = 6;

  /**
   * X of the centroid when the gesture first began.
   * @private
   * @type {number}
   */
  this.centroidStartX_ = 0;

  /**
   * Y of the centroid when the gesture first began.
   * @private
   * @type {number}
   */
  this.centroidStartY_ = 0;

  /**
   * Current shift accumulation in centroid offset X.
   * @private
   * @type {number}
   */
  this.centroidShiftX_ = 0;

  /**
   * Current shift accumulation in centroid offset Y.
   * @private
   * @type {number}
   */
  this.centroidShiftY_ = 0;

  /**
   * The total distance the center has moved, in px.
   * @private
   * @type {number}
   */
  this.centroidDistance_ = 0;
};
goog.inherits(goog.dom.gestures.PanRecognizer, goog.dom.gestures.Recognizer);


/**
 * @return {number} Number of taps required for the gesture recognize.
 */
goog.dom.gestures.PanRecognizer.prototype.getMinimumTouchCount = function() {
  return this.minTouchCount_;
};


/**
 * Sets the number of taps required for the gesture to recognize.
 * @param {number} value New tap count value, >= 1.
 */
goog.dom.gestures.PanRecognizer.prototype.setMinimumTouchCount =
    function(value) {
  goog.asserts.assert(this.getState() == goog.dom.gestures.State.POSSIBLE);
  value |= 0;
  goog.asserts.assert(value >= 1);
  this.minTouchCount_ = value;
};


/**
 * @return {number} Number of touches required for the gesture recognize.
 */
goog.dom.gestures.PanRecognizer.prototype.getMaximumTouchCount = function() {
  return this.maxTouchCount_;
};


/**
 * Sets the number of touches required for the gesture to recognize.
 * @param {number} value New touch count value, >= 1.
 */
goog.dom.gestures.PanRecognizer.prototype.setMaximumTouchCount =
    function(value) {
  goog.asserts.assert(this.getState() == goog.dom.gestures.State.POSSIBLE);
  value |= 0;
  goog.asserts.assert(value >= 1);
  this.maxTouchCount_ = value;
};


/**
 * @return {number} The amount of translation on X since the gesture began.
 */
goog.dom.gestures.PanRecognizer.prototype.getTranslateX = function() {
  return this.getPageX() - this.centroidStartX_ + this.centroidShiftX_;
};


/**
 * @return {number} The amount of translation on Y since the gesture began.
 */
goog.dom.gestures.PanRecognizer.prototype.getTranslateY = function() {
  return this.getPageY() - this.centroidStartY_ + this.centroidShiftY_;
};


/**
 * @override
 */
goog.dom.gestures.PanRecognizer.prototype.reset = function() {
  this.centroidStartX_ = this.centroidStartY_ = 0;
  this.centroidShiftX_ = this.centroidShiftY_ = 0;
  this.centroidDistance_ = 0;
  goog.base(this, 'reset');
};


/**
 * @override
 */
goog.dom.gestures.PanRecognizer.prototype.touchesBegan = function(e) {
  var oldPageX = this.getPageX();
  var oldPageY = this.getPageY();
  this.updateLocation(e.targetTouches);

  if (this.getState() == goog.dom.gestures.State.CHANGED) {
    // New touch while recognizing, shift centroid
    this.centroidShiftX_ -= this.getPageX() - oldPageX;
    this.centroidShiftY_ -= this.getPageY() - oldPageY;

    if (e.targetTouches.length > this.maxTouchCount_) {
      // Exceeded touch count, stop recognizing
      this.setState(goog.dom.gestures.State.ENDED);
      this.reset();
      return;
    }
  }
};


/**
 * @override
 */
goog.dom.gestures.PanRecognizer.prototype.touchesMoved = function(e) {
  // Ignore if out of touch range
  if (e.targetTouches.length < this.minTouchCount_ ||
      e.targetTouches.length > this.maxTouchCount_) {
    return;
  }

  // Grab the latest centroid position
  var oldPageX = this.getPageX();
  var oldPageY = this.getPageY();
  this.updateLocation(e.targetTouches);
  var pageX = this.getPageX();
  var pageY = this.getPageY();

  // Compute distance moved
  var dx = pageX - oldPageX;
  var dy = pageY - oldPageY;
  this.centroidDistance_ += Math.sqrt(dx * dx + dy * dy);

  // Begin if we have moved far enough
  if (this.getState() == goog.dom.gestures.State.POSSIBLE &&
      this.centroidDistance_ > this.moveHysteresis_) {
    // Moved far enough, start!
    this.centroidStartX_ = pageX;
    this.centroidStartY_ = pageY;
    this.centroidShiftX_ = this.centroidShiftY_ = 0;
    this.setState(goog.dom.gestures.State.BEGAN);
    this.setState(goog.dom.gestures.State.CHANGED);
  } else if ((dx || dy) && this.getState() == goog.dom.gestures.State.CHANGED) {
    // Normal update
    this.setState(goog.dom.gestures.State.CHANGED);
  }
};


/**
 * @override
 */
goog.dom.gestures.PanRecognizer.prototype.touchesEnded = function(e) {
  if (this.getState() == goog.dom.gestures.State.CHANGED) {
    if (e.targetTouches.length >= this.minTouchCount_) {
      // Still have some valid touches - shift centroid
      var oldPageX = this.getPageX();
      var oldPageY = this.getPageY();
      this.updateLocation(e.targetTouches);
      this.centroidShiftX_ -= this.getPageX() - oldPageX;
      this.centroidShiftY_ -= this.getPageY() - oldPageY;
    } else {
      // Not enough touches
      this.setState(goog.dom.gestures.State.ENDED);
      this.reset();
    }
  }
};


/**
 * @override
 */
goog.dom.gestures.PanRecognizer.prototype.touchesCancelled = function(e) {
  this.setState(goog.dom.gestures.State.CANCELLED);
  this.reset();
};