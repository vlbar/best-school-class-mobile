import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';

import Text from '../../components/common/Text';
import Container from '../../components/common/Container';
import Header from '../../components/navigation/Header';
import { getCurrentLanguage, useTranslation } from '../../utils/Internationalization';
import IconButton from '../../components/common/IconButton';
import Color from '../../constants';
import ModalTrigger from '../../components/common/ModalTrigger';
import BottomPopup from '../../components/common/BottomPopup';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Sort from '../../components/common/Sort';
import GroupSelect from '../../components/groups/GroupSelect';
import { ProfileContext } from '../../navigation/NavigationConstants';
import Button from '../../components/common/Button';
import HorizontalMenu from '../../components/common/HorizontalMenu';
import HomeworkList from '../../components/homeworks/HomeworkList';
import { HOMEWORKS_DETAILS_SCREEN } from './HomeworkDetails';
import { types } from '../../components/state/State';
import { INTERVIEW_SCREEN } from './Interview';

export const HOMEWORKS_SCREEN = 'homeworks';

function Homeworks({ navigation }) {
  const { translate } = useTranslation();
  const { state } = useContext(ProfileContext);
  const currentLanguage = getCurrentLanguage();
  const [orderBy, setOrderBy] = useState('openingDate-asc');
  const [isFirstTab, setIsFirstTab] = useState(true);

  const orders = useMemo(() => {
    return {
      'openingDate-asc': translate('homeworks.sortBy.newest'),
      'openingDate-desc': translate('homeworks.sortBy.oldest'),
    };
  }, [currentLanguage]);

  function onDetailsPress(homework) {
    navigation.navigate({
      name: state == types.STUDENT ? INTERVIEW_SCREEN : HOMEWORKS_DETAILS_SCREEN,
      params: {
        homeworkId: homework.id,
      },
    });
  }

  return (
    <>
      <Header
        title={translate('homeworks.title')}
        canBack={false}
        headerRight={
          <ModalTrigger>
            {({ show, open, close }) => {
              return (
                <>
                  {show && (
                    <BottomPopup title={translate('common.filters.title')} onClose={close}>
                      <ScrollView contentContainerStyle={styles.container}>
                        <Sort orders={orders} value={orderBy} onSelect={setOrderBy} />
                        <GroupSelect roles={[state]} />
                        <View style={styles.filterHeader}>
                          <Pressable>
                            <Text color={Color.silver} fontSize={16}>
                              {translate('common.filters.cancel-all')}
                            </Text>
                          </Pressable>
                          <Button title={translate('common.filters.apply')} style={styles.apply} />
                        </View>
                      </ScrollView>
                    </BottomPopup>
                  )}
                  <IconButton name="filter-outline" color={Color.darkGray} onPress={open} />
                </>
              );
            }}
          </ModalTrigger>
        }
      />

      <HorizontalMenu style={styles.container}>
        <HorizontalMenu.Item title={translate('homeworks.current')} onPress={() => setIsFirstTab(true)}>
          <HomeworkList
            onSelect={onDetailsPress}
            containerStyles={styles.homeworkContainer}
            active={isFirstTab}
            role={state.name}
            order={'openingDate-desc'}
          />
        </HorizontalMenu.Item>
        <HorizontalMenu.Item title={translate('homeworks.previous')} onPress={() => setIsFirstTab(false)}>
          <HomeworkList
            onSelect={onDetailsPress}
            containerStyles={styles.homeworkContainer}
            active={!isFirstTab}
            role={state.name}
            order={'openingDate-asc'}
          />
        </HorizontalMenu.Item>
      </HorizontalMenu>
    </>
  );
}

export default Homeworks;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  homeworkContainer: {
    paddingHorizontal: 20,
  },
  bandageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  bandage: {
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 999,
    textAlign: 'center',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  apply: {
    minWidth: 120,
    paddingHorizontal: 10,
  },
});
