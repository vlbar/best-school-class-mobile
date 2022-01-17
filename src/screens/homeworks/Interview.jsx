import React, { useContext, useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, StyleSheet, View } from 'react-native';
import Bandage from '../../components/common/Bandage';
import BottomPopup from '../../components/common/BottomPopup';
import Container from '../../components/common/Container';
import HorizontalMenu from '../../components/common/HorizontalMenu';
import IconButton from '../../components/common/IconButton';
import Text from '../../components/common/Text';
import HomeworkInfo from '../../components/homeworks/HomeworkInfo';
import MarkPanel, { MarkForm } from '../../components/interviews/MarkPanel';
import MessageList from '../../components/interviews/MessageList';
import { StatusBadge } from '../../components/interviews/StatusBadge';
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
  const { interviews, setInterviews, tasks, setTasks, homework, setHomework } = useContext(HomeworkContext);

  const [interview, setInterview] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [showMarkPopup, setShowMarkPopup] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const maxWorkScore = useMemo(() => {
    if (tasks.length == 0) return null;
    return tasks.map(task => task.maxScore).reduce((a, b) => a + b, 0);
  }, [tasks]);

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
    if (state === types.STUDENT) {
      const homeworkId = route.params.homeworkId;
      fetchLink.withPathTale(homeworkId).fetch().then(setHomework);
    } else {
      const interviewId = route.params.interviewId;
      const savedInterview = interviews.find(i => i.interviewer.id === interviewId);
      if (savedInterview) setInterview(savedInterview);
      if (!savedInterview?.full) {
        homework
          .link('interviews')
          .withPathTale(interviewId)
          .fetch(setLoading)
          .then(interview => {
            let newInterviews = [...interviews];
            const savedIndex = interviews.findIndex(i => i.interviewer.id === interviewId);
            newInterviews[savedIndex] = { ...interview, full: true };
            setInterviews(newInterviews);
          });
      }
    }
  }, [route, interviews]);

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

  function handleMark(mark) {
    let newInterviews = [...interviews];
    const savedIndex = interviews.findIndex(i => i == interview);
    newInterviews[savedIndex] = { ...interview, ...mark, evaluator: user };
    setInterviews(newInterviews);
    setShowMarkPopup(false);
  }

  return (
    <>
      <Header
        title={state == types.STUDENT && translate('homeworks.details.title')}
        headerRight={
          state != types.STUDENT ? (
            <IconButton name="ribbon-outline" color={Color.black} onPress={() => setShowMarkPopup(true)} />
          ) : (
            <IconButton name="document-text-outline" color={Color.black} onPress={() => setShowDetailsModal(true)} />
          )
        }
      >
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
            <FlatList
              data={tasks}
              renderItem={({ item: task }) => {
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
              }}
            />

            <View style={styles.markContainer}>
              <MarkPanel
                result={interview?.result}
                evaluator={interview?.evaluator}
                total={0}
                max={maxWorkScore}
                withActions={state != types.STUDENT}
                onMarkPress={() => setShowMarkPopup(true)}
              />
            </View>
          </HorizontalMenu.Item>
          <HorizontalMenu.Item title={translate('homeworks.interview.messages')}>
            {interview != null && (
              <MessageList
                fetchLink={interview?.link('interviewMessages')}
                messageCreateLink={interview?.link('interviewMessages')}
                currentUser={user}
                tasks={tasks}
                closed={interview?.closed}
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
      {showMarkPopup && (
        <BottomPopup onClose={() => setShowMarkPopup(false)} title={translate('homeworks.interview.mark.title')}>
          <MarkForm
            total={interview?.result}
            max={maxWorkScore}
            onMark={handleMark}
            markLink={interview?.link('changeMark')}
          />
        </BottomPopup>
      )}
      {state == types.STUDENT && homework && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showDetailsModal}
          onRequestClose={() => setShowDetailsModal(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <Text weight="medium" style={styles.modalTitle}>
                  {translate('homeworks.info')}
                </Text>
                <IconButton name="close" onPress={() => setShowDetailsModal(false)} style={styles.modalClose} />
              </View>
              <HomeworkInfo homework={homework} />
            </View>
          </View>
        </Modal>
      )}
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
  markContainer: {
    marginBottom: 10,
  },

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000AA',
  },
  modalView: {
    minHeight: 200,
    width: '80%',
    marginHorizontal: 40,
    backgroundColor: Color.white,
    borderRadius: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  modalTitle: {
    textAlign: 'center',
    paddingVertical: 10,
    color: Color.black,
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    right: 0,
    padding: 0,
  },
});
