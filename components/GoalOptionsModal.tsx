import React, {useEffect, useState} from 'react'
import {Dimensions, Text, TouchableOpacity, View} from 'react-native'
import Modal from 'react-native-modal'
import analytics from '@segment/analytics-react-native'
import style from '../lib/style'
import {color, createStyleSheet} from '../lib/util'
import {GoalOptionsData} from '../types'

const styles = createStyleSheet({
  ...style,
  menuItem: {
    padding: 20,
    paddingRight: 40,
  },
  menuItemSeparator: {
    marginHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: color('gray', 0.4),
  },
})

type GoalOptionsModalProps = {
  data: GoalOptionsData | null
  onEditGoal: () => void
  onReorderGoals: () => void
  onClose: () => void
}

const GoalOptionsModal = ({
  data,
  onEditGoal,
  onReorderGoals,
  onClose,
}: GoalOptionsModalProps) => {
  const [isHiding, toggleHiding] = useState(false)

  useEffect(() => {
    if (data) {
      analytics.track('Goal Options Opened', {
        goalId: data?.goal.id,
        goalName: data?.goal.name,
        goalColor: data?.goal.color,
        metricCount: data?.goal.metrics.length,
      })

      toggleHiding(false)
    }
  }, [data])

  const handleClose = () => {
    toggleHiding(true)
  }

  const windowHeight = Dimensions.get('window').height

  const isAbove = (data?.measurement?.y ?? 0) > windowHeight * 0.67

  return (
    <Modal
      isVisible={!!data && !isHiding}
      onBackdropPress={handleClose}
      onModalHide={onClose}
      style={styles.modalViewContainer}
      animationIn="fadeIn"
      animationOut="fadeOut"
      animationInTiming={200}
      animationOutTiming={150}
      backdropOpacity={0.2}
      hideModalContentWhileAnimating>
      <View
        style={
          data?.measurement
            ? {
                ...styles.modalView,
                position: 'absolute',
                top: isAbove ? undefined : data.measurement.y,
                bottom: isAbove
                  ? windowHeight -
                    data.measurement.y -
                    data.measurement.height +
                    5
                  : undefined,
                right: 0,
                borderRadius: 20,
                paddingHorizontal: 0,
                paddingVertical: 2.5,
                shadowColor: color('black'),
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,
                elevation: 3,
              }
            : {
                display: 'none',
              }
        }>
        <TouchableOpacity style={styles.menuItem} onPress={onEditGoal}>
          <Text>Edit Goal</Text>
        </TouchableOpacity>
        <View style={styles.menuItemSeparator} />
        <TouchableOpacity style={styles.menuItem} onPress={onReorderGoals}>
          <Text>Reorder Goals</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

export default GoalOptionsModal
