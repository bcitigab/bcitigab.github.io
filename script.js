var supportsES6 = (function () {
  try {
    new Function("(a=0)=>a");
    return true;
  } catch (e) {
    return false;
  }
})();

/**
 * Debounce function:
 * https://davidwalsh.name/function-debounce
 *
 * @param {function} func - Callback function to run.
 * @param {int} wait - How long in milliseconds to wait before firing.
 * @param {bool} imediate - Fire on the leading edge or trailing
 *
 */
function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

function whichTransitionEvent() {
  var t;
  var el = document.createElement("fakeelement");
  var transitions = {
    WebkitTransition: "webkitTransitionEnd",
    MozTransition: "transitionend",
    MSTransition: "msTransitionEnd",
    OTransition: "oTransitionEnd",
    transition: "transitionEnd"
  };

  for (t in transitions) {
    if (el.style[t] !== undefined) {
      return transitions[t];
    }
  }
}

const fadeOutRemove = (obj) => {
  const transition = whichTransitionEvent();
  obj.classList.add("-js-fadeOutRemove");
  obj.setAttribute("hidden", true);
  obj.style = "display: none";
  // if (obj.hasAttribute('data-videoId')) return;

  // obj.addEventListener(transition, _ => {
  //   obj.setAttribute('hidden', true);
  //   obj.style = "width: 0; height: 0;";
  // });
};

const fadeOutAdd = (obj) => {
  const transition = whichTransitionEvent();
  obj.classList.remove("-js-fadeOutRemove");
  obj.setAttribute("hidden", false);
  obj.style = "display: block";
  /*
  TODO: Add smoother animation fade in/out
  */
  // if (obj.hasAttribute('data-videoId')) return;
  // obj.addEventListener(transition, _ => {
  //   obj.setAttribute('hidden', false);
  //   obj.style = "";
  // });
};

var VideoPlayer = (function (document) {
  "use strict";
  if (!supportsES6) return;

  const lazyLoad = (video) => {
    const videoSrc = video.dataset.videosrc; // Get video source from tile's attribute
    if (!videoSrc) return;

    // ... The same code for image generation

    const videoEl = document.createElement("video");  // Create video element
    videoEl.className = "video_mp4";
    videoEl.setAttribute("controls", "");

    const sourceEl = document.createElement("source");  // Create source element
    sourceEl.setAttribute("src", videoSrc);  // Add your video source url
    sourceEl.setAttribute("type", "video/mp4");

    videoEl.appendChild(sourceEl);

    const getFrame = (e) => {
      if (e.target.querySelector(".video_mp4")) return;  // Update class name used in this condition
      fadeOutRemove(e.target);
 
      videoEl.addEventListener("loadeddata", (_) => {  // Use loadeddata event for video element
        fadeOutRemove(wrapper);
      }, { once: true });

      video.prepend(videoEl);
    };

    video.setAttribute("tabindex", 0);
    video.setAttribute("aria-title", "Video module: " + title);
    video.addEventListener("click", getFrame, { once: true });
  };

  document.addEventListener("DOMContentLoaded", (e) => {
    const videos = document.querySelectorAll("[data-videosrc]");  // Update this selector to adapt to new attribute data-videosrc
    for (const video of videos) {
      lazyLoad(video);
    }
  });
})(document);

var compareText = function (videos, element, compare) {
  // This regex matches the value of the input field, in either orientation or in part of a word
  const val =
      "^(?=.*\\b" +
      element.value.toLowerCase().trim().split(/\s+/).join("\\b)(?=.*\\b") +
      ").*$",
    // RegExp instance
    reg = RegExp(val, "i");
  // Filter the videos node array based on the regex pattern matching
  videos.filter((video) => {
    // Matches spaces and replaces with 'clean' spaces in the data-videotitle attr
    text = video.dataset[compare].toLowerCase().replace(/\s+/g, " ");
    // Test regex pattern against the value of text
    if (!reg.test(text)) {
      // hide video tile as it doesn't match the search
      fadeOutRemove(video);
      // video.style = "display: none";
    } else {
      // show everything that does match
      fadeOutAdd(video);
      // video.style = "display: block";
    }
  });
};
// Search by text
var simpleSearch = (function (document) {
  // Check if ES6 is supported

  if (!supportsES6) return;

  // Search function
  const search = (videos, element) => {
    // Text to match against
    let text = "",
      compare = "videotitle",
      eventType = "keyup";
    /*
    Add event listener for key up, using debounce to avoid performance issues.
    See: https://davidwalsh.name/function-debounce
    
    Arguably could use a button input instead to 'submit' the search, but this is live-effect, depends what is preferred.
    */
    const nodeType = element.nodeName;
    if (nodeType == "SELECT") {
      eventType = "change";
      compare = "videocategory";
    }
    console.log(nodeType);

    element.addEventListener(
      eventType,
      debounce(function () {
        compareText(videos, element, compare);
      }),
      1000
    );
  };
  // Run on load
  document.addEventListener("DOMContentLoaded", (e) => {
    // Array of video tiles, using spread as nodelist isn't technically an array
    const videos = [...document.querySelectorAll(".tile")],
      // Get text input dom element
      input = document.querySelector("#searchBar"),
      select = document.querySelector("#filter");
    // Reset input val - probably a better way to do this without JS.
    input.value = "";
    select.value = "";
    // Call search
    search(videos, input);
    search(videos, select);
  });
})(document);

var matchHeights = function () {
  "use strict";

  var dataAttr = "data-matchHeights";
  var minViewportWidth = 460;

  function _getHeightSetsArray(dataAttr) {
    // Return an array containing the different values of data-data-heightmatch
    var value;
    var arr = [];
    var sets = document.querySelectorAll("[" + dataAttr + "]");
    var i = sets.length;
    while (i--) {
      value = sets[i].getAttribute(dataAttr);
      if (arr.indexOf(value) === -1) {
        arr.push(value);
      }
    }
    return arr;
  }

  function _resetMinHeights(set) {
    // reset min-heights by removing the inline style.
    var i = set.length;
    while (i--) {
      set[i].removeAttribute("style");
    }
  }

  function _getMaxSetHeight(set) {
    // return the height of the tallest element in set
    var maxHeight = 0;
    var currentHeight;
    var i = set.length;
    while (i--) {
      currentHeight = set[i].clientHeight;
      if (currentHeight > maxHeight) {
        maxHeight = currentHeight;
      }
    }
    return maxHeight;
  }

  function _setMinHeight(set, matchedHeight) {
    var i = set.length;
    while (i--) {
      set[i].style.minHeight = matchedHeight + "px";
    }
  }

  function init() {
    var sets = _getHeightSetsArray(dataAttr);
    var i = sets.length;
    var set;

    while (i--) {
      set = document.querySelectorAll("[" + dataAttr + '="' + sets[i] + '"]');

      _resetMinHeights(set);

      // Only above minimum screen width
      if (document.body.clientWidth >= minViewportWidth) {
        _setMinHeight(set, _getMaxSetHeight(set));
      }
    }
  }

  init();
};

window.addEventListener("load", matchHeights, false);
window.addEventListener("resize", matchHeights, false);