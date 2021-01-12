import React, {useState, useEffect} from 'react'
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
  Keyboard,
} from 'react-native'
import Modal from 'react-native-modal'
import {useSafeArea} from 'react-native-safe-area-context'
import style from '../lib/style'
import OptionButton from './OptionButton'
import {color, createStyleSheet, isEmpty} from '../lib/util'
import WeightSlider from './WeightSlider'
import {Metric} from '../lib/database'
import {MetricDetails} from '../types'

const styles = createStyleSheet({
  ...style,
  weightLabel: {
    ...style.textSemibold,
    color: color('purple'),
    textAlign: 'center',
    marginVertical: 10,
  },
})

type MetricModalProps = {
  goalColor: string
  metric: Metric | null
  onSave: (metricDetails: MetricDetails) => void
  onDelete: () => void
  onHide: () => void
}

const MetricModal = ({
  goalColor,
  metric,
  onSave,
  onDelete,
  onHide,
}: MetricModalProps) => {
  const insets = useSafeArea()

  const [name, onNameChange] = useState(metric?.name ?? '')
  const [isSnapshot, toggleSnapshot] = useState(metric?.isSnapshot ?? false)
  const [isDecreasing, toggleDecreasing] = useState(
    metric?.isDecreasing ?? false,
  )
  const [weight, onWeightChange] = useState(metric?.weight ?? 50)

  useEffect(() => {
    if (metric) {
      onNameChange(metric?.name ?? '')
      toggleSnapshot(metric?.isSnapshot ?? false)
      toggleDecreasing(metric?.isDecreasing ?? false)
      onWeightChange(metric?.weight ?? 50)
    }
  }, [metric])

  return (
    <Modal
      isVisible={!!metric}
      style={styles.modalViewContainerBottom}
      onBackdropPress={onHide}
      hideModalContentWhileAnimating
      avoidKeyboard>
      <View
        style={{
          ...styles.modalViewFull,
          maxHeight: Dimensions.get('window').height - insets.top - 50,
        }}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContainer}
          keyboardShouldPersistTaps="handled">
          <Text
            style={{
              ...styles.title,
              marginTop: 40,
            }}>
            Metric Details
          </Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.textInput}
              onChangeText={onNameChange}
              value={name}
              returnKeyType="next"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Reporting Type</Text>
            <View style={styles.inputRowCenter}>
              <OptionButton
                label="Incremental"
                value={false}
                isActive={!isSnapshot}
                onValueChange={(val) => {
                  Keyboard.dismiss()
                  toggleSnapshot(val)
                }}
              />
              <OptionButton
                label="Snapshot"
                value
                isActive={isSnapshot}
                onValueChange={(val) => {
                  Keyboard.dismiss()
                  toggleSnapshot(val)
                }}
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.description}>
                {isSnapshot
                  ? 'Each report represents the value of your metric at a given point in time, independent from past and future reports'
                  : 'Each report represents an incremental change in your metric, adding to a cumulative total'}
              </Text>
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Growth Trajectory</Text>
            <View style={styles.inputRowCenter}>
              <OptionButton
                label="Increasing"
                value={false}
                isActive={!isDecreasing}
                onValueChange={(val) => {
                  Keyboard.dismiss()
                  toggleDecreasing(val)
                }}
              />
              <OptionButton
                label="Decreasing"
                value
                isActive={isDecreasing}
                onValueChange={(val) => {
                  Keyboard.dismiss()
                  toggleDecreasing(val)
                }}
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.description}>
                {isDecreasing
                  ? 'Lower values are better'
                  : 'Higher values are better'}
              </Text>
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Relative Importance</Text>
            <Text style={styles.weightLabel}>{weight}</Text>
            <View style={styles.inputRowCenter}>
              <WeightSlider weight={weight} onChange={onWeightChange} />
            </View>
          </View>
          <View
            style={{
              ...styles.inputGroup,
              marginBottom: 20,
            }}>
            <View style={styles.inputRowCenter}>
              <TouchableOpacity
                style={{
                  ...styles.ctaButtonShort,
                  backgroundColor: color('white'),
                  borderColor: color(goalColor),
                  borderWidth: 1,
                }}
                onPress={onDelete}>
                <Text
                  style={{
                    ...styles.ctaButtonText,
                    color: color(goalColor),
                  }}>
                  Delete
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  ...styles.ctaButtonShort,
                  backgroundColor: isEmpty(name)
                    ? color(goalColor, 0.7)
                    : color(goalColor),
                }}
                disabled={isEmpty(name)}
                onPress={() =>
                  onSave({
                    name,
                    isSnapshot,
                    isDecreasing,
                    weight,
                  })
                }>
                <Text style={styles.ctaButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  )
}

export default MetricModal
