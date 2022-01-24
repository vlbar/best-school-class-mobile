import React from 'react';
import { SafeAreaView } from 'react-native';
import CumView from '../../components/auth/CumView';
import Container from '../../components/common/Container';
import LanguageSelector from '../../components/internationalization/LanguageSelector';
import { getI } from '../../utils/Internationalization';

export const LANGUAGE_SELECT_SCREEN = 'languageSelect';

export default function LanguageSelect() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CumView title={getI('languageSelect.title')}>
        <Container>
          <LanguageSelector />
        </Container>
      </CumView>
    </SafeAreaView>
  );
}
