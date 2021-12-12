import React from 'react';

import Container from '../../../components/common/Container';
import Header from '../../../components/navigation/Header';
import { translate } from '../../../utils/Internationalization';
import LanguageSelector from './../../../components/internationalization/LanguageSelector';

export const CHANGE_LANGUAGE_SCREEN = 'ChangeLanguage';
function ChangeLanguage() {
  return (
    <>
      <Header title={translate('profile.settings.change-language.title')} />
      <Container>
          <LanguageSelector />
      </Container>
    </>
  );
}

export default ChangeLanguage;
