
import { HIGH_RES_SOURCE_WIDTHS } from "./shared/mediaConstants.js";
import { SanityImage as initSanityImage } from "./SanityImage.js";
import { initSanityVideo } from "./SanityVideo.js";
import { initExternalVideo } from "./ExternalVideo.js";

export function initSanityMedia(parentElement, props = {}) {
  const {
    media,
    loop,
    autoPlay,
    imageProps,
    videoProps,
    externalVideoProps,
    ...rest
  } = props;

  const imageProps_ = imageProps == null ? {} : imageProps;
  const videoProps_ = videoProps == null ? {} : videoProps;
  const externalVideoProps_ = externalVideoProps == null ? {} : externalVideoProps;

  if (!media) return null;

  const {
    type,
    image,
    video,
    externalVideoUrl,
    videoOptions,
    highResolution,
    aspectRatio,
  } = media;

  const passthrough = { aspectRatio, ...rest };

  switch (type) {
    case "image": {
      const builderOptions = highResolution
        ? { sourceWidths: HIGH_RES_SOURCE_WIDTHS }
        : undefined;
      return initSanityImage(parentElement, {
        image,
        builderOptions,
        ...passthrough,
        ...imageProps_,
      });
    }
    case "video": {
      return initSanityVideo(parentElement, {
        video,
        loop,
        autoPlay,
        ...passthrough,
        ...videoOptions,
        ...videoProps_,
      });
    }
    case "externalVideo": {
      const loopResolved = loop ?? true;
      const autoPlayResolved =
        autoPlay === true || autoPlay === "in-view" || autoPlay === undefined;
      return initExternalVideo(parentElement, {
        src: externalVideoUrl,
        loop: loopResolved,
        autoPlay: autoPlayResolved,
        muted: true,
        controls: false,
        ...passthrough,
        ...externalVideoProps_,
      });
    }
    default: {
      
      console.warn(`Unsupported media type: ${type}`);
      return null;
    }
  }
}
