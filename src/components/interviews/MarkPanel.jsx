import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import NumericInput from 'react-native-numeric-input';
import ProgressBar from 'react-native-progress/Bar';
import Color from '../../constants';
import Link from '../../utils/Hateoas/Link';
import { useTranslation } from '../../utils/Internationalization';
import Button from '../common/Button';
import Check from '../common/Check';
import Container from '../common/Container';
import Text from '../common/Text';
import Avatar from '../user/Avatar';

export default function MarkPanel({ total, result, evaluator, max, withActions, disabled, onMarkPress, loading }) {
  const { translate } = useTranslation();

  const isCompleteInfo = total != null && max != null;

  return (
    <View>
      <View style={styles.container}>
        <View style={styles.progress}>
          <View style={styles.total}>
            <Text style={styles.totalText}>{translate('homeworks.interview.total')}:</Text>
            {isCompleteInfo && (
              <Text weight="medium" style={styles.totalNumber}>
                {total}/{max}
              </Text>
            )}
          </View>
          <ProgressBar
            progress={isCompleteInfo ? total / max : 0}
            width={null}
            indeterminate={loading}
            height={8}
            unfilledColor={'#DBDBDB'}
            borderWidth={0}
          />
        </View>
      </View>
      <View style={[(result != null || withActions) && styles.resultContainer]}>
        {result != null && (
          <View style={[styles.result, styles.fistingContainer]}>
            <Text style={styles.markedText}>{translate('homeworks.interview.result')}:</Text>

            <View style={styles.container}>
              <Text weight="medium" style={styles.mark}>
                {result}
              </Text>
              {evaluator && <Avatar email={evaluator.email} size={35} />}
            </View>
          </View>
        )}
        {withActions && (
          <View style={[{ flexGrow: 1, marginTop: 20 }, styles.fistingContainer]}>
            <View>
              <Button
                disabled={disabled}
                title={translate(`homeworks.interview.${result != null ? 'remarkAction' : 'markAction'}`)}
                onPress={onMarkPress}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

export function MarkForm({ total, max, onMark, markHref }) {
  const { translate } = useTranslation();

  const [result, setResult] = useState(total ?? 0);
  const [closed, setClosed] = useState(true);
  const [loading, setLoading] = useState(false);

  function handleMark() {
    const mark = { result, closed };
    new Link(markHref).put(mark, setLoading).then(() => {
      onMark?.(mark);
    });
  }

  return (
    <Container>
      <View style={formStyles.row}>
        <Text>{translate('homeworks.interview.mark.result')}</Text>

        <NumericInput
          value={result}
          onChange={value => {
            if (value > max) value = total;
            setResult(Number(value.toFixed?.(2)));
          }}
          minValue={0}
          maxValue={max}
          rounded
          editable={!loading}
          valueType="real"
          separatorWidth={0}
        />
      </View>
      <View style={formStyles.row}>
        <Text>{translate('homeworks.interview.mark.closeAction')}</Text>
        <Check checked={closed} onChange={setClosed} type="switch" disabled={loading} />
      </View>
      <View style={formStyles.row}>
        <View style={{ flexGrow: 1 }}>
          <Button
            disabled={loading}
            title={!loading && translate('homeworks.interview.markAction')}
            onPress={handleMark}
            right={loading && <ActivityIndicator size={25} color={Color.white} />}
          />
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fistingContainer: {
    marginHorizontal: 10,
  },
  resultContainer: {
    marginHorizontal: -10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  result: {
    marginTop: 20,
    flexGrow: 1,
    backgroundColor: '#E6E6E6',
    borderRadius: 12,
    padding: 8,
    paddingLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progress: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  total: {
    marginBottom: 10,
    flexDirection: 'row',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalText: {
    color: Color.gray,
    fontSize: 15,
  },
  markedText: {
    color: Color.gray,
  },
  mark: {
    marginHorizontal: 10,
    fontSize: 24,
  },
});

const formStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
