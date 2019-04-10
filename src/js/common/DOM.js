function createElement (tag, elId) {
  if (!document) {
    throw new Error('document object not available');
  }

  const el = document.createElement(tag);
  el.id = elId;

  return el;
}
function isVisible (elem) {
    if (!(elem instanceof Element)) throw Error('DomUtil: elem is not an element.');

    var tempNodeForFixedProblems = elem;
    while(tempNodeForFixedProblems) {
      if (tempNodeForFixedProblems) {
        if (!(tempNodeForFixedProblems instanceof Element)) {
          break;
        }

        var computedStyle = window.getComputedStyle(tempNodeForFixedProblems, null);
        if (computedStyle) {
          if ((!computedStyle.display) || computedStyle.display === 'none') {return false}
          if ((!computedStyle.visibility) || computedStyle.visibility !== 'visible') {return false}
        }
      }

      tempNodeForFixedProblems = tempNodeForFixedProblems.parentNode;
    }

    // if (style.opacity < 0.1) return false;
    // if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height +
    //     elem.getBoundingClientRect().width === 0) {
    //     return false;
    // }

    /*
    const elemCenter   = {
        x: elem.getBoundingClientRect().left + elem.offsetWidth / 2,
        y: elem.getBoundingClientRect().top + elem.offsetHeight / 2
    };
    if (elemCenter.x < 0) return false;
    if (elemCenter.x > (document.documentElement.clientWidth || window.innerWidth)) return false;
    if (elemCenter.y < 0) return false;
    if (elemCenter.y > (document.documentElement.clientHeight || window.innerHeight)) return false;
    let pointContainer = document.elementFromPoint(elemCenter.x, elemCenter.y);
    do {
        if (pointContainer === elem) return true;
        if (! pointContainer) {
          break;
        }
    } while (pointContainer = pointContainer.parentNode);
    return false;
    */
    return true;
}

function getElementByXpath (path) {
  return document.evaluate(path, document, null, XPathResult.ANY_TYPE, null);
}
function setInnerHtml (elm, html) {
  elm.innerHTML = html;
  Array.from(elm.querySelectorAll("script")).forEach(function(el) {
    let newEl = document.createElement("script");
    Array.from(el.attributes).forEach(function(el) {
      newEl.setAttribute(el.name, el.value)
    });
    newEl.appendChild(document.createTextNode(el.innerHTML));
    el.parentNode.replaceChild(newEl, el);
  })
}
function insertAfter (newNode, referenceNode) {
    if (referenceNode.parentNode) {
      referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }
}
function removeFromParent (referenceNode) {
  if (referenceNode.parentNode) {
    referenceNode.parentNode.removeChild(referenceNode);
  }
}
function getParameterByName(name, url) {
  if (!url) {url = window.location.href}
  name = name.replace(/[\[\]]/g, "\\$&");

  var regex = new RegExp("[?&#]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) {return null};
  if (!results[2]) {return ''};
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
function getExtensionFromUrl(url) {
  if (!url) {url = window.location.href}
  return (url = url.substr(1 + url.lastIndexOf("/")).split('?')[0]).split('#')[0].substr(url.lastIndexOf("."))
}
function addScript (attribute, text) {
  return new Promise(function(resolve, reject) {

      var script = document.createElement('script');
      for (var attr in attribute) {
          var value = attribute[attr];
          if (value) {
            script.setAttribute(attr, value);
          }
      }
      script.innerHTML = text;

      script.onload = resolve;
      script.onerror = reject;

      document.body.appendChild(script);
  });
}
function sendTrackingWithUrl (url) {
  let el = document.createElement('img');
  el.src = url;
  el.style.display = 'none';
  document.body.appendChild(el);
}
function addCss(attribute, text) {
  return new Promise(function(resolve, reject) {

      var node = document.createElement('link');
      node.setAttribute('rel', 'stylesheet');
      node.setAttribute('type', 'text/css');
      for (var attr in attribute) {
          var value = attribute[attr];
          if (value) {
            node.setAttribute(attr, value);
          }
      }
      node.innerHTML = text;

      node.onload = resolve;
      node.onerror = reject;

      document.body.appendChild(node);
  });
}

export {
  createElement, isVisible,
  getElementByXpath,setInnerHtml,insertAfter,removeFromParent,
  addScript,addCss,sendTrackingWithUrl,
  getParameterByName, getExtensionFromUrl,
};
