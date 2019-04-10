function assert(condition, message) {
    if (!condition) {
        error(message);
    }
}

function readAsBinaryString(text, callback) {
    const reader = new FileReader();
    reader.addEventListener("load", (e) => {
        if (callback) {
            callback(e.target.result);
        }
    });
    reader.readAsBinaryString(new Blob([text]));
}

function isElementInView(element, fullyInView) {
    const pageTop = window.scrollY;
    const pageBottom = pageTop + window.innerHeight;
    const offset = cumulativeOffset(element);
    const elementTop = offset.top;
    const elementBottom = elementTop + element.offsetHeight;
    const availableRange = 2;

    // 這邊算是一個 workaround
    // 有些時候會有兩個數值差距只有 1 而導致判斷 fail 的情況
    // 會影響某些 event 無法被發送成功
    if (fullyInView === true) {
        return (Math.abs(pageTop - elementTop) < availableRange && Math.abs(pageBottom - elementBottom) < availableRange);
    } else {
        return (Math.abs(elementBottom - pageBottom) < availableRange && Math.abs(elementTop - pageTop) < availableRange);
    }
}

function cumulativeOffset(element) {
    var top = 0, left = 0;
    do {
        top += element.offsetTop  || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while(element);

    return {
        top: top,
        left: left
    };
};

function isVisible(element) {
    if (!element) return false;
    const visibility = window.getComputedStyle(element).getPropertyValue("visibility");
    return visibility !== "hidden" && visibility !== "none";
}

function getOpacity(element) {
    if (!element) return 0;
    return window.getComputedStyle(element).getPropertyValue("opacity");
}

function getSize(element) {
    if (!element) return {w: '0px', h: '0px'};
    return {
        w: window.getComputedStyle(element).getPropertyValue("width"),
        h: window.getComputedStyle(element).getPropertyValue("height")
    };
}

function getRandomString(chars, length) {
    let result = '';
    for (let i = length; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

function generateKey() {
    return getRandomString('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 32);
}

function getZeroPadding(num, size) {
    let s = num + "";
    while (s.length < size) {
        s = "0" + s;
    }
    return s;
}

function upperBound(A, L, R, target) {
    while (L < R) {
        const M = Math.floor((L + R) / 2);
        if (target >= A[M]) {
            L = M + 1;
        } else {
            R = M;
        }
    }
    return L
}

function lowerBound(A, L, R, target) {
    while (L < R) {
        const M = Math.floor((L + R) / 2);
        if (target > A[M]) {
            L = M + 1
        } else {
            R = M;
        }
    }
    return L;
}

function calculateFitDimension(oriWidth, oriHeight, dstWidth, dstHeight, isFit) {
    if (oriWidth <= 0 || oriHeight <= 0) return {w: 0, h: 0};
    // it may have precision problem, but now it's fine
    const calHeight = Math.round(dstWidth * oriHeight / oriWidth);
    let finalWidth, finalHeight;
    if (isFit == false && calHeight > dstHeight || isFit == true && calHeight <= dstHeight) {
        finalWidth = dstWidth;
        finalHeight = calHeight;
    }
    else {
        finalWidth = Math.round(dstHeight * oriWidth / oriHeight);
        finalHeight = dstHeight;
    }
    return {w: finalWidth, h: finalHeight};
}

function getBitmapDimension(src, target, screen, isFit, bBoundScreen, bBoundSource) {
    let overSize = {w: target.w, h: target.h};
    overSize = calculateFitDimension(src.w, src.h, overSize.w, overSize.h, isFit);
    if (bBoundScreen && (screen.w < overSize.w || screen.h < overSize.h)) {
        overSize = calculateFitDimension(overSize.w, overSize.h, screen.w, screen.h, true);
    }
    // if original bitmap size is smaller than overSize, then use original bitmap size
    if (bBoundSource && (src.x < overSize.x || src.y < overSize.y)) {
        overSize.x = src.x;
        overSize.y = src.y;
    }
    return overSize;
}

function getBrowserSize() {
    return {
        w: window.innerWidth || document.body.clientWidth,
        h: window.innerHeight || document.body.clientHeight
    };
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function getFileName(filePath) {
    return filePath.replace(/^.*[\\\/]/, '');
}

function getFileType(filePath){
    return /[^.]+$/.exec(filePath).toString();
}

function getMobileOperatingSystem() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
        return "Windows Phone";
    }

    if (/android/i.test(userAgent)) {
        return "Android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }

    return "unknown";
}

function getVendor() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (isIOs()) {
    return 'apple';
  }

  if (/\bSamsung\b|Galaxy Nexus|SC-|BGT-|GT-|SCH-|SCS-|SGH-|SHV-|SHW-|SM-|SPH-|SWC-/.test(userAgent)) {
    return 'samsung';
  }

  return 'genericAndroid'
}

function isWindows() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Windows Phone must come first because its UA also contains "Android"
    return /windows phone/i.test(userAgent);
}

function isIOs() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
}

function isAndroid() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    return !/windows phone/i.test(userAgent) && /android/i.test(userAgent);
}

function searchTextForKeywords(text, keywords) {
  return unique(getMatchedKeywords());

  function getMatchedKeywords() {
    const matcher = new RegExp(keywords.join('|'), 'ig');
    return text.match(matcher) || [];
  }

  function unique(array) {
    return array.filter((item, pos) => array.indexOf(item) === pos);
  }
}

export {
    assert, readAsBinaryString, isElementInView, cumulativeOffset, isVisible, getOpacity, getSize,
    getRandomString, generateKey, getZeroPadding, upperBound, lowerBound, calculateFitDimension,
    getBitmapDimension, getBrowserSize,
    arrayBufferToBase64, getFileName, getFileType,
    getMobileOperatingSystem, getVendor, isWindows, isIOs, isAndroid,
    searchTextForKeywords,
};
