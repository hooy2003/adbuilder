class BackgroundImage {
    constructor(options) {
        let request_id = options.request_id && options.request_id.trim() != '' ? options.request_id : '[request_id]';
  
        // default settings
        this.defaultConfig = {
            el: `#vmfive-ad-unit-container-${request_id}`,
            'request_id': request_id,
            'image:image1': `[image:image1]`,
            'image:image_expanded': `[image:image_expanded]`,
            'image:foreground_image': `[image:foreground_image]`,
            // richmedia_bg_offset_top_percentage: 15,
            enableExpand: true, 
        };
  
        this.config = {
            ...this.defaultConfig,
            ...options,
        };
        console.log("backgroundImage el", this.config.el);
        // If image_expanded is exist
        this.config['image:image_expanded'] === '[image:image_expanded]' ? this.config.enableExpand = false : this.config.enableExpand = true;
  
        // check selector
        this.config.el = typeof this.config.el === 'string' ? document.querySelector(this.config.el) : this.config.el
        if (this.config.el === null) {
            throw new Error('Something wrong with your el param');
        }

        this.config.el.insertAdjacentHTML('beforeend', this.template);
  
        // init
        let self = this;
        this.rootView = this.config.el;
        this.bgContainer = this.rootView.querySelector(`#vmfive-background-image-${self.config.request_id}`);
        this.fgContainer = this.rootView.querySelector(`#vmfive-foreground-image-${self.config.request_id}`);
    }

    get template() {
      let self = this;
      let innerHTML = `
        `+(self.config.enableExpand ? `<img style="display: none;" src="${self.config['image:image_expanded']}"></img>`:'')+`
        <div id="vmfive-background-image-${self.config.request_id}"></div> 
        <div id="vmfive-foreground-image-${self.config.request_id}"></div>

      <style>
      #vmfive-background-image-${self.config.request_id} {
        background-image:url('${self.config['image:image1']}');
        background-repeat:no-repeat;background-position:center center;
  
        /* magic number for solving issue of the widths of video and background image are not align */
        background-size:cover;
  
        flex: 1;
        height: 100%;
      }
      .expanded #vmfive-background-image-${self.config.request_id}{
        background-image:url('${self.config['image:image_expanded']}');
        background-repeat:no-repeat;background-position:center 30%;
      }
      #vmfive-foreground-image-${self.config.request_id} {
        background-image:url('${self.config['image:foreground_image']}');
        background-repeat:no-repeat;background-position:center 30%;
  
        /* magic number for solving issue of the widths of video and background image are not align */
        background-size:cover;
  
        /* flex: none; */
        position: absolute;
        height: 100%;
        width: 100%;
  
        z-index: 1;
        left: 0;
        top: 0;
      }
      </style>
      `;
  
      return innerHTML;
    }
  
  }
  
  export function backgroundImage(options) {
    return new BackgroundImage(options);
  }