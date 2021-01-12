import React from 'react'
import {Image, ScrollView, Text, TouchableOpacity, View} from 'react-native'
import Modal from 'react-native-modal'
import {useSafeArea} from 'react-native-safe-area-context'
import style from '../lib/style'
import {color, createStyleSheet} from '../lib/util'
import HeaderImage from '../assets/images/goal-instructions.png'
import InfoIcon from '../assets/images/info-btn.svg'

const styles = createStyleSheet({
  ...style,
  instructions: {
    marginTop: 20,
  },
  instructionsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  instructionsIcon: {
    flexShrink: 1,
    marginRight: 15,
  },
  instructionsText: {
    ...style.text,
    fontSize: 15,
    lineHeight: 20,
    flexShrink: 1,
  },
})

type AddGoalInstructionsProps = {
  isVisible: boolean
  onClose: () => void
}

const AddGoalInstructions = ({
  isVisible,
  onClose,
}: AddGoalInstructionsProps) => {
  const insets = useSafeArea()

  return (
    <Modal
      isVisible={isVisible}
      style={{
        ...styles.modalViewContainer,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      onBackdropPress={onClose}
      hideModalContentWhileAnimating>
      <View style={styles.modalViewFull}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContainer}
          keyboardShouldPersistTaps="handled">
          <View
            style={{
              ...styles.titleContainerCenter,
              marginTop: 30,
              marginBottom: 15,
            }}>
            <Image source={HeaderImage} />
          </View>
          <View style={styles.titleContainerCenter}>
            <Text
              style={{
                ...styles.titleCenter,
                ...styles.textBold,
                fontSize: 24,
              }}>
              Adding Goals
            </Text>
          </View>
          <View style={styles.instructions}>
            <View style={styles.instructionsItem}>
              <InfoIcon
                style={styles.instructionsIcon}
                width={24}
                height={24}
                fill={color('green', 0.9)}
              />
              <Text style={styles.instructionsText}>
                Goals organize our vision for the future into manageable
                segments.
              </Text>
            </View>
            <View style={styles.instructionsItem}>
              <InfoIcon
                style={styles.instructionsIcon}
                width={24}
                height={24}
                fill={color('blue', 0.9)}
              />
              <Text style={styles.instructionsText}>
                Goals should be open-ended, without quantitative targets or
                units.
              </Text>
            </View>
          </View>
          <View
            style={{
              ...styles.inputGroup,
              paddingBottom: 30,
            }}>
            <TouchableOpacity
              style={{
                ...styles.ctaButtonShort,
                backgroundColor: '#F2F2F3',
              }}
              onPress={onClose}>
              <Text
                style={{
                  ...styles.ctaButtonText,
                  color: color('black'),
                }}>
                Got It!
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  )
}

export default AddGoalInstructions
