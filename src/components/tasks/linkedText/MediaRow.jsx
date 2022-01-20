import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';

import Color from '../../../constants';
import Text from '../../common/Text';
import { linkTypes } from './LinkedText';

const MAX_LINK_TITLE_LENGTH = 50;

function MediaRow({ links, onPress, style }) {
  return (
    <View style={style}>
      <View style={[styles.mediaRow]}>
        {links
          .filter(x => x.type === linkTypes.IMAGE)
          .map(image => (
            <ImageItem key={image.link} linkDefinition={image} onPress={onPress} />
          ))}
        {links
          .filter(x => x.type === linkTypes.VIDEOHOST)
          .map(video => (
            <VideoItem key={video.link} linkDefinition={video} onPress={onPress} />
          ))}
      </View>
      <View style={[styles.mediaRow]}>
        {links
          .filter(x => x.type === linkTypes.WEBSITE)
          .map(site => (
            <LinkItem key={site.link} linkDefinition={site} onPress={onPress} />
          ))}
      </View>
    </View>
  );
}

function ImageItem({ linkDefinition, onPress }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => onPress?.(linkDefinition)}>
      <FastImage
        source={{
          uri: linkDefinition.link,
        }}
        onError={() => setIsFailed(true)}
        onLoadEnd={() => setIsLoaded(true)}
        style={styles.image}
      >
        {isFailed && (
          <View style={styles.flexCenter}>
            <Icon name={'alert-outline'} color={Color.danger} size={21} />
          </View>
        )}
        {!isLoaded && <ActivityIndicator color={Color.primary} size={20} style={{ width: '100%', height: '100%' }} />}
      </FastImage>
    </TouchableOpacity>
  );
}

function VideoItem({ linkDefinition, onPress }) {
  const previewUri = useRef(getVideoHostPreview(linkDefinition.link));

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => onPress?.(linkDefinition)}>
      <View style={styles.video}>
        <View style={styles.videoPlay}>
          <Icon name="play" size={32} color={'white'} />
        </View>
        <FastImage
          source={{
            uri: previewUri.current,
          }}
          LoadingIndicatorComponent={ActivityIndicator}
          style={styles.videoInner}
        />
      </View>
    </TouchableOpacity>
  );
}

function LinkItem({ linkDefinition, onPress }) {
  const displayName = linkDefinition.shortName ? linkDefinition.shortName : linkDefinition.link;
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => onPress?.(linkDefinition)}>
      <View style={styles.link}>
        <Icon name={linkDefinition.icon} size={17} color={Color.white} style={{ marginRight: 6 }} />
        <Text fontSize={15} color={Color.white} numberOfLines={1}>
          {displayName}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function getVideoHostPreview(url) {
  url = url.replace(/(^\w+:|^)\/\//, '');
  if (testRegex(url.toLowerCase(), '^youtu.be')) {
    url = url.replace('youtube.com/watch?v=', 'youtu.be/');
    const videoCode = url.substring(url.lastIndexOf('/') + 1);
    const imageUrl = `https://img.youtube.com/vi/${videoCode}/0.jpg`;
    return imageUrl;
  }
}

function testRegex(value, regex) {
  const pattern = new RegExp(regex);
  return pattern.test(value);
}

const styles = StyleSheet.create({
  mediaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  image: {
    resizeMode: 'cover',
    width: 60,
    height: 60,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: Color.ultraLightPrimary,
  },
  itemLoading: {
    position: 'absolute',
    zIndex: 10,
  },
  video: {
    resizeMode: 'cover',
    width: 90,
    height: 60,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: Color.ultraLightPrimary,
    overflow: 'hidden',
  },
  videoInner: {
    width: '120%',
    height: '120%',
    margin: -6,
  },
  videoPlay: {
    position: 'absolute',
    top: 14,
    left: 30,
    zIndex: 10,
  },
  link: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Color.silver,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 4,
    marginRight: 10,
  },
  flexCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
  },
});

export default MediaRow;
