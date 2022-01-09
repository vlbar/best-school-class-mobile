import React, { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import Container from '../../components/common/Container';
import IconButton from '../../components/common/IconButton';
import Text from '../../components/common/Text';
import { GroupItem } from '../../components/groups/GroupSelect';
import HomeworkDate from '../../components/homeworks/HomeworkDate';
import InterviewList from '../../components/interviews/InterviewList';
import Header from '../../components/navigation/Header';
import UserName from '../../components/user/UserName';
import Color from '../../constants';
import { HomeworkContext } from '../../navigation/main/HomeworksNavigationConstants';
import Link from '../../utils/Hateoas/Link';
import { useTranslation } from '../../utils/Internationalization';
import { INTERVIEW_SCREEN } from './Interview';

const HOMEWORK_URL = 'v1/homeworks';
export const HOMEWORKS_DETAILS_SCREEN = 'homeworkDetails';

export default function HomeworkDetails({ route, navigation }) {
  const { translate } = useTranslation();
  const [isInfoShow, setIsInfoShow] = useState(false);
  const [homework, setHomework] = useState(null);
  const { interviews, setInterviews, setTasks } = useContext(HomeworkContext);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomework(new Link(`${HOMEWORK_URL}/${route.params.homeworkId}`));
  }, [route]);

  useEffect(() => {
    if (homework) homework.link('creator').fetch(setLoading).then(setCreator);
  }, [homework]);

  function fetchHomework(link) {
    link
      .fetch()
      .then(homework => {
        setHomework(homework);
        setTasks(homework.tasks);
      })
      .catch(() => setLoading(false));
  }

  function toggleInfo() {
    setIsInfoShow(!isInfoShow);
  }

  function onDetailsPress(interview) {
    navigation.navigate({
      name: INTERVIEW_SCREEN,
      params: {
        interviewId: interview.id,
      },
    });
  }

  return (
    <>
      <Header title={translate('homeworks.details.title')} />
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator color={Color.primary} size={50} />
        </View>
      )}
      {!loading && homework && creator && (
        <Container>
          <InterviewList
            fetchLink={homework.link('interviews')}
            interviews={interviews}
            setInterviews={setInterviews}
            onSelect={onDetailsPress}
            withInactive={homework.link('group')}
            ListHeaderComponent={
              <>
                <TouchableOpacity onPress={toggleInfo}>
                  <View style={styles.row}>
                    <Text style={styles.headerText}>{translate('homeworks.details.info.title')}</Text>
                    <IconButton size={20} name={`caret-${isInfoShow ? 'down' : 'back'}-outline`} disabled />
                  </View>
                </TouchableOpacity>
                <Collapsible collapsed={!isInfoShow}>
                  <View style={styles.row}>
                    <Text>{translate('homeworks.details.info.group')}</Text>
                    <View style={styles.infoContainer}>
                      <GroupItem group={homework.group} textStyle={[styles.infoText, { flex: 0 }]} />
                    </View>
                  </View>
                  <View style={styles.row}>
                    <Text>{translate('homeworks.details.info.appointed')}</Text>
                    <View style={styles.infoContainer}>
                      <UserName user={creator} style={styles.infoText} numberOfLines={1} />
                    </View>
                  </View>
                  <View style={styles.row}>
                    <Text>{translate('homeworks.details.info.deadline')}</Text>
                    <View style={[styles.row, styles.infoContainer, { flexWrap: 'wrap' }]}>
                      <HomeworkDate style={styles.infoText} date={homework.openingDate} />
                      <HomeworkDate style={styles.infoText} until date={homework.endingDate} />
                    </View>
                  </View>
                </Collapsible>
                <View style={styles.row}>
                  <Text style={styles.headerText}>{translate('homeworks.details.members.title')}</Text>
                  <IconButton name="filter-outline" color={Color.darkGray} />
                </View>
              </>
            }
          />
        </Container>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  headerText: {
    fontSize: 15,
  },

  infoContainer: {
    marginLeft: 40,
    flex: 1,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: Color.silver,
    marginLeft: 3,
    textAlign: 'right',
  },
  loading: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
