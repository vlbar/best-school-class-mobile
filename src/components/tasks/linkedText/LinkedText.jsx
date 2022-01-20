import React, { useEffect, useRef, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import ImageView from 'react-native-image-viewing';

import Color from '../../../constants';
import MediaRow from './MediaRow';
import Text from '../../common/Text';
import { clearHtmlTags } from '../../../utils/TextUtils';

const MAX_LINK_LENGTH = 50;
const MAX_LINK_TITLE_LENGTH = 50;
const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
const imgRegex = /<img [^>]*src="[^"]*"[^>]*>/gm;
const urlTitleServiceLink = 'https://url-title.vercel.app/';

export const linkTypes = {
  WEBSITE: 'web',
  IMAGE: 'image',
  VIDEO: 'video',
  VIDEOHOST: 'videohost',
};

const resourceTypes = {
  image: { ext: ['jpg', 'jpeg', 'png', 'gif', 'webp'], type: linkTypes.IMAGE }, // developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
  video: { ext: ['mp4', 'mov', 'wmv', 'avi', 'flv', 'mkv'], type: linkTypes.VIDEO }, // www.adobe.com/creativecloud/video/discover/best-video-format.html
  videohost: { ext: [], root: ['youtu.be'], type: linkTypes.VIDEOHOST },
};

const resourceIcons = {
  docs: { root: ['docs.google.com/document'], icon: 'document-text-outline' },
  sheets: { root: ['docs.google.com/spreadsheets'], icon: 'grid-outline' },
  presentation: { root: ['docs.google.com/presentation'], icon: 'easel-outline' },
  vk: { root: ['vk.com'], icon: 'logo-vk' },
  tiktok: { root: ['tiktok.com'], icon: 'logo-tiktok' },
};

const DEFAULT_ICON = 'globe-outline';
const DEFAULT_TYPE = linkTypes.WEBSITE;

