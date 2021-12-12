import React from 'react';
import md5 from 'md5';
import { Image } from 'react-native';

function Avatar({ email, size = 42, style }) {
  return (
    <Image
      className="rounded-circle"
      source={{
        uri: `http://cdn.libravatar.org/avatar/${md5(email)}?s=100&&d=${email ? 'identicon' : 'mm'}&&r=g`,
      }}
      style={[style, { height: size, width: size, borderRadius: size }]}
    />
  );
}

export default Avatar;
