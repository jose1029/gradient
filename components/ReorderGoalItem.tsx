import React, {memo} from 'react'
import {Text, TouchableWithoutFeedback, View} from 'react-native'
import style from '../lib/style'
import {color, createStyleSheet, goalDisplayName} from '../lib/util'
import {Goal} from '../lib/database'
import ReorderIcon from '../assets/images/reorder.svg'

const styles = createStyleSheet({
  ...style,
  goalContainer: {
    flexGrow: 1,
    flexDirection: 'row',
    padding: 15,
    marginBottom: 15,
    borderRadius: 15,
  },
})

type GoalProps = {
  goal: Goal
  onDrag: () => void
}

const ReorderGoalItem = memo(({goal, onDrag}: GoalProps) => (
  <View
    style={{
      ...styles.goalContainer,
      backgroundColor: color(goal.color),
    }}>
    <TouchableWithoutFeedback
      onPressIn={onDrag}
      hitSlop={{
        bottom: 15,
        left: 20,
        right: 20,
        top: 15,
      }}>
      <View>
        <ReorderIcon width={36} height={36} fill={color('white')} />
      </View>
    </TouchableWithoutFeedback>
    <Text
      style={{
        ...styles.textSemibold,
        color: color('white'),
        fontSize: 18,
        lineHeight: 36,
        marginLeft: 10,
      }}
      numberOfLines={1}>
      {goalDisplayName(goal)}
    </Text>
  </View>
))

export default ReorderGoalItem
