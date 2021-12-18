import Clipboard from '@react-native-community/clipboard';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Color from '../../../constants';
import { useTranslation } from '../../../utils/Internationalization';
import Button from '../../common/Button';
import Container from '../../common/Container';
import IconButton from '../../common/IconButton';
import Text from '../../common/Text';

export default function Invite({ invite: oldInvite, createLink, role }) {
  const { translate } = useTranslation();

  const [invite, setInvite] = useState(oldInvite);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setInvite(oldInvite);
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [oldInvite]);

  function onCopy() {
    if (copied) return;

    Clipboard.setString(invite.code);
    setCopied(true);
    timeoutRef.current = setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  function onCreate() {
    createLink?.post({ role }, setLoading).then(setInvite);
  }

  function onRemove() {
    invite
      .link()
      .remove(setLoading)
      .then(() => setInvite(null));
  }

  return (
    <View style={styles.container}>
      {invite && (
        <>
          <View style={styles.row}>
            <TouchableOpacity onPress={onCopy} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={copied ? styles.copied : styles.code}>
                {copied ? translate('groups.groupDetails.copied') : invite.code}
              </Text>
            </TouchableOpacity>

            <IconButton name="trash-outline" size={36} color={Color.danger} disabled={loading} onPress={onRemove} />
          </View>
          <Button title={translate('groups.groupDetails.createNew')} disabled={loading} onPress={onCreate} />
        </>
      )}
      {!invite && (
        <>
          <Text style={styles.notFoundText}>{translate('groups.groupDetails.noInvite')}</Text>
          <Button title={translate('groups.groupDetails.createInvite')} disabled={loading} onPress={onCreate} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  code: {
    fontSize: 30,
    textAlign: 'center',
  },
  copied: {
    color: Color.success,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  notFoundText: {
    paddingVertical: 34,
    textAlign: 'center',
  },
  removeButton: {
    backgroundColor: Color.danger,
  },
});
