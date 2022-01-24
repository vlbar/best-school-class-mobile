import React, { useContext, useState } from 'react';

import Header from '../../components/navigation/Header';
import { useTranslation } from '../../utils/Internationalization';
import { StyleSheet } from 'react-native';
import { ProfileContext } from '../../navigation/NavigationConstants';
import HorizontalMenu from '../../components/common/HorizontalMenu';
import HomeworkList from '../../components/homeworks/HomeworkList';
import { HOMEWORKS_DETAILS_SCREEN } from './HomeworkDetails';
import { types } from '../../components/state/State';
import { INTERVIEW_SCREEN } from './Interview';

export const HOMEWORKS_SCREEN = 'homeworks';

function Homeworks({ navigation, route }) {
  const { translate } = useTranslation();
  const { state } = useContext(ProfileContext);
  const [isFirstTab, setIsFirstTab] = useState(true);

  const groupId = route.params?.groupId;

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
        canBack={!!groupId}
        // headerRight={
        //   <ModalTrigger>
        //     {({ show, open, close }) => {
        //       return (
        //         <>
        //           {show && (
        //             <BottomPopup title={translate('common.filters.title')} onClose={close}>
        //               <ScrollView contentContainerStyle={styles.container}>
        //                 <Sort orders={orders} value={orderBy} onSelect={setOrderBy} />
        //                 <GroupSelect roles={[state]} />
        //                 <View style={styles.filterHeader}>
        //                   <Pressable>
        //                     <Text color={Color.silver} fontSize={16}>
        //                       {translate('common.filters.cancel-all')}
        //                     </Text>
        //                   </Pressable>
        //                   <Button title={translate('common.filters.apply')} style={styles.apply} />
        //                 </View>
        //               </ScrollView>
        //             </BottomPopup>
        //           )}
        //           <IconButton name="filter-outline" color={Color.darkGray} onPress={open} />
        //         </>
        //       );
        //     }}
        //   </ModalTrigger>
        // }
      />

      <HorizontalMenu style={styles.container}>
        <HorizontalMenu.Item title={translate('homeworks.current')} onPress={() => setIsFirstTab(true)}>
          <HomeworkList
            onSelect={onDetailsPress}
            containerStyles={styles.homeworkContainer}
            active={isFirstTab}
            role={state.name}
            order={'openingDate-desc'}
            groupId={groupId}
          />
        </HorizontalMenu.Item>
        <HorizontalMenu.Item title={translate('homeworks.previous')} onPress={() => setIsFirstTab(false)}>
          <HomeworkList
            onSelect={onDetailsPress}
            containerStyles={styles.homeworkContainer}
            active={!isFirstTab}
            role={state.name}
            order={'openingDate-asc'}
            groupId={groupId}
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
