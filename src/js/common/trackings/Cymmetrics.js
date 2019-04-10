export default function loadCymmetricsScript() {
    var addScript = function() {
      var cy_src = 'cm.g.doubleclick.net/pixel?google_nid=cymmetrics_dmp&google_cm&dmpp=vm5&vm5_ck=[VM5AD_BROWSER_ID]';
      var cym_ct = document.createElement('script');
      cym_ct.type = 'text/javascript';
      var src = 'https://';
      cym_ct.src = src + cy_src;
      var cym_cts = document.getElementsByTagName('script')[0];
      cym_cts.parentNode.insertBefore(cym_ct, cym_cts);
    };
    if (window.addEventListener) {
      document.readyState == 'loading' ? document.addEventListener('DOMContentLoaded', addScript, false) : addScript();
    }
    else {
      document.readyState == 'loading' ? document.attachEvent('onDOMContentLoaded', addScript, false) : addScript();
    }
};
