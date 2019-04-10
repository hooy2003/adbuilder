import MixPlayer from "./MixPlayer";
class Video {
    constructor(options) {
      let request_id = options.request_id && options.request_id.trim() != '' ? options.request_id : '[request_id]';
        
      // default settings
        this.defaultConfig = {
          el: `#vmfive-ad-unit-container-${request_id}`,
          'request_id': request_id,
          'track_url': '[track_url]',
          'video:video1:mp4': `[video:video1:mp4]`,
          'video:video1:m3u8': `[video:video1:m3u8]`,
  
          'image:cover': `[image:cover]`,
          'text:3rd_party_track_url': '[text:3rd_party_track_url]',
  
          videoScale: '16:9',
          videoBorderRadius: 0,
          disableAutoplay: false,
          videoLoop: false, // Video infinity loop
          onresize: [],
          onprepared: [],
          onplayed: [],
          onfinished: [],
        };
  
        this.config = {
            ...this.defaultConfig,
            ...options,
        };
  
        // check selector
        this.config.el = typeof this.config.el === 'string' ? document.querySelector(this.config.el) : this.config.el
        if (this.config.el === null) {
            throw new Error('Something wrong with your el param');
        }
        this.config.el.insertAdjacentHTML('beforeend', this.template);
  
        // bind events
        this.initData = this.initData.bind(this);
  
        // init
        let self = this;
        this.data = this.initData(this.config);
        this.rootView = this.config.el;
        this.videoContainerView = this.rootView.querySelector(`#vmfive-ad-unit-${self.config.request_id}`);
        this.videoView = null;
        this.init();
    }
  
    initData(config) {
      let { el, videoScale } = config;
      let elWidth, videoHeight;
  
      try {
        elWidth = el.getBoundingClientRect().width /2;
        videoHeight = elWidth * (+videoScale.split(':')[1] / +videoScale.split(':')[0])
      } catch (e) {
        console.log(e);
        elWidth = el.getBoundingClientRect().width;
        videoHeight = elWidth * (9 / 16)
      }
  
      return {
        ...config,
        elWidth,
        elHeight: videoHeight,
        viewHeight: (window.innerHeight || document.documentElement.clientHeight),
        videoHeight
      }
    }
  
