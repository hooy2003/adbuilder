function isInSafeFrame() {
  return window.$sf && window.$sf.ext &&
    window.$sf.ext.supports && typeof window.$sf.ext.supports === 'function' &&
    typeof window.$sf.ext.supports() === 'object';
}

function inViewPercentage() {
  if (window.$sf && window.$sf.ext &&
    window.$sf.ext.inViewPercentage && typeof window.$sf.ext.inViewPercentage === 'function' &&
    (! isNaN(window.$sf.ext.inViewPercentage()))
  ) {
    return window.$sf.ext.inViewPercentage();
  }
}

function geom() {
  if (window.$sf && window.$sf.ext &&
    window.$sf.ext.geom && typeof window.$sf.ext.geom === 'function' &&
    typeof window.$sf.ext.geom() === 'object'
  ) {
    return window.$sf.ext.geom();
  }
}

export {
  isInSafeFrame,
  inViewPercentage,
  geom,
};
