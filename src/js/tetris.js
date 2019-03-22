class TetrisImg {
  constructor(options) {
    let request_id =
      options.request_id && options.request_id.trim() != ""
        ? options.request_id
        : "[request_id]";

    // default settings
    this.defaultConfig = {
      el: `#vmfive-ad-unit-container-${request_id}`,
      request_id: request_id,
      "image:image1": `[image:image1]`,
      // 'image:foreground_image': `[image:foreground_image]`,
      // richmedia_bg_offset_top_percentage: 15,
      enableExpand: true,

      onBackgroundImageOnLoad: [],
      bannerRatio: "32:9",

      columns: 5,
      rows: 5
    };

    this.config = {
      ...this.defaultConfig,
      ...options
    };
    console.log("tetris el", this.config.el);
    // check selector
    this.config.el =
      typeof this.config.el === "string"
        ? document.querySelector(this.config.el)
        : this.config.el;
    if (this.config.el === null) {
      throw new Error("Something wrong with your el param");
    }

    this.config.el.insertAdjacentHTML("beforeend", this.template);

    // init
    let self = this;
    this.rootView = this.config.el;
    this.containerBlock = this.rootView.querySelector(
      `#vmfive-ad-container-${self.config.request_id} .block`
    );
    this.init();
  }

  init() {
    console.log("can run tetrisJs");
    let self = this;
    let onBackgroundImageOnLoad = function(e) {
      var img = self.containerBlock,
        style = img.currentStyle || window.getComputedStyle(img, false),
        url = style.backgroundImage.slice(4, -1).replace(/"/g, "");

      var img = new Image();
      img.src = url;
      if (img.complete) {
        docallback();
      } else {
        img.onload = function() {
          docallback();
        };
      }
      function docallback() {
        let callbacks =
          self.config.onBackgroundImageOnLoad &&
          Array.isArray(self.config.onBackgroundImageOnLoad)
            ? self.config.onBackgroundImageOnLoad
            : [];
        const rows = self.config.rows;
        const columns = self.config.columns;

        callbacks.forEach(function(callback) {
          if (typeof callback === "function") {
            callback(self, {
              e,
              rows,
              columns
            });
          }
        });
      }
    };
    onBackgroundImageOnLoad();
  }

  get template() {
    let self = this;
    // Compute tetris range
    let columns = self.config.columns;
    let rows = self.config.rows;
    let BLOCKS_TOTAL_RANGE = columns * rows;
    let newContainer = document.createElement("div");
    let blockDiv;

    let widhtPercent = 100 / columns;
    let bannerHeightRate =
      +self.config.bannerRatio.split(":")[1] /
      +self.config.bannerRatio.split(":")[0];
    let screenWidth = self.config.el.getBoundingClientRect().width;
    let heightPx = (screenWidth * bannerHeightRate) / rows;

    for (let i = 1; i <= BLOCKS_TOTAL_RANGE; i++) {
      blockDiv = document.createElement("div");
      blockDiv.className = `block block${i}`;

      let offsetX, offsetY;
      offsetX = (((i - 1) % columns) * screenWidth) / columns;
      offsetY = heightPx * Math.floor((i - 1) / columns);
      blockDiv.style.backgroundPosition = `-${offsetX}px -${offsetY}px`;

      newContainer.insertAdjacentHTML("beforeend", blockDiv.outerHTML);
    }

    let innerHTML = `
      	${newContainer.innerHTML}

      <style>
      #vmfive-ad-container-${self.config.request_id} .block {
        text-align: center;
        display: inline-block;
        width: ${widhtPercent}%;
        height: ${heightPx}px;
        margin: 0;
				background: url('${self.config["image:image1"]}') no-repeat bottom;
				background-size: ${screenWidth}px;

        -webkit-transform: translateY(-100vh);
        -moz-transform: translateY(-100vh);
        -o-transform: translateY(-100vh);
        -ms-transform: translateY(-100vh);
        transform: translateY(-100vh);
      }
      </style>
      `;

    return innerHTML;
  }
}

export function tetris(options) {
  return new TetrisImg(options);
}