    init() {
      let self = this;
  
      function getElById(elId) {return self.rootView.querySelector(`#${elId}`);};
  
      const source = `{"mp4": "${self.config['video:video1:mp4']}", "m3u8": "${self.config['video:video1:m3u8']}"}`;
      const vmfiveAdUnitEl = getElById(`vmfive-ad-unit-${self.config.request_id}`);
  
      if (self.config['video:video1:mp4'] === '' && self.config['video:video1:m3u8'] === '') {
        getElById(`vmfive-volume-btn-${self.config.request_id}`).style.display = 'none';
  
        getElById(`vmfive-overlay-${self.config.request_id}`).style.visibility = 'unset';
        const vmfiveLogoEl = getElById(`vmfive-logo-${self.config.request_id}`);
        vmfiveLogoEl.style.display = 'block';
  
        console.log('No Video Source');
        return;
      }
  
      function getTrackingList(trackings) {
        let trackingList = [];
        try {
          trackingList = JSON.parse(trackings);
        } catch (e) {
          console.log(e);
        }
        return trackingList;
      }
  
      function get3rdPartyTrackingList() {
        let thirdPartyTrackUrl = '', thirdPartyTrackUrlStr = '', thirdPartyTrackigList = [];
        try {
          thirdPartyTrackUrlStr = eval(`${self.config['text:3rd_party_track_url']}`+"''");
          thirdPartyTrackUrl = '[' +
          thirdPartyTrackUrlStr +
          'null'+
          ']';
          thirdPartyTrackigList = JSON.parse(thirdPartyTrackUrl);
          thirdPartyTrackigList.pop(); // pop dummy null object
        } catch (e) {
          console.log(e);
        }
        return thirdPartyTrackigList;
      }
  
      let trackings = `${self.config['track_url']}`;
      let thirdPartyTrackingList = get3rdPartyTrackingList();
      if (thirdPartyTrackingList.length > 0) {
        let trackingList = [...getTrackingList(trackings), ...thirdPartyTrackingList];
        trackings = JSON.stringify(trackingList);
      }
  
      let width = 0;
      let height = 0;
      var mix = self.initMixPlayer({vmfiveAdUnitEl, source, trackings, width, height});
  
      if (! self.config.disableAutoplay) {
        mix.percentageInViewPort(vmfiveAdUnitEl, 50);
      }
  
      const vmfiveCoverImageEl = self.rootView.querySelector('.vmfive-video-cover');
      const vmfiveVolumeButtonEl = self.rootView.querySelector(`#vmfive-volume-btn-${self.config.request_id}`);
      const coverUrl = self.config['image:cover'];
      if (coverUrl && coverUrl != '') {
        vmfiveCoverImageEl.src = coverUrl;
      } else {
        vmfiveCoverImageEl.style.display = 'none';
      }
  
      mix.onPlayed = function() {
        vmfiveVolumeButtonEl.style.display = 'block';
  
        let callbacks = self.config.onplayed && Array.isArray(self.config.onplayed) ? self.config.onplayed : [];
        callbacks.forEach(function (callback) {
          if (typeof callback === 'function') {
            callback(self);
          }
        });
      }
  
      mix.onFinished = function() {
  
        if (self.mix && self.mix.handler.vpaidApi) {
          // NOTE VPAID cases
         self.mix.vastPlayer.tryInitVPAID();// loop? todo
        }
  
        let callbacks = self.config.onfinished && Array.isArray(self.config.onfinished) ? self.config.onfinished : [];
        callbacks.forEach(function (callback) {
          if (typeof callback === 'function') {
            callback(self);
          }
        });
      };
  
      mix.onPrepared = function() {
          if (self.onPreparedInitialized) {
            return;
          }
          self.onPreparedInitialized = true;
  
          if (self.mix && self.mix.handler.vpaidApi) {
            // NOTE VPAID cases
            // Do nothing
          } else if (!self.config.videoLoop) {
            // If config loop is false, setLoop false
            this.player.setLoop(false);
          } else {
            // NOTE Common cases
            this.player.setLoop(true);
          }
  
          function isInlineVideo(videoTag) {return videoTag.tagName === 'VIDEO';};
  
          const vm5AdVideoTag = vmfiveAdUnitEl.querySelector('video') || vmfiveAdUnitEl.querySelector('canvas');
          self.videoView = vm5AdVideoTag;
  
          vm5AdVideoTag.style.flex = '1';
          vm5AdVideoTag.style.width = '100%';
          vm5AdVideoTag.setAttribute('height', 'none');
          vm5AdVideoTag.setAttribute('width', 'none');
  
          vmfiveAdUnitEl.style.transform = 'translate(0, 0)';
  
          addElClickEvent(getElById(`vmfive-volume-btn-${self.config.request_id}`), function(isInlineVideo) {
              if (this.player.isMuted()) {
                  this.player.unmute();
                  getElById(`vmfive-volume-btn-${self.config.request_id}`).classList.add('unmute');
              } else {
                  this.player.mute();
                  getElById(`vmfive-volume-btn-${self.config.request_id}`).classList.remove('unmute');
              }
  
          }.bind(this, isInlineVideo(vm5AdVideoTag)));
  
          let callbacks = self.config.onprepared && Array.isArray(self.config.onprepared) ? self.config.onprepared : [];
          callbacks.forEach(function (callback) {
            if (typeof callback === 'function') {
              callback(self);
            }
          });
  
      };
  
      function addElClickEvent(el, fn) {el.addEventListener('click', fn);};
  
    }
  
