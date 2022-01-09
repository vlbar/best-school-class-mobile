import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Bandage from '../../components/common/Bandage';
import Container from '../../components/common/Container';
import HorizontalMenu from '../../components/common/HorizontalMenu';
import Text from '../../components/common/Text';
import MessageList from '../../components/interviews/MessageList';
import Header from '../../components/navigation/Header';
import { getTaskTypeColor } from '../../components/tasks/TaskList';
import Avatar from '../../components/user/Avatar';
import User from '../../components/user/User';
import UserName from '../../components/user/UserName';
import Color from '../../constants';
import { HomeworkContext } from '../../navigation/main/HomeworksNavigationConstants';
import { ProfileContext } from '../../navigation/NavigationConstants';
import { useTranslation } from '../../utils/Internationalization';

export const INTERVIEW_SCREEN = 'interview';
export default function Interview({ route }) {
  const { translate } = useTranslation();
  const { user } = useContext(ProfileContext);
  const { interviews, tasks } = useContext(HomeworkContext);
  const [interview, setInterview] = useState(null);

  useEffect(() => {
    const interviewId = route.params.interviewId;
    setInterview(interviews.find(i => i.id === interviewId));
  }, [route]);

  return (
    <>
      <Header>
        {interview && (
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
            <MessageList
              fetchLink={interview?.link('interviewMessages')}
              messageCreateLink={interview?.link('interviewMessages')}
              currentUser={user}
            />
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
