import React, { useContext, useEffect, useMemo, useState } from 'react';
import { FlatList, TouchableNativeFeedback, StyleSheet, View, ActivityIndicator } from 'react-native';
import Bandage from '../../components/common/Bandage';
import BottomPopup from '../../components/common/BottomPopup';
import Container from '../../components/common/Container';
import HorizontalMenu from '../../components/common/HorizontalMenu';
import IconButton from '../../components/common/IconButton';
import Modal from '../../components/common/Modal';
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
import Resource from '../../utils/Hateoas/Resource';
import { useTranslation } from '../../utils/Internationalization';
import { TASK_ANSWER_SCREEN } from './TaskAnswer';

const HOMEWORK_URL = 'v1/homeworks';
const fetchLink = new Link(HOMEWORK_URL);

export const INTERVIEW_SCREEN = 'interview';
export default function Interview({ navigation, route }) {
  const { translate } = useTranslation();
  const { user, state } = useContext(ProfileContext);
  const {
    interviews,
    setInterviews,
    tasks,
    setTasks,
    homework,
    setHomework,
    answers,
    setAnswers,
    onAnswer,
    setOnAnswer,
  } = useContext(HomeworkContext);

  const [interview, setInterview] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [showMarkPopup, setShowMarkPopup] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const maxWorkScore = useMemo(() => {
    if (tasks.length == 0) return null;
    return tasks.map(task => task.maxScore).reduce((a, b) => a + b, 0);
  }, [tasks]);
  const totalScore = useMemo(() => {
    return answers?.map(answer => answer.score).reduce((a, b) => a + b, 0);
  }, [answers]);

  const interviewId = route.params.interviewId;

  const memoComp = useMemo(() => {
    if (!interview) return;

    return (
      <MessageList
        fetchHref={interview?.link('interviewMessages').href}
        messageCreateHref={interview?.link('interviewMessages').href}
        currentUser={user}
        tasks={tasks}
        onAnswer={handleAnswer}
        onAnswerPress={goToAnswer}
        onInterviewClosed={handleClosedInterivew}
        closed={interview?.closed ?? null}
        onMessageCreate={handleMessage}
      />
    );
  }, [interview, user, tasks]);

  useEffect(() => {
    setOnAnswer(() => handleMessage);
    return () => {
      if (state === types.STUDENT) {
        setTasks([]);
        setHomework(null);
      }
      setAnswers(null);
    };
  }, []);

  useEffect(() => {
    if (state === types.STUDENT) {
      if (interview && interview.full) setInterview(interviews.find(i => i.id === interview.id));

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
          .fetch()
          .then(interview => {
            updateInterview({ ...interview, full: true });
          })
          .catch(() => {
            setLoading(false);
          });
      }
    }
  }, [route, interviews]);

  useEffect(() => {
    if (homework && state == types.STUDENT) {
      homework
        .link('myInterview')
        .fetch()
        .then(interview => setInterview({ ...interview, full: true }))
        .catch(() => {
          const interviewLink = homework.link('interviews').withPathTale(user.id);
          setInterview(
            Resource.basedList(
              {
                undefined: interviewLink,
                interviewMessages: interviewLink.withPathTale('messages'),
              },
              { id: user.id },
            ),
          );
          setLoading(false);
        });
      setTasks(homework.tasks);
    }
  }, [homework]);

  useEffect(() => {
    if (interview?.full && answers == null) {
      interview
        .link('interviewMessages')
        ?.fill('type', 'ANSWER')
        .fetch(setLoading)
        .then(page => setAnswers(page.list('messages') ?? []));
    }
  }, [interview]);

  function handleMessage(message) {
    if (!message) return;

    interview
      .link()
      ?.fetch()
      .then(interview => setInterview({ ...interview, full: true }));
  }

  function handleMark(mark) {
    updateInterview({ ...interview, ...mark, evaluator: user });

    setShowMarkPopup(false);
  }

  function handleAnswer(answer) {
    setAnswers([...(answers?.filter(a => a.taskId !== answer.taskId) ?? []), answer]);
  }

  function handleClosedInterivew() {
    updateInterview({ ...interview, closed: true });
  }

  function updateInterview(newInterview) {
    const newInterviews = interviews.map(interview => {
      if (interview.id == newInterview.id) return newInterview;
      return interview;
    });
    setInterviews(newInterviews);
  }

  function goToAnswer({ interviewId, taskId }) {
    if (state == types.STUDENT) setInterviews([interview]);
    navigation.navigate(TASK_ANSWER_SCREEN, { interviewId: interview.id, taskId: taskId });
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
      <HorizontalMenu style={{ marginHorizontal: 20 }}>
        <HorizontalMenu.Item title={translate('homeworks.interview.tasks')}>
          {!loading && (
            <Container>
              <FlatList
                fadingEdgeLength={30}
                data={tasks}
                renderItem={({ item: task }) => {
                  const answer = answers?.find(a => a.taskId == task.id);
                  return (
                    <TouchableNativeFeedback
                      disabled={!answer && state != types.STUDENT}
                      onPress={() => goToAnswer({ interviewId: interview.id, taskId: task.id })}
                    >
                      <View style={{ paddingVertical: 10 }}>
                        <View style={styles.titleRow}>
                          <View style={{ flexDirection: 'row' }}>
                            {answer && (
                              <View style={{ marginRight: 5 }}>
                                <StatusBadge status={answer.answerStatus} size={25} />
                              </View>
                            )}
                            <Text weight="medium" style={styles.title} numberOfLines={1}>
                              <Text>{task?.name}</Text>
                            </Text>
                          </View>
                          {task?.taskType && (
                            <View style={styles.badge}>
                              <Bandage color={getTaskTypeColor(task?.taskType.id)} title={task?.taskType.name} />
                            </View>
                          )}
                        </View>

                        <Text style={styles.description} numberOfLines={1}>
                          {task?.description?.length
                            ? task?.description
                            : translate('homeworks.interview.taskNoDesctiption')}
                        </Text>
                      </View>
                    </TouchableNativeFeedback>
                  );
                }}
              />
              <View style={styles.markContainer}>
                <MarkPanel
                  result={interview?.result}
                  evaluator={interview?.evaluator}
                  total={totalScore}
                  max={maxWorkScore}
                  withActions={state != types.STUDENT}
                  onMarkPress={() => setShowMarkPopup(true)}
                />
              </View>
            </Container>
          )}
          {loading && (
            <View style={{ flexGrow: 1, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size={50} color={Color.primary} />
            </View>
          )}
        </HorizontalMenu.Item>
        <HorizontalMenu.Item title={translate('homeworks.interview.messages')}>
          {interview?.full && memoComp}
          {!interview?.full && (
            <MessageList
              messageCreateHref={
                homework
                  ?.link('interviews')
                  .withPathTale(interviewId ?? user.id)
                  .withPathTale('messages').href
              }
              currentUser={user}
              tasks={tasks}
              onMessageCreate={handleMessage}
            />
          )}
        </HorizontalMenu.Item>
      </HorizontalMenu>
      {showMarkPopup && (
        <BottomPopup onClose={() => setShowMarkPopup(false)} title={translate('homeworks.interview.mark.title')}>
          <MarkForm
            total={interview?.result}
            max={maxWorkScore}
            onMark={handleMark}
            markHref={interview?.link('changeMark').href}
          />
        </BottomPopup>
      )}
      {state == types.STUDENT && homework && (
        <Modal title={translate('homeworks.info')} show={showDetailsModal} onClose={() => setShowDetailsModal(false)}>
          <HomeworkInfo homework={homework} />
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
});
