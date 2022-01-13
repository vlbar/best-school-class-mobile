import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Bandage from '../../components/common/Bandage';
import Container from '../../components/common/Container';
import HorizontalMenu from '../../components/common/HorizontalMenu';
import Text from '../../components/common/Text';
import MessageList from '../../components/interviews/MessageList';
import Header from '../../components/navigation/Header';
import { types } from '../../components/state/State';
import { getTaskTypeColor } from '../../components/tasks/TaskList';
import Avatar from '../../components/user/Avatar';
import UserName from '../../components/user/UserName';
import Color from '../../constants';
import { HomeworkContext } from '../../navigation/main/HomeworksNavigationConstants';
import { ProfileContext } from '../../navigation/NavigationConstants';
import Link from '../../utils/Hateoas/Link';
import { useTranslation } from '../../utils/Internationalization';

const HOMEWORK_URL = 'v1/homeworks';
const fetchLink = new Link(HOMEWORK_URL);

export const INTERVIEW_SCREEN = 'interview';
export default function Interview({ route }) {
  const { translate } = useTranslation();
  const { user, state } = useContext(ProfileContext);
  const { interviews, tasks, setTasks, homework, setHomework } = useContext(HomeworkContext);
  const [interview, setInterview] = useState(undefined);

  const interviewId = route.params.interviewId;

  useEffect(() => {
    return () => {
      if (state == types.STUDENT) {
        setTasks([]);
        setHomework(null);
      }
    };
  }, []);

  useEffect(() => {
    if (state == types.STUDENT) {
      const homeworkId = route.params.homeworkId;
      fetchLink.withPathTale(homeworkId).fetch().then(setHomework);
    } else {
      const interviewId = route.params.interviewId;
      const savedInterview = interviews.find(i => i.id === interviewId);
      if (savedInterview) setInterview(savedInterview);
      else homework.link('interviews').withPathTale(interviewId).fetch(setInterview);
    }
  }, [route]);

  useEffect(() => {
    if (homework && state == types.STUDENT) {
      homework
        .link('myInterview')
        .fetch()
        .then(setInterview)
        .catch(() => setInterview(null));
      setTasks(homework.tasks);
    }
  }, [homework]);

  function handleMessage(message) {
    if (interview == null) {
      if (state == types.STUDENT) homework.link('myInterview').fetch().then(setInterview);
    } else if (interview.inactive) {
      interview.link().fetch().then(setInterview);
    }
  }

  return (
    <>
      <Header title={state == types.STUDENT && translate('homeworks.details.title')}>
        {interview && state != types.STUDENT && (
          <>
            <Avatar email={interview.interviewer.email} size={30}></Avatar>
            <UserName user={interview.interviewer} numberOfLines={1} style={styles.nameStyle} />
          </>
        )}
      </Header>
      <Container>
        <HorizontalMenu>
          <HorizontalMenu.Item title={translate('homeworks.interview.tasks')}>
            {tasks &&
              tasks.map(task => {
                return (
                  <View key={task.id}>
                    <View style={styles.titleRow}>
                      <Text weight="medium" style={styles.title} numberOfLines={1}>
                        {task.name}
                      </Text>
                      {task.taskType && (
                        <View style={styles.badge}>
                          <Bandage color={getTaskTypeColor(task.taskType.id)} title={task.taskType.name} />
                        </View>
                      )}
                    </View>

                    <Text style={styles.description} numberOfLines={1}>
                      {task.description?.length ? task.description : translate('homeworks.interview.taskNoDesctiption')}
                    </Text>
                  </View>
                );
              })}
          </HorizontalMenu.Item>
          <HorizontalMenu.Item title={translate('homeworks.interview.messages')}>
            {interview != null && (
              <MessageList
                fetchLink={interview?.link('interviewMessages')}
                messageCreateLink={interview?.link('interviewMessages')}
                currentUser={user}
                tasks={tasks}
                onMessageCreate={handleMessage}
              />
            )}
            {interview === null && (
              <MessageList
                messageCreateLink={homework
                  .link('interviews')
                  .withPathTale(interviewId ?? user.id)
                  .withPathTale('messages')}
                currentUser={user}
                tasks={tasks}
                onMessageCreate={handleMessage}
              />
            )}
          </HorizontalMenu.Item>
        </HorizontalMenu>
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  nameStyle: {
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 10,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    marginRight: 10,
    paddingBottom: 5,
  },
  badge: {
    paddingBottom: 5,
  },
  description: {
    color: Color.silver,
    fontSize: 14,
  },
});