    initMixPlayer(options) {
      let {vmfiveAdUnitEl, source, trackings, width, height} = options;
  
      var mix = new MixPlayer(vmfiveAdUnitEl, source, trackings, width, height, {
            'advertiser': this.config['text:moatjs_advertiser'],
            'partnerCode': this.config['text:moatjs_partner_code'],
            'campaignId': this.config['text:moatjs_campaign_id'],
            'audienceGroupId': this.config['text:moatjs_audience_group_id'],
            'creativeId': this.config['text:moatjs_creative_id'],
            'appKey': this.config['text:moatjs_app_key'],
            'placementId': this.config['text:moatjs_placement_id'],
            'moat_url': this.config['text:moatjs_moat_url'],
            'view_time': this.config['text:view_time'],
      });
      this.mix = mix;
  
      return mix;
    }
  
    get template() {
      let self = this;
  
      let innerHTML = `
        <div id="vmfive-ad-unit-${self.config.request_id}">
          <div id="vmfive-volume-btn-${self.config.request_id}" class="vmfive-info-image mute"></div>
        </div>
        <img class="vmfive-video-cover" src="">
  
      <style>
      #vmfive-ad-unit-${self.config.request_id} {
        position: relative;
        width: 100%;
        height: 100%;
  
        display:flex;
        align-items: center;
        justify-content: center;
  
        z-index: 1;
      }
      #vmfive-ad-unit-${self.config.request_id} video {
        border-radius: ${self.config.videoBorderRadius}px;
      }
      #vmfive-ad-container-${self.config.request_id} .vmfive-video-cover {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: auto;
        z-index: 0;
        margin: unset !important;
        background: unset !important;
        padding: unset !important;
  
        /* magic number for solving issue of the widths of video and cover image are not align */
        transform: scale(.998);
      }
      #vmfive-volume-btn-${self.config.request_id} {
        width:34px;height:28px;
        background-image:url('data:image/gif;base64,R0lGODlhPAA8AJECAAAAAP///wAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNyAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTYtMTItMjhUMTc6MjM6MzYrMDg6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMTctMDEtMTNUMDg6NTQ6MTkrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE3LTAxLTEzVDA4OjU0OjE5KzA4OjAwIiBkYzpmb3JtYXQ9ImltYWdlL2dpZiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowRjA2OEZBM0QxOTIxMUU2QkM2QUI5MTU2MkEzQ0IzMCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDowRjA2OEZBNEQxOTIxMUU2QkM2QUI5MTU2MkEzQ0IzMCIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmE1NWRiZGY5LTAxYmYtNDI2Ny1hZmQ3LTVhZDdlNGM5MWE2NSI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6YTU1ZGJkZjktMDFiZi00MjY3LWFmZDctNWFkN2U0YzkxYTY1IiBzdEV2dDp3aGVuPSIyMDE2LTEyLTI4VDE3OjIzOjM2KzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNyAoTWFjaW50b3NoKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6OGExM2VkOGMtNjM5Ny00MGQ1LWI1NmQtNjkwNzFkMjM4ZDM0IiBzdEV2dDp3aGVuPSIyMDE2LTEyLTI4VDE3OjI1OjA5KzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNyAoTWFjaW50b3NoKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6YTkxNjY2OGMtMGY3ZC00ZjhmLWIxNTYtZWZjMDIxYTRhYWNhIiBzdEV2dDp3aGVuPSIyMDE3LTAxLTEzVDE2OjQwKzA4OjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxNyAoTWFjaW50b3NoKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6YTkxNjY2OGMtMGY3ZC00ZjhmLWIxNTYtZWZjMDIxYTRhYWNhIiBzdFJlZjpkb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6NDgzODFkZGQtMTlmYS0xMTdhLWFlZmQtOTdkYjM1ZjNmZTdhIi8+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');
        background-size:20px 20px;
        filter:opacity(0.5) drop-shadow(0px 0px 2px #000);
        /* remove the style drop-shadow since it will cause the display issue in Safari when moving the element */
        -webkit-filter:opacity(0.5);
        bottom:13px;left:12px;
        display:none;
        z-index: 2;
      }
      #vmfive-volume-btn-${self.config.request_id}.unmute {
        background-image:url('data:image/png;base64,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');
        filter:none;
        -webkit-filter:none;
      }
      </style>
      `;
  
      return innerHTML;
    }
  
  }
  
  export function video(options) {
    return new Video(options);
  }
  