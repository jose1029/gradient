import React, {useEffect, useState} from 'react'
import {Text, View, TouchableOpacity} from 'react-native'
import {useSafeArea} from 'react-native-safe-area-context'
import {RouteProp} from '@react-navigation/native'
import DraggableFlatList, {
  DragEndParams,
  RenderItemParams,
} from 'react-native-draggable-flatlist'
import {StackNavigationProp} from '@react-navigation/stack'
import ReorderGoalItem from '../components/ReorderGoalItem'
import style from '../lib/style'
import {db, Goal} from '../lib/database'
import {color, createStyleSheet} from '../lib/util'
import {NavigationStackParamList} from '../types'

const styles = createStyleSheet({
  ...style,
  cancelButton: {
    alignSelf: 'center',
    backgroundColor: '#F2F2F3',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
  },
  cancelButtonText: {
    ...style.text,
  },
  saveButton: {
    alignSelf: 'center',
    backgroundColor: color('purple'),
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 20,
  },
  saveButtonText: {
    ...style.text,
    color: color('white'),
  },
})

type ReorderGoalsProps = {
  navigation: StackNavigationProp<NavigationStackParamList, 'ReorderGoals'>
  route: RouteProp<NavigationStackParamList, 'ReorderGoals'>
}

const ReorderGoals = ({navigation, route}: ReorderGoalsProps) => {
  const [goals, setGoals] = useState<Goal[]>([])

  useEffect(() => {
    setGoals(route.params.goals.map((goal) => goal))
  }, [route.params.goals])

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    } else {
      navigation.navigate('Root')
    }
  }

  const onSave = () => {
    db()?.write(() => {
      goals.forEach((goal, index) => {
        // eslint-disable-next-line no-param-reassign
        goal.order = index
      })
    })
    goBack()
  }

  const onDragEnd = (params: DragEndParams<Goal>) => {
    setGoals(params.data)
  }

  const renderHeader = () => (
    <View
      style={{
        ...styles.headerContainer,
        marginBottom: 30,
      }}>
      <TouchableOpacity style={styles.cancelButton} onPress={goBack}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
      <Text style={styles.headerText}>Reorder Goals</Text>
      <TouchableOpacity style={styles.saveButton} onPress={onSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  )

  const renderGoal = ({item: goal, drag}: RenderItemParams<Goal>) => (
    <ReorderGoalItem goal={goal} onDrag={drag} />
  )

  return (
    <View
      style={{
        ...styles.safeAreaView,
        paddingTop: useSafeArea().top || 10,
        paddingHorizontal: 10,
      }}>
      <DraggableFlatList
        style={{
          ...styles.scrollView,
          paddingHorizontal: 10,
        }}
        contentContainerStyle={styles.scrollViewContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        data={goals}
        onDragEnd={onDragEnd}
        ListHeaderComponent={renderHeader}
        renderItem={renderGoal}
        keyExtractor={(item) => item.id}
      />
    </View>
  )
}

export default ReorderGoals
