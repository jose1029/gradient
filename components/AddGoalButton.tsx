import React from 'react'
import {Text, TouchableOpacity} from 'react-native'
import {useNavigation} from '@react-navigation/native'
import style from '../lib/style'
import {createStyleSheet} from '../lib/util'

const styles = createStyleSheet({
  ...style,
  addGoalButton: {
    alignSelf: 'center',
    backgroundColor: '#F2F2F3',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  addGoalButtonText: {
    ...style.text,
    fontWeight: '500',
  },
})

const AddGoalButton = () => {
  const navigation = useNavigation()

  const onPress = () => {
    navigation.navigate('AddGoal')
  }

  return (
    <TouchableOpacity style={styles.addGoalButton} onPress={onPress}>
      <Text style={styles.addGoalButtonText}>+ New Goal</Text>
    </TouchableOpacity>
  )
}

export default AddGoalButton
