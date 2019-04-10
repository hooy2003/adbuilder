const TAG = "Moat";

/*Copyright (c) 2011-2016 Moat Inc. All Rights Reserved.*/
function initMoatTracking(a,c,d,h,k){var f=document.createElement("script"),b=[];c={adData:{ids:c,duration:d,url:k},dispatchEvent:function(a){this.sendEvent?(b&&(b.push(a),a=b,b=!1),this.sendEvent(a)):b.push(a)}};d="_moatApi"+Math.floor(1E8*Math.random());var e,g;try{e=a.ownerDocument,g=e.defaultView||e.parentWindow}catch(l){e=document,g=window}g[d]=c;f.type="text/javascript";a&&a.insertBefore(f,a.childNodes[0]||null);f.src="https://z.moatads.com/"+h+"/moatvideo.js#"+d;return c};

class Moat {
    constructor(ids) {
        this.mMoatApi = null;
        this.mIds = ids;
        this.mPartnerCode = ids && ids.partnerCode ? ids.partnerCode : "vmfivevideo146526825008";

        this.mIsEnabled = false;
    }

    init(div, duration, url) {
        if (this.mIsEnabled) {
            this.mMoatApi = initMoatTracking(div, this.mIds, duration, this.mPartnerCode, url);
        }
    }

    sendEvent(eventName, volume) {
        if (!this.mMoatApi) return;
        if (!this.mIsEnabled) return;

        this.mMoatApi.dispatchEvent({
            "type": eventName,
            "adVolume": volume
        });
    }

    setEnabled(isEnabled) {
        this.mIsEnabled = isEnabled;
    }

    isEnabled() {
        return this.mIsEnabled;
    }
}

export default Moat;
