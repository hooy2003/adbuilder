import { isInSafeFrame } from './Dfp.js';

export default (function() {
  if (isInSafeFrame())
    return new URL(document.referrer);

  if (isInAmpAd())
    return new URL(window.context.location.href);

  return new URL(document.location.href);
})();

function isInAmpAd() {
  return window.context && window.context.location && window.context.location.href;
}
