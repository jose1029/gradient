import React, {useState} from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import analytics from '@segment/analytics-react-native'
import moment from 'moment'
import {StackNavigationProp} from '@react-navigation/stack'
import {RouteProp} from '@react-navigation/native'
import style from '../lib/style'
import BackButton from '../components/BackButton'
import Spacer from '../components/Spacer'
import {color, createStyleSheet, isEmpty} from '../lib/util'
import InstructionsButton from '../components/InstructionsButton'
import AddGoalInstructions from '../components/AddGoalInstructions'
import GoalNameInput from '../components/GoalNameInput'
import {NavigationStackParamList} from '../types'

const styles = createStyleSheet(style)

type AddGoalProps = {
  navigation: StackNavigationProp<NavigationStackParamList, 'AddGoal'>
  route: RouteProp<NavigationStackParamList, 'AddGoal'>
}

const AddGoal = ({route, navigation}: AddGoalProps) => {
  const {isOnboarding} = route.params ?? {}

  const [name, onNameChange] = useState('')
  const [startTime] = useState(moment())
  const [showingInstructions, toggleShowingInstructions] = useState(
    !!isOnboarding,
  )

  const onNext = () => {
    if (isEmpty(name)) {
      return
    }

    Keyboard.dismiss()

    analytics.track('Goal Name Set', {
      timeSpent: moment().diff(startTime, 'seconds'),
      name,
    })

    navigation.navigate('AddMetrics', {goalName: name, ...route.params})
  }

  return (
    <>
      <SafeAreaView
        style={{
          ...styles.safeAreaView,
        }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.containerSpaced}>
          <View
            style={{
              ...styles.headerContainerPadded,
              flexBasis: 16,
            }}>
            <BackButton />
            <InstructionsButton
              onPress={() => {
                analytics.track('Goal Instructions Opened', {
                  timeSpent: moment().diff(startTime, 'seconds'),
                  name,
                })

                toggleShowingInstructions(true)
              }}
            />
          </View>
          <GoalNameInput
            name={name}
            onNameChange={onNameChange}
            onNext={onNext}
          />
          <Spacer />
          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={{
                ...styles.ctaButton,
                backgroundColor: isEmpty(name)
                  ? color('purple', 0.7)
                  : color('purple'),
              }}
              disabled={isEmpty(name)}
              onPress={onNext}>
              <Text style={styles.ctaButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <AddGoalInstructions
        isVisible={showingInstructions}
        onClose={() => toggleShowingInstructions(false)}
      />
    </>
  )
}

export default AddGoal
