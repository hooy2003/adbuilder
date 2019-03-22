class BannerContainer {
  constructor(options) {
    let request_id =
      options.request_id && options.request_id.trim() != ""
        ? options.request_id
        : "[request_id]";

    // default settings
    this.defaultConfig = {
      el: `#vmfive-ad-unit-container-${request_id}`,
      request_id: request_id,
      track_url: "[track_url]",
      downloaded_pixel: `[downloaded_pixel]`,
      downloaded_impression_pixel: `[downloaded_impression_pixel]`,
      "text:cta_in_new_window": `[text:cta_in_new_window]`,
      dfp_url: `[dfp_url]`,
      cta_prefix_url: `[cta_prefix_url]`,
      "cta:default": `[cta:default]`,

      "text:banner_top_offset": `[text:banner_top_offset]`,
      "text:banner_bottom_offset": `[text:banner_bottom_offset]`,
      "text:scale": `[text:scale]`,
      "text:max_width": `[text:max_width]`,

      "text:embedded": `[text:embedded]`,
      "text:show_close_mode": `[text:show_close_mode]`,

      "text:height_ratio": `[text:height_ratio]`,

      "text:background_color": "[text:background_color]",

      "text:logo_background_color": "[text:logo_background_color]",

      enableExpand: true, // 可展開
      expandMode: "full", // 若可展開，展開模式為 full or middle

      layoutGrid: 2, // 預設 Grid 欄數
      layoutExpand: 1, // 展開 Grid 欄數

      enableLogo: true,
      enableImpression: true,
      bannerRatio: "32:9",

      onprepared: [],
      onctaclicked: []
    };

    this.config = {
      ...this.defaultConfig,
      ...options
    };

    this.config.bgColor =
      this.config["text:background_color"].length === 0
        ? "transparent"
        : this.config["text:background_color"];

    this.config.logoBgColor =
      this.config["text:logo_background_color"].length === 0
        ? "transparent"
        : this.config["text:logo_background_color"];

    // check selector
    this.config.el =
      typeof this.config.el === "string"
        ? document.querySelector(this.config.el)
        : this.config.el;
    if (this.config.el === null) {
      throw new Error("Something wrong with your el param");
    }
    this.config.el.insertAdjacentHTML("beforeend", this.baseTemplate);

    // bind events
    this.initData = this.initData.bind(this);
    this.isModeBannerTop = false;

    // init
    let self = this;
    this.data = this.initData(this.config);
    this.rootView = this.config.el;
    this.overlayView = this.rootView.querySelector(
      `#vmfive-overlay-${self.config.request_id}`
    );
    this.adContainerView = this.rootView.querySelector(
      `#vmfive-ad-container-${self.config.request_id}`
    );
    // One columns in container
    this.adContainerInner = this.rootView.querySelector(
      `#vmfive-container-inner-${self.config.request_id}`
    );
    // Two columns ( right / left) in cintainer
    this.adContainerLeft = this.rootView.querySelector(
      `#vmfive-container-left-${self.config.request_id}`
    );
    this.adContainerRight = this.rootView.querySelector(
      `#vmfive-container-right-${self.config.request_id}`
    );
    this.init();
  }

  initData(config) {
    let { el, bannerRatio } = config;
    let elWidth, bannerHeight, bannerHeightRate;

    try {
      elWidth = el.getBoundingClientRect().width;
      bannerHeightRate =
        +bannerRatio.split(":")[1] / +bannerRatio.split(":")[0];
      bannerHeight = elWidth * bannerHeightRate;
    } catch (e) {
      console.log(e);
      elWidth = el.getBoundingClientRect().width;
      bannerHeightRate = 9 / 32;
      bannerHeight = elWidth * bannerHeightRate;
    }

    return {
      ...config,
      elWidth,
      elHeight: bannerHeight,
      viewHeight: window.innerHeight || document.documentElement.clientHeight,
      bannerHeight,
      bannerHeightRate
    };
  }

  init() {
    let self = this;

    function getElById(elId) {
      return self.rootView.querySelector(`#${elId}`);
    }

    const VMFIVE_SCALE_STRING = `${self.config["text:scale"]}`;
    const VMFIVE_SCALE =
      isNaN(VMFIVE_SCALE_STRING) || VMFIVE_SCALE_STRING.length === 0
        ? 1
        : +VMFIVE_SCALE_STRING;

    const vmfiveAdContainerEl = this.adContainerView;
    const vmfiveAdContainerInner = this.adContainerInner;

    let onCtaClicked = function(e) {
      // 如果按到的是音量按鈕，則跳過
      if (e.target.id == `vmfive-volume-btn-${self.config.request_id}`) {
        return false;
      }
      const fullCtaURL = `${self.config["dfp_url"]}${
        self.config["cta_prefix_url"]
      }&url=${self.config["cta:default"]}`;

      let callbacks =
        self.config.onctaclicked && Array.isArray(self.config.onctaclicked)
          ? self.config.onctaclicked
          : [];
      callbacks.forEach(function(callback) {
        if (typeof callback === "function") {
          callback(self, {
            e
          });
        }
      });

      if (ctaInNewWindow) {
        window.open(fullCtaURL, "_blank");
      } else {
        window.top.location.href = fullCtaURL;
      }
    };
    self.onCtaClicked = onCtaClicked;

    const ctaInNewWindow =
      `${self.config["text:cta_in_new_window"]}` === "true";

    const ctaElIdList = [];
    ctaElIdList.forEach(function(elId) {
      setClickEventToEl(getElById(elId), onCtaClicked);
    });

    const marginLeftRight = 0;
    let unexpandedWH = [];
    const containerVHRate = self.data.bannerHeightRate;
    const containerRawWidth = "100vw - " + marginLeftRight + "px";
    const containerWidth = "(" + containerRawWidth + ")*" + VMFIVE_SCALE;
    const containerHeight = "(" + containerWidth + ")*" + containerVHRate;
    vmfiveAdContainerEl.style.width = "calc(" + containerWidth + ")";
    vmfiveAdContainerEl.style.height = "calc(" + containerHeight + ")";
    unexpandedWH["width"] = vmfiveAdContainerEl.style.width;
    unexpandedWH["height"] = vmfiveAdContainerEl.style.height;

    const VMFIVE_MAX_WIDTH_STRING = `${self.config["text:max_width"]}`;
    const VMFIVE_MAX_WIDTH =
      isNaN(VMFIVE_MAX_WIDTH_STRING) || VMFIVE_MAX_WIDTH_STRING.length === 0
        ? 424
        : +VMFIVE_MAX_WIDTH_STRING;
    let maxHeight = VMFIVE_MAX_WIDTH * this.data.bannerHeightRate;
    vmfiveAdContainerEl.style.maxWidth = VMFIVE_MAX_WIDTH + "px";
    vmfiveAdContainerEl.style.maxHeight = maxHeight + "px";
    unexpandedWH["maxWidth"] = vmfiveAdContainerEl.style.maxWidth;
    unexpandedWH["maxHeight"] = vmfiveAdContainerEl.style.maxHeight;

    if (vmfiveAdContainerInner) {
      vmfiveAdContainerInner.style.width = "calc(" + containerWidth + ")";
      vmfiveAdContainerInner.style.height = "calc(" + containerHeight + ")";
      vmfiveAdContainerInner.style.maxWidth = VMFIVE_MAX_WIDTH + "px";
      vmfiveAdContainerInner.style.maxHeight = maxHeight + "px";
    }

    if (self.config.enableExpand) {
      // 點擊廣告會展開
      const vmfiveAdContainerRight = self.adContainerRight;
      const vmfiveAdContainerLeft = self.adContainerLeft;
      const vmfiveAdLayoutGrid = self.config.layoutGrid;
      const vmfiveAdLayoutExpand = self.config.layoutExpand;

      vmfiveAdContainerEl.addEventListener("click", function() {
        // 已展開就跳過
        if (
          vmfiveAdContainerEl.classList.contains("expanded") &&
          event.target.id == `vmfive-close-${self.config.request_id}`
        ) {
          vmfiveAdContainerEl.classList.remove("expanded");
          removeClickEventToEl(vmfiveAdContainerRight, onCtaClicked);
          removeClickEventToEl(vmfiveAdContainerLeft, onCtaClicked);
          return false;
        }
        // 如果按到的是音量按鈕，則跳過
        if (event.target.id == `vmfive-volume-btn-${self.config.request_id}`) {
          return false;
        }

        // CTA
        setClickEventToEl(vmfiveAdContainerRight, onCtaClicked);
        setClickEventToEl(vmfiveAdContainerLeft, onCtaClicked);

        // Tracking
        self.doAcceptInvitationTracking();

        // 給予展開的container 新class
        // 新class css控制動畫
        vmfiveAdContainerEl.classList.add("expanded");
        // expand mode 控制展開的寬長
        const expandMode = self.config.expandMode;

        let eWidth, eHeight;
        switch (expandMode) {
          case "full":
            eWidth = 100;
            eHeight = 100;
            break;
          case "middle":
            eWidth = 70;
            eHeight = 70;
            break;
          default:
            eWidth = 100;
            eHeight = 100;
        }
        self.overlayView.style.height = "100%";
        vmfiveAdContainerEl.style.width = "" + eWidth + "vw";
        vmfiveAdContainerEl.style.height = "" + eHeight + "%";

        vmfiveAdContainerEl.style.maxWidth = "" + eWidth + "vw";
        vmfiveAdContainerEl.style.maxHeight = "" + eHeight + "%";

        vmfiveAdContainerLeft.style.width = "100%";
        vmfiveAdContainerRight.style.width = "100%";

        // 展開後 2欄以上 要 flex wrap
        if (vmfiveAdLayoutGrid / vmfiveAdLayoutExpand > 1) {
          vmfiveAdContainerEl.style.flexWrap = "wrap";
        }
        // vmfiveAdContainerEl.style.flexWrap  = "wrap";
        // container寬 * 倍率 * (展開前欄數/展開後欄數)
        const cHeight =
          eWidth *
          containerVHRate *
          (vmfiveAdLayoutGrid / vmfiveAdLayoutExpand);
        vmfiveAdContainerLeft.style.height = "calc(" + cHeight + "vw)";
        vmfiveAdContainerRight.style.height = "calc(100% - " + cHeight + "vw)";
      });
    } else {
      // CTA
      setClickEventToEl(self.adContainerInner, onCtaClicked);
    }

    var VMFIVE_SHOW_CLOSE_MODE_STRING = `${
      self.config["text:show_close_mode"]
    }`;

    const vmfiveCloseEl = getElById(`vmfive-close-${self.config.request_id}`);

    var trackingList = [];
    try {
      trackingList = JSON.parse(self.config.track_url);
    } catch (e) {
      console.log(e);
    }
    function findObjectByItsKeyValueInArray(array, key, value) {
      var result = {};
      array.forEach(function(item, i) {
        result = item[key] == value ? item : result;
      });
      return result;
    }

    function doTracking(url) {
      url = url.replace("[timestamp]", Date.now());
      let pixelReq = document.createElement("img");
      pixelReq.src = url;
      pixelReq.style.display = "none";
      document.body.appendChild(pixelReq);
    }

    const landingTimestamp = Date.now();
    self.doCloseTracking = function() {
      var tracking = findObjectByItsKeyValueInArray(
        trackingList,
        "event",
        "close"
      );
      if (tracking.event) {
        var url = tracking.url;
        let currentTimestamp = Date.now();
        let moreParams = {
          landing_timestamp: landingTimestamp,
          close_timestamp: currentTimestamp
        };
        url =
          url +
          "&eventValue=" +
          encodeURIComponent(currentTimestamp - landingTimestamp);
        url =
          url +
          "&eventDetails=" +
          encodeURIComponent(JSON.stringify(moreParams));
        doTracking(url);
      }
    };

    self.doImpression = function() {
      // do Google Ad Manager impression(in case OOP)
      let vm5AdUnitContainer = document.querySelector(
        `#vmfive-ad-unit-container-${self.config.request_id}`
      );
      let dfpImp = vm5AdUnitContainer.parentElement.parentElement.getAttribute(
        "dfp-imp"
      );
      if (dfpImp && dfpImp.length != 0) {
        doTracking(dfpImp);
      }

      for (let i = 0; i < trackingList.length; i++) {
        let tracking = trackingList[i];
        if (tracking && tracking.event === "impression") {
          var url = tracking.url;
          doTracking(url);
        }
      }
    };

    var checkPositionToImpressionInterval = setInterval(function() {
      var overPositionToImpression = false;
      if (geom()) {
        try {
          // NOTE 判斷 SafeFrame 位置
          overPositionToImpression = geom().pos.t < 0;
        } catch (e) {
          console.log(e);
        }
      } else if (self.adContainerView) {
        overPositionToImpression =
          self.adContainerView.getBoundingClientRect().top < window.innerHeight;
      }

      if (overPositionToImpression && self.config.enableImpression) {
        self.doImpression();
        clearInterval(checkPositionToImpressionInterval);
      }
    }, 200);

    function geom() {
      if (
        window.$sf &&
        window.$sf.ext &&
        window.$sf.ext.geom &&
        typeof window.$sf.ext.geom === "function" &&
        typeof window.$sf.ext.geom() === "object"
      ) {
        return window.$sf.ext.geom();
      }
    }

    vmfiveCloseEl.addEventListener("click", function() {
      if (vmfiveAdContainerEl.classList.contains("expanded")) {
        self.overlayView.style.height = "auto";
        vmfiveAdContainerEl.style.width = unexpandedWH.width;
        vmfiveAdContainerEl.style.height = unexpandedWH.height;

        vmfiveAdContainerEl.style.maxWidth = unexpandedWH.maxWidth;
        vmfiveAdContainerEl.style.maxHeight = unexpandedWH.maxHeight;

        self.adContainerRight.style.width = "50%";
        self.adContainerLeft.style.width = "50%";

        self.adContainerRight.style.height = "100%";
        self.adContainerLeft.style.height = "100%";
      } else {
        self.overlayView.parentElement.removeChild(self.overlayView);
        self.doCloseTracking();
      }
    });

    self.doSimpleCustomTracking = function(eventSubtype, moreParams) {
      moreParams = moreParams ? moreParams : {};
      var tracking = findObjectByItsKeyValueInArray(
        trackingList,
        "event",
        "custom"
      );
      if (tracking.event) {
        var url = tracking.url;
        url = url + "&eventSubtype=" + encodeURIComponent(eventSubtype);
        url =
          url +
          "&eventDetails=" +
          encodeURIComponent(JSON.stringify(moreParams));
        url = moreParams.eventValue
          ? url + "&eventValue=" + encodeURIComponent(moreParams.eventValue)
          : url;
        doTracking(url);
      }
    };

    self.doAcceptInvitationTracking = function() {
      self.doSimpleCustomTracking("testNewTracking", {
        eventValue: 1 // interact index
      });
    };

    const VMFIVE_BANNER_IS_EMBEDDED =
      `${self.config["text:embedded"]}` === `true`;
    const VMFIVE_BANNER_TOP_OFFSET_STR = `${
      self.config["text:banner_top_offset"]
    }`;
    const VMFIVE_BANNER_TOP_OFFSET =
      isNaN(VMFIVE_BANNER_TOP_OFFSET_STR) ||
      VMFIVE_BANNER_TOP_OFFSET_STR.length === 0
        ? "unset"
        : +VMFIVE_BANNER_TOP_OFFSET_STR;
    const VMFIVE_BANNER_BOTTOM_OFFSET_STR = `${
      self.config["text:banner_bottom_offset"]
    }`;
    const VMFIVE_BANNER_BOTTOM_OFFSET =
      isNaN(VMFIVE_BANNER_BOTTOM_OFFSET_STR) ||
      VMFIVE_BANNER_BOTTOM_OFFSET_STR.length === 0
        ? 0
        : +VMFIVE_BANNER_BOTTOM_OFFSET_STR;

    if (VMFIVE_BANNER_IS_EMBEDDED) {
      self.overlayView.style.position = "unset";
      if (VMFIVE_SHOW_CLOSE_MODE_STRING.length === 0) {
        VMFIVE_SHOW_CLOSE_MODE_STRING = "hidden";
      }
    }

    self.overlayView.style.top = VMFIVE_BANNER_TOP_OFFSET + "px";
    if (isNaN(VMFIVE_BANNER_TOP_OFFSET)) {
      self.overlayView.style.bottom = VMFIVE_BANNER_BOTTOM_OFFSET + "px";
    } else {
      self.overlayView.style.bottom = "unset";
      vmfiveCloseEl.style.top = "unset";
      vmfiveCloseEl.style.bottom = "0";
      vmfiveCloseEl.style.transform = "translateY(100%)";

      self.isModeBannerTop = true;
    }

    self.overlayView.style.visibility = "unset";
    const vmfiveLogoEl = getElById(`vmfive-logo-${self.config.request_id}`);

    if (VMFIVE_SHOW_CLOSE_MODE_STRING !== "hidden") {
      vmfiveCloseEl.style.visibility = "unset";
    }

    if (VMFIVE_SHOW_CLOSE_MODE_STRING === "fadein") {
      vmfiveCloseEl.classList.add("fadein");
    } else {
      vmfiveCloseEl.style.opacity = "1";
    }

    vmfiveLogoEl.style.display = self.config.enableLogo ? "block" : "none";

    let callbacks =
      self.config.onprepared && Array.isArray(self.config.onprepared)
        ? self.config.onprepared
        : [];
    callbacks.forEach(function(callback) {
      if (typeof callback === "function") {
        callback(self);
      }
    });

    function setClickEventToEl(el, clickevent) {
      (el,
      fn => {
        el.addEventListener("click", fn);
      })(clickevent);
    }
    function removeClickEventToEl(el, clickevent) {
      (el,
      fn => {
        el.removeEventListener("click", fn);
      })(clickevent);
    }
  }

  get baseTemplate() {
    let self = this;

    // 不同的版型編號給予不同的insert Html
    function getLayout(type) {
      let layouts = {
        1: `<div id="vmfive-container-inner-${self.config.request_id}"></div>`,
        2: `<div id="vmfive-container-left-${self.config.request_id}"></div>
              <div id="vmfive-container-right-${
                self.config.request_id
              }"></div>`,
        default: `<div id="vmfive-container-inner-${
          self.config.request_id
        }"></div>`
      };
      return layouts[type] || layouts["default"];
    }
    let insertHtml = getLayout(self.config.layoutGrid);

    let gridHtml =
      `
      <div id="vmfive-overlay-${self.config.request_id}">
        <div id="vmfive-ad-container-${self.config.request_id}">
        ` +
      insertHtml +
      `
          <div id="vmfive-close-${self.config.request_id}"></div>
          <div id="vmfive-logo-${
            self.config.request_id
          }" class="vmfive-info-image" onclick="window.open('https://vmfive.com/?utm_source=vmfive_ad_logo', '_blank')"></div>
        </div>
      </div>
      <img src="${self.config.downloaded_pixel}" style="display:none;">
      `;

    let gridCss = `
      <style>
      #vmfive-overlay-${self.config.request_id} {
        position:fixed;
        bottom:0;
        right:0;
        left:0;
        background-color: ${self.config.bgColor};
        z-index: 9999999;
        visibility:hidden;
      
        display: flex;
        align-items: center;
        justify-content: center;
      }
      #vmfive-ad-container-${self.config.request_id} {
        position: relative;
      
        display: flex;
        align-items: center;
        justify-content: flex-start;
      
        transition: 0.1s linear;
      }
      #vmfive-container-inner-${self.config.request_id} {
        -webkit-display: flex;
        display: flex;
        -webkit-flex-wrap: wrap;
        flex-wrap: wrap;
      }
      #vmfive-container-left-${self.config.request_id},
      #vmfive-container-right-${self.config.request_id} {
        position: relative;
        display: flex;
        width: 50%;
        height: 100%;
        top: 0;
        transition: 0.1s linear;
      }
      #vmfive-ad-container-${self.config.request_id}.noclippath {
        clip-path: unset;
        -webkit-clip-path: unset;
      }
      #vmfive-close-${self.config.request_id} {
        background-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAAACXBIWXMAAA3XAAAN1wFCKJt4AAAF3mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDE4LTAxLTMwVDE3OjE0OjUxKzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAxOC0wMS0zMFQxODoxMTozMiswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxOC0wMS0zMFQxODoxMTozMiswODowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjEiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJEb3QgR2FpbiAyMCUiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NDE0ZmI2NTYtZDQ0NS00OWYwLTlh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');
        position:absolute;background-repeat:no-repeat;background-position:center;background-size: contain;
        width:24px;height:24px;visibility:hidden;opacity:0;
        position: absolute;z-index:2;
        top:1px;right: 1px;
        // transform: translateY(-100%);
        cursor:pointer;
      }
      #vmfive-close-${self.config.request_id}.fadein {
        -webkit-animation: fadein 3s ease-in forwards;
        -webkit-animation-delay: 1s;
      
        animation: fadein 3s ease-in forwards;
        animation-delay: 1s;
      }
      #vmfive-overlay-${self.config.request_id} .vmfive-info-image {
        position:absolute;z-index:2;
        background-size:20px 20px;background-repeat:no-repeat;background-position:center;
        cursor:pointer;
      }
      #vmfive-logo-${self.config.request_id} {
        background-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAlCAYAAADFniADAAAC7UlEQVRYhc3YT4iVVRjH8c+9zpgoLcxFY2gRSX8sNIZcFO2ENIxI3NkqEIkIN20MFzXQtk1MiySF2kuoURYKgiBGEEXin0UkzUAY0kCpqeN4Wpx7mTvPe/+8770XZ36bl+fhvOd8z3nOOc/zvrWUEmzBu3gKNfdfCZcxOTEx8WMtpbQFn6C+CDBR97CvllL6Ak8vNk2LLtVSSucsTsg6KdUNB2gGZ/D3EPqqjQyhkym8hX/xIL7EI4N0OIzNfaIBpPH8dtAOhwF1Pdj/DNphGahb8n6ZGnCsKZxWnERBvfbUDPZgGsvwMV7sA+gc3sNdrMVhPNSpcbeVSvigAQRz+LoPIDjWAII/caDRf2WoY/gh+J7sEypezj/hSFWo2zgYfM/izT6hduO54Pu8MU5pqFO41mKPYkLvPdhJI433R1t8M/iuClS8a17D+j6BmlqHbcH3fVmoOfwSfK8PCNTUzmD/jDtloH6zMNYr8cyQoDbKqaipWVwpAxWT6uO6J+0Hgr2iS9u6Yl68WgbqZo9Bo142D13HSz3arwp24QS2O00rgx0hozbhM5zFC9jco/1ssAuTbge1JtjTcpna7aLdXAKmqSvBHosN2g30hIX74joulhywly6ZL3NgOR4rA1VXnPVXQ4I6HuxNMlhPKHg12Cfwx4BA0zgafPEy7Qq1Fatb7Fk5TcRNWlZ38WF4fzW2V4Fajr3Bdx7vmy9BqgAdwK/Bv0eb0HWDgjcwHnxnZNiyoZzG23LF2apx7Or0Ui2lFGumVl2Tv1T+Cv5R7JBz4kYLb/yEC3JBeFwx5GNy5RmvntJQ5Nm+o006aGiVfKxX4D95FW90aDuGT+WKoaPKQJHz4X7F6qGKxvGRLitUFYocliM4pNqX8Bp5U+9U8mu8ClRTd/ANTsorV6iH5FP1PF6R76K2p2yYUK2aw+/yyt2Sc+nDeNTC0reSRuSw9PuTYxk29Dt4B6W6/AdtKelyHZNyabIUdA+TtaX4z/N/WVG1ilVDUhAAAAAASUVORK5CYII=');
        display:none;
        bottom:0;right:0;
        width:18px;height:18px;
        background-color: ${self.config.logoBgColor};
      }
      
      @keyframes fadein {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      
      @-webkit-keyframes fadein {
        0% { opacity: 0;}
        100% { opacity: 1;}
      }
      </style>
      `;
    let innerHTML = gridHtml + gridCss;
    return innerHTML;
  }
}

export function Container(options) {
  return new BannerContainer(options);
}
