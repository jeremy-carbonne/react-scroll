'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var assign = require('object-assign');

var utils = require('./utils');
var animateScroll = require('./animate-scroll');
var events = require('./scroll-events');

var __mapped = {};
var __activeLink;

module.exports = {

  unmount: function unmount() {
    __mapped = {};
  },

  register: function register(name, element) {
    __mapped[name] = element;
  },

  unregister: function unregister(name) {
    delete __mapped[name];
  },

  get: function get(name) {
    return __mapped[name] || document.getElementById(name);
  },

  setActiveLink: function setActiveLink(link) {
    __activeLink = link;
  },

  getActiveLink: function getActiveLink() {
    return __activeLink;
  },

  scrollTo: function scrollTo(to, props) {

    /*
    * get the mapped DOM element
    */

    var target = this.get(to);

    if (!target) {
      console.warn("target Element not found");
      return;
    }

    props = assign({}, props, { absolute: false });

    if (events.registered['begin']) {
      events.registered['begin'](to, target);
    }

    var containerId = props.containerId;
    var container = props.container;

    var containerElement;
    if (containerId) {
      containerElement = document.getElementById(containerId);
    } else if (container && container.nodeType) {
      containerElement = container;
    } else {
      containerElement = utils.getScrollParent(target);
    }

    props.absolute = true;
    var scrollOffsetY;
    var scrollOffsetX;
    if (containerElement === document) {
      scrollOffsetY = target.offsetTop;
      scrollOffsetX = target.offsetLeft;
    } else {
      var coordinates = target.getBoundingClientRect();
      scrollOffsetY = containerElement.scrollTop + coordinates.top - containerElement.offsetTop;
      scrollOffsetX = containerElement.scrollLeft + coordinates.left - containerElement.offsetLeft;
    }

    /*
     * retro compatibility
     */
    if (_typeof(props.offset) === "object") {
      scrollOffsetY += props.offset.y || 0;
      scrollOffsetX += props.offset.x || 0;
    } else {
      scrollOffsetY += props.offset || 0;
    }

    /*
     * if animate is not provided just scroll into the view
     */
    if (!props.smooth) {
      if (containerElement === document) {
        // window.scrollTo accepts only absolute values so body rectangle needs to be subtracted
        window.scrollTo(scrollOffsetX, scrollOffsetY);
      } else {
        containerElement.scrollTop = scrollOffsetY;
        containerElement.scrollLeft = scrollOffsetX;
      }

      if (events.registered['end']) {
        events.registered['end'](to, target);
      }

      return;
    }

    /*
     * Animate scrolling
     */

    animateScroll.animateScroll(scrollOffsetX, scrollOffsetY, props, to, target);
  }
};