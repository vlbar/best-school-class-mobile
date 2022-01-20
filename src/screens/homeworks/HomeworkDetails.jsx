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
import HomeworkInfo from '../../components/homeworks/HomeworkInfo';
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
  const { homework, setHomework, interviews, setInterviews, setTasks } = useContext(HomeworkContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return () => {
      setInterviews([]);
      setTasks([]);
      setHomework(null);
    };
  }, []);

  useEffect(() => {
    fetchHomework(new Link(`${HOMEWORK_URL}/${route.params.homeworkId}`));
  }, [route]);

  function fetchHomework(link) {
    link
      .fetch(setLoading)
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
        interviewId: interview.interviewer.id,
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
      {!loading && homework && (
        <Container>
          <InterviewList
            fetchLink={homework.link('interviews')}
            interviews={interviews}
            setInterviews={setInterviews}
            onSelect={onDetailsPress}
            withInactive={new Link(homework.group._links.groupMembers.href)}
            ListHeaderComponent={
              <>
                <TouchableOpacity onPress={toggleInfo}>
                  <View style={styles.row}>
                    <Text style={styles.headerText}>{translate('homeworks.details.info.title')}</Text>
                    <IconButton size={20} name={`caret-${isInfoShow ? 'down' : 'back'}-outline`} disabled />
                  </View>
                </TouchableOpacity>
                <Collapsible collapsed={!isInfoShow}>
                  <HomeworkInfo homework={homework} />
                </Collapsible>
                <View style={styles.row}>
                  <Text style={styles.headerText}>{translate('homeworks.details.members.title')}</Text>
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
  loading: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
