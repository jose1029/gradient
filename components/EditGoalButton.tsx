import React from 'react'
import {Text, TouchableOpacity, View} from 'react-native'
import {useNavigation} from '@react-navigation/native'
import style from '../lib/style'
import EditIcon from '../assets/images/cta-edit.svg'
import {color, createStyleSheet} from '../lib/util'
import {Goal} from '../lib/database'

const styles = createStyleSheet({
  ...style,
  editGoalButtonContainer: {
    flexGrow: 1,
    flexBasis: 0,
  },
  editGoalButton: {
    backgroundColor: '#F2F2F3',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    alignSelf: 'flex-end',
  },
})

type EditGoalButtonProps = {
  goal: Goal
}

const EditGoalButton = ({goal}: EditGoalButtonProps) => {
  const navigation = useNavigation()

  const onPress = () => {
    navigation.navigate('EditGoal', {goal})
  }

  return (
    <View style={styles.editGoalButtonContainer}>
      <TouchableOpacity style={styles.editGoalButton} onPress={onPress}>
        <EditIcon width={14} height={16} fill={color('black-lighter')} />
        <Text
          style={{
            ...styles.text,
            fontSize: 14,
            marginLeft: 7,
          }}>
          Edit
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default EditGoalButton
