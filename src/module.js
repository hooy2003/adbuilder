import { Container } from "../src/js/BannerContainer.js";
import { tetrisImg } from "../src/js/tetris.js";

export function custom_container() {
  let requestId = "55667788";
  let trackings =
    '[{"event":"view","url":"https://vaser-track.vm5apis.com/v2/track?requestId=&placementId=&campaignId=&audienceGroupId=&creativeId=&timezone=8&creativeFormat=richmedia&pixel=1&x=0&event=view"},\
  {"event":"impression","url":"https://vaser-track.vm5apis.com/v2/track?requestId=&placementId=&campaignId=&audienceGroupId=&creativeId=&timezone=8&creativeFormat=richmedia&pixel=1&x=0&event=impression"},\
  {"event":"click","url":"https://vaser-track.vm5apis.com/v2/track?requestId=&placementId=&campaignId=&audienceGroupId=&creativeId=&timezone=8&creativeFormat=richmedia&pixel=1&x=0&event=click"},\
  {"event":"close","url":"https://vaser-track.vm5apis.com/v2/track?requestId=&placementId=&campaignId=&audienceGroupId=&creativeId=&timezone=8&creativeFormat=richmedia&pixel=1&x=0&event=close"},\
  {"event":"custom","url":"https://vaser-track.vm5apis.com/v2/track?requestId=&placementId=&campaignId=&audienceGroupId=&creativeId=&timezone=8&creativeFormat=richmedia&pixel=1&x=0&event=custom"}]';

  return Container({
    request_id: requestId,
    track_url: trackings,

    downloaded_pixel:
      "https://vaser-track.vm5apis.com/v2/track?requestId=&event=downloaded&placementId=&campaignId=&audienceGroupId=&creativeId=&timezone=8&creativeFormat=richmedia&pixel=1&x=0",
    "text:cta_in_new_window": "",
    dfp_url: "",
    cta_prefix_url:
      "https://vaser-track.vm5apis.com/v2/track?requestId=&placementId=&campaignId=&audienceGroupId=&creativeId=&timezone=8&creativeFormat=richmedia&pixel=1&x=0&event=click",
    "cta:default": "https://vmfive.com/?utm_source=vmfive_ad_cta",

    "text:embedded": ``,
    "text:show_close_mode": `fadein`,
    // 'text:height_ratio': `2`,
    //  'text:background_color': `#00000080`,

    bannerRatio: "32:10",

    enableExpand: false,
    layoutGrid: 1,

    onctaclicked: [
      function(comp, data) {
        console.log(data);
      }
    ],
    onclosed: [
      function() {
        console.log("closed");
      }
    ]
  });
}
// cobtainer, options, callback
export function custom_tetris(vmfiveAdUnitContainer, demoOp, playAnimation) {
  return tetrisImg({
    el: vmfiveAdUnitContainer.adContainerInner,
    request_id: vmfiveAdUnitContainer.request_id,
    "image:image1": demoOp.image,

    bannerRatio: demoOp.bannerRatio,

    columns: demoOp.columns,
    rows: demoOp.rows,

    onBackgroundImageOnLoad: [
      function(el, option) {
        playAnimation(el, option);
      }
    ]
  });
}

export function anime_timeline(blockList) {
  let screenHeight = screen.height;
  let anime_timeline = null;
  anime_timeline = anime.timeline({
    loop: false
  });
  anime_timeline
    .add({
      targets: [blockList[13], blockList[25], blockList[37], blockList[38]],
      duration: 350,
      easing: "easeInQuad",
      translateY: [-screenHeight, 0]
    })
    .add({
      targets: [blockList[35], blockList[46], blockList[47], blockList[48]],
      duration: 300,
      easing: "easeInQuad",
      translateY: [-screenHeight, 0]
    })
    .add({
      targets: [blockList[31], blockList[43], blockList[44], blockList[45]],
      duration: 250,
      easing: "easeInQuad",
      translateY: [-screenHeight, 0]
    })
    .add({
      targets: [blockList[28], blockList[29], blockList[40], blockList[41]],
      duration: 200,
      easing: "easeInQuad",
      translateY: [-screenHeight, 0]
    })
    .add({
      targets: [blockList[12], blockList[23], blockList[24], blockList[36]],
      duration: 200,
      easing: "easeInQuad",
      translateY: [-screenHeight, 0]
    })
    .add({
      targets: [blockList[17], blockList[18], blockList[30], blockList[42]],
      duration: 100,
      easing: "easeInQuad",
      translateY: [-screenHeight, 0]
    })
    .add({
      targets: [blockList[15], blockList[26], blockList[27], blockList[39]],
      duration: 100,
      easing: "easeInQuad",
      translateY: [-screenHeight, 0]
    })
    .add({
      targets: [blockList[9], blockList[21], blockList[32], blockList[33]],
      duration: 100,
      easing: "easeInQuad",
      translateY: [-screenHeight, 0]
    })
    .add({
      targets: [blockList[7], blockList[8], blockList[19], blockList[20]],
      duration: 100,
      easing: "easeInQuad",
      translateY: [-screenHeight, 0]
    })
    .add({
      targets: [blockList[10], blockList[11], blockList[22], blockList[34]],
      duration: 100,
      easing: "easeInQuad",
      translateY: [-screenHeight, 0]
    })
    .add({
      targets: [blockList[4], blockList[5], blockList[6], blockList[16]],
      duration: 100,
      easing: "easeInQuad",
      translateY: [-screenHeight, 0]
    })
    .add({
      targets: [blockList[1], blockList[2], blockList[3], blockList[14]],
      duration: 100,
      easing: "easeInQuad",
      translateY: [-screenHeight, 0]
    });
  return anime_timeline;
}
