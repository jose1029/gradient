import React, {useState} from 'react'
import {
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native'
import Modal from 'react-native-modal'
import {useSafeArea} from 'react-native-safe-area-context'
import analytics from '@segment/analytics-react-native'
import style from '../lib/style'
import {color, createStyleSheet} from '../lib/util'
import HeaderImage from '../assets/images/metrics-instructions.png'
import InfoIcon from '../assets/images/info-btn.svg'
import ChevronUpIcon from '../assets/images/chevron-up.svg'
import ChevronDownIcon from '../assets/images/chevron-down.svg'

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

const styles = createStyleSheet({
  ...style,
  instructions: {
    marginTop: 10,
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

type AddMetricsInstructionsProps = {
  isVisible: boolean
  onClose: () => void
  onComplete: () => void
}

const AddMetricsInstructions = ({
  isVisible,
  onClose,
  onComplete,
}: AddMetricsInstructionsProps) => {
  const [showingExamples, toggleShowingExamples] = useState(false)

  const insets = useSafeArea()

  const onModalHide = () => {
    toggleShowingExamples(false)
    onComplete()
  }

  let scrollViewRef: ScrollView | null = null

  return (
    <Modal
      isVisible={isVisible}
      style={{
        ...styles.modalViewContainer,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      onBackdropPress={onClose}
      onModalHide={onModalHide}
      hideModalContentWhileAnimating>
      <View style={styles.modalViewFull}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContainer}
          keyboardShouldPersistTaps="handled"
          ref={(ref) => {
            scrollViewRef = ref
          }}
          onContentSizeChange={() =>
            scrollViewRef?.scrollToEnd({animated: true})
          }>
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
              Adding Metrics
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
                Metrics are the quantitative performance indicators that you
                will measure.
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
                Metrics should be directly measurable and named to include the
                unit being measured. They should not include quantitative
                targets or specified lengths of time.
              </Text>
            </View>
            <View style={styles.instructionsItem}>
              <InfoIcon
                style={styles.instructionsIcon}
                width={24}
                height={24}
                fill={color('orange', 0.9)}
              />
              <Text style={styles.instructionsText}>
                <Text style={{fontWeight: '600'}}>Incremental</Text> metrics are
                used to report changes to a metric, whereas{' '}
                <Text style={{fontWeight: '600'}}>Snapshot</Text> metrics are
                used to report the current value of a metric.
              </Text>
            </View>
            {showingExamples ? (
              <TouchableOpacity
                style={styles.instructionsItem}
                onPress={() => {
                  analytics.track('Metrics Instructions Examples Closed')
                  LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut,
                  )
                  toggleShowingExamples(false)
                }}>
                <Text
                  style={{
                    ...styles.instructionsText,
                    fontWeight: '500',
                    fontSize: 16,
                    color: color('purple'),
                    overflow: 'hidden',
                  }}>
                  Hide examples{' '}
                  <ChevronUpIcon
                    width={16}
                    height={30}
                    stroke={color('purple')}
                  />
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.instructionsItem}
                onPress={() => {
                  analytics.track('Metrics Instructions Examples Opened')
                  LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut,
                  )
                  toggleShowingExamples(true)
                }}>
                <Text
                  style={{
                    ...styles.instructionsText,
                    fontWeight: '500',
                    fontSize: 16,
                    color: color('purple'),
                    overflow: 'hidden',
                  }}>
                  Show examples{' '}
                  <ChevronDownIcon
                    width={16}
                    height={30}
                    stroke={color('purple')}
                  />
                </Text>
              </TouchableOpacity>
            )}
            {showingExamples && (
              <>
                <View style={styles.instructionsItem}>
                  <InfoIcon
                    style={styles.instructionsIcon}
                    width={24}
                    height={24}
                    fill={color('green', 0.9)}
                  />
                  <Text style={styles.instructionsText}>
                    Example 1: you&apos;re on page 50 of a book and read 10
                    pages; if the reporting type is{' '}
                    <Text style={{fontWeight: '600'}}>Incremental</Text>, you
                    report <Text style={{fontWeight: '600'}}>10</Text>, but if
                    the reporting type is{' '}
                    <Text style={{fontWeight: '600'}}>Snapshot</Text>, you
                    report <Text style={{fontWeight: '600'}}>60</Text>.
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
                    Example 2: you&apos;ve run a total of 100 miles and run 5
                    more; if the reporting type is{' '}
                    <Text style={{fontWeight: '600'}}>Incremental</Text>, you
                    report <Text style={{fontWeight: '600'}}>5</Text>, but if
                    the reporting type is{' '}
                    <Text style={{fontWeight: '600'}}>Snapshot</Text>, you
                    report <Text style={{fontWeight: '600'}}>105</Text>.
                  </Text>
                </View>
              </>
            )}
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

export default AddMetricsInstructions
