import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import cumwave from '../../assets/images/cumwave.png';
import Color from '../../constants';
import Text from '../common/Text';
import Header from '../navigation/Header';

export default function CumView({ children, title }) {
  const titleY = useRef(0);
  const [fullHeader, setFullHeader] = useState(false);

  function handleTitleLayout(e) {
    titleY.current = e.nativeEvent.layout.y - e.nativeEvent.layout.height;
  }

  function handleScroll(e) {
    const scrollY = e.nativeEvent.contentOffset.y;
    setFullHeader(scrollY >= titleY.current);
  }

  return (
    <>
      <View style={[styles.header, fullHeader && { width: '100%' }]}>
        <Header backgroundColor={fullHeader ? Color.white : Color.transparent} title={fullHeader ? title : undefined} />
      </View>

      <ScrollView styles={styles.container} onScroll={handleScroll}>
        <View>
          <FastImage source={cumwave} style={styles.cumwave} />
        </View>

        <Text onLayout={handleTitleLayout} style={styles.title}>
          {title}
        </Text>
        {children}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Color.white,
    position: 'absolute',
  },
  header: {
    position: 'absolute',
    zIndex: 3,
  },
  cumwave: {
    overflow: 'hidden',
    width: '100%',
    height: 152,
    marginTop: '-15%',
    resizeMode: 'contain',
    backgroundColor: Color.background,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: Color.darkGray,
    marginVertical: 10,
  },
});