function LinkedText({ text, textStyle, style }) {
  const [linksCache, setLinksCache] = useState([]);

  const [displayImageIndex, setDisplayImageIndex] = useState(null);
  const [images, setImages] = useState([]);

  const [mixedTextArray, setMixedTextArray] = useState(splitText(text?.trim()));

  function addLink(link) {
    if (linksCache.find(def => def.link === link)) return;
    const newLink = initLink(link);
    setLinksCache(cache => [...cache, newLink]);

    if (newLink.type === linkTypes.IMAGE) setImages(images => [...images, { uri: link }]);
    if (newLink.type === linkTypes.WEBSITE || newLink.type === linkTypes.VIDEOHOST) {
      fetch(urlTitleServiceLink + link.replace(/^https?:\/\//, ''))
        .then(response => response.text())
        .then(shortName => {
          setLinksCache(cache => {
            cache.find(x => x.link === link).shortName = shortName;
            return [...cache];
          });
        })
        .catch(err => console.log(err));
    }
  }

  function splitText(text) {
    if (!text || !text.trim().length) return [];
    const urls = text.match(urlRegex) ?? [];
    urls.forEach(url => addLink(url));

    if (urls.length) {
      text = text.replace(imgRegex, function (img) {
        const url = img.match(urlRegex).pop();
        return `${url}`;
      });
      text = clearHtmlTags(text);
      text = text.replaceAll('*', '&#42;');
      text = text.replace(urlRegex, function (url) {
        return `*${url}*`;
      });
      const array = text.split('*');
      array.forEach(x => (x = x.replaceAll('&#42;', '*')));
      return array;
    } else {
      return [text];
    }
  }

  const onLinkClickHandler = linkDefinition => {
    if ([linkTypes.WEBSITE, linkTypes.VIDEO, linkTypes.VIDEOHOST].includes(linkDefinition.type)) {
      Linking.canOpenURL(linkDefinition.link).then(supported => {
        if (supported) Linking.openURL(linkDefinition.link);
        else console.log("Don't know how to open URI: " + linkDefinition.link);
      });
    }

    if (linkDefinition.type === linkTypes.IMAGE) {
      setDisplayImageIndex(images.findIndex(x => x.uri === linkDefinition.link));
    }
  };

  // render
  const imageViewFooter = imageIndex => {
    return (
      <Text color={Color.darkGray} style={{ textAlign: 'center' }}>
        {images[imageIndex].uri}
      </Text>
    );
  };

  return (
    <View style={[style]}>
      <Text>
        {mixedTextArray?.map((part, index) =>
          React.createElement(CustomText, {
            key: index,
            linksCache,
            content: part,
            onLinkClick: onLinkClickHandler,
            style: textStyle,
          }),
        )}
      </Text>
      <MediaRow links={linksCache} onPress={onLinkClickHandler} />
      <ImageView
        images={images}
        imageIndex={displayImageIndex}
        visible={displayImageIndex !== null}
        onRequestClose={() => setDisplayImageIndex(null)}
        swipeToCloseEnabled={false}
        FooterComponent={({ imageIndex }) => imageViewFooter(imageIndex)}
      />
    </View>
  );
}

// componets

function CustomText({ content, linksCache, onLinkClick, style }) {
  const [text, setText] = useState(
    linksCache.find(x => x.link === content) ? content.substring(0, MAX_LINK_LENGTH) + '...' : content,
  );
  const [linkDefinition, setLinkDefinition] = useState();
  const hasShortName = useRef(false);

  useEffect(() => {
    const cachedLink = linksCache.find(x => x.link === content);

    if (!hasShortName.current && cachedLink && cachedLink.shortName) {
      setText(
        cachedLink.shortName.substring(0, MAX_LINK_TITLE_LENGTH) +
          (cachedLink.shortName.length > MAX_LINK_TITLE_LENGTH ? '...' : ''),
      );
    }

    if (cachedLink && !linkDefinition) {
      setLinkDefinition(cachedLink);
      setText(content.substring(0, MAX_LINK_LENGTH) + (content.length > MAX_LINK_LENGTH ? '...' : ''));
    }
  }, [linksCache]);

  return (
    <Text onPress={() => linkDefinition && onLinkClick(linkDefinition)} style={[linkDefinition && styles.link, style]}>
      {text}
    </Text>
  );
}

// utils

function initLink(link) {
  const shortLink = shortUrl(link).replace(/(^\w+:|^)\/\//, '');
  const type = getLinkType(shortLink);
  return {
    link,
    type,
    shortName: [linkTypes.IMAGE, linkTypes.VIDEO].includes(type) && getFileName(link),
    icon: getLinkIcon(shortLink),
  };
}

function getLinkType(link) {
  const startParamsIndex = link.lastIndexOf('?');
  const linkWithoutParams = startParamsIndex > 0 ? link.substring(0, link.lastIndexOf('?')) : link;
  const linkExt = linkWithoutParams.split('.')?.pop()?.toLowerCase();

  if (linkExt) {
    for (const key in resourceTypes) {
      if (Object.hasOwnProperty.call(resourceTypes, key)) {
        const typeDefinition = resourceTypes[key];
        if (typeDefinition.ext.includes(linkExt.toLowerCase())) {
          return typeDefinition.type;
        }

        if (typeDefinition.root) {
          for (const root of typeDefinition.root) {
            if (testRegex(link, `^${root}`)) {
              return typeDefinition.type;
            }
          }
        }
      }
    }
  }

  return DEFAULT_TYPE;
}

function getLinkIcon(link) {
  for (const key in resourceIcons) {
    if (Object.hasOwnProperty.call(resourceIcons, key)) {
      const iconDefenition = resourceIcons[key];
      for (const root of iconDefenition.root) {
        if (testRegex(link, `^${root}`)) {
          return iconDefenition.icon;
        }
      }
    }
  }

  return DEFAULT_ICON;
}

function testRegex(value, regex) {
  const pattern = new RegExp(regex);
  return pattern.test(value);
}

function getFileName(link) {
  const file = link.substring(link.lastIndexOf('/') + 1);
  return file;
}

const shortUrl = url => {
  return url.replace('youtube.com/watch?v=', 'youtu.be/');
};

const styles = StyleSheet.create({
  link: {
    color: Color.primary,
    textDecorationLine: 'underline',
  },
});

export default React.memo(LinkedText);
