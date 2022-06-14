import React, { useRef, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import cumwave from '../../assets/images/cumwave.png';
import Color from '../../constants';
import useIsKeyboardShow from '../../utils/useIsKeyboardShow';
import Text from '../common/Text';
import Header from '../navigation/Header';

export default function CumView({ children, title, scrollOnKeyboard = true }) {
  const titleY = useRef(0);
  const [fullHeader, setFullHeader] = useState(false);

  const scrollRef = useRef();
  const isKeyboardShow = useIsKeyboardShow();

  useEffect(() => {
    if(scrollOnKeyboard && isKeyboardShow) 
      scrollRef.current?.scrollToEnd({animated: true});
  }, [isKeyboardShow]) 

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

      <ScrollView ref={scrollRef} onScroll={handleScroll} contentContainerStyle={styles.container}>
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
    flexGrow: 1
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
