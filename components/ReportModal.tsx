import React, {useState, useEffect} from 'react'
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native'
import Modal from 'react-native-modal'
import DatePicker from 'react-native-date-picker'
import moment from 'moment'
import analytics from '@segment/analytics-react-native'
import {useSafeArea} from 'react-native-safe-area-context'
import {v4 as uuid} from 'uuid'
import style from '../lib/style'
import {db, Metric, Report} from '../lib/database'
import {
  metricDisplayName,
  goalDisplayName,
  color,
  isNumeric,
  createStyleSheet,
} from '../lib/util'
import {showDefaultError} from '../lib/error'
import CalendarIcon from '../assets/images/cta-calendar.svg'
import CancelIcon from '../assets/images/footer-close.svg'
import HistoryIcon from '../assets/images/btn-history.svg'

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

const styles = createStyleSheet({
  ...style,
  dateButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2F2F3',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
    flexShrink: 1,
    flexDirection: 'row',
  },
  cancelButton: {
    backgroundColor: '#eeeeee',
    borderRadius: 20,
    padding: 8,
  },
  historyButton: {
    backgroundColor: '#eeeeee',
    borderRadius: 20,
    padding: 8,
  },
})

type ReportModalProps = {
  metric: Metric | null
  onClose: () => void
  onHistory: () => void
}

const ReportModal = ({metric, onClose, onHistory}: ReportModalProps) => {
  const goal = metric?.goal?.[0]

  const insets = useSafeArea()

  const [value, onValueChange] = useState('')
  const [date, onDateChange] = useState(moment().toDate())
  const [isEditingDate, toggleEditingDate] = useState(false)

  const [goalName, setGoalName] = useState('')
  const [metricName, setMetricName] = useState('')
  const [lastReport, setLastReport] = useState<Report | null>(null)
  const [goalColor, setGoalColor] = useState<string | undefined>()

  useEffect(() => {
    if (metric && goal) {
      analytics.track('Report Started', {
        goalId: goal?.id,
        goalName: goal?.name,
        goalColor: goal?.color,
        metricCount: goal?.metrics.length,
        metricId: metric.id,
        metricName: metric.name,
        metricIsSnapshot: metric.isSnapshot,
        metricIsDecreasing: metric.isDecreasing,
        metricWeight: metric.weight,
      })

      onValueChange('')
      onDateChange(moment().toDate())
      toggleEditingDate(false)

      setGoalName(goalDisplayName(goal))
      setMetricName(metricDisplayName(metric))
      setLastReport(
        metric?.reports.length ? metric.reports.sorted('date', true)[0] : null,
      )
      setGoalColor(goal?.color)
    }
  }, [metric])

  const onSave = () => {
    if (metric) {
      analytics.track('Report Saved', {
        goalId: goal?.id,
        goalName: goal?.name,
        goalColor: goal?.color,
        metricCount: goal?.metrics.length,
        metricId: metric.id,
        metricName: metric.name,
        metricIsSnapshot: metric.isSnapshot,
        metricIsDecreasing: metric.isDecreasing,
        metricWeight: metric.weight,
        date: moment(date).toISOString(),
        value: +value,
      })

      try {
        db()?.write(() => {
          const report: (Report & Realm.Object) | undefined = db()?.create(
            Report.schema.name,
            new Report(date, +value),
          )
          if (!report) {
            throw new Error('Report could not be created')
          }
          metric.reports.push(report)
        })
      } catch (e) {
        showDefaultError(e, true)
      }

      onClose()
    }
  }

  // Required to avoid error if last report is deleted
  const clearState = () => {
    setLastReport(null)
  }

  let scrollViewRef: ScrollView | null = null

  return (
    <Modal
      isVisible={!!metric}
      style={styles.modalViewContainerBottom}
      onBackdropPress={onClose}
      onModalHide={clearState}
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
          keyboardShouldPersistTaps="handled"
          ref={(ref) => {
            scrollViewRef = ref
          }}
          onContentSizeChange={() =>
            scrollViewRef?.scrollToEnd({animated: true})
          }>
          <View
            style={{
              ...styles.titleContainer,
              marginVertical: 20,
            }}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <CancelIcon
                width={21}
                height={21}
                fill={color('black-lighter')}
              />
            </TouchableOpacity>
            <Text
              style={{
                ...styles.titleCenter,
                fontSize: 14,
                fontWeight: '600',
              }}>
              Add Report
            </Text>
            <TouchableOpacity style={styles.historyButton} onPress={onHistory}>
              <HistoryIcon
                width={21}
                height={21}
                fill={color('black-lighter')}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.inputGroupWide}>
            <Text
              style={{
                ...styles.inputLabel,
                color: color(goalColor),
                fontWeight: '600',
                marginBottom: 5,
              }}>
              {goalName}
            </Text>
            <Text
              style={{
                ...styles.inputLabel,
                fontSize: 30,
                fontWeight: '600',
                marginBottom: 20,
              }}>
              {metricName}
            </Text>
            <TextInput
              style={{
                ...styles.textInput,
                marginBottom: 20,
              }}
              onChangeText={onValueChange}
              value={value}
              keyboardType="numeric"
              returnKeyType="done"
            />
            <View style={styles.inputRowSpaced}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  analytics.track(
                    `Report Date Picker ${isEditingDate ? 'Closed' : 'Opened'}`,
                  )
                  LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut,
                  )
                  toggleEditingDate(!isEditingDate)
                }}>
                <CalendarIcon width={16} height={20} fill={color('black')} />
                <Text
                  style={{
                    ...styles.textBold,
                    marginLeft: 7,
                  }}>
                  {moment(date).format('MM/DD')}
                </Text>
              </TouchableOpacity>
              {lastReport ? (
                <Text
                  style={{
                    ...styles.textMuted,
                    fontSize: 14,
                    lineHeight: 39,
                    flexShrink: 30,
                  }}>
                  {'Last report: '}
                  <Text style={{fontWeight: '600'}}>{lastReport.value}</Text>
                  {' on '}
                  <Text style={{fontWeight: '600'}}>
                    {moment(lastReport.date).format('MM/DD')}
                  </Text>
                </Text>
              ) : (
                <Text
                  style={{
                    ...styles.textMuted,
                    fontSize: 14,
                    lineHeight: 39,
                    flexShrink: 30,
                  }}>
                  No previous reports
                </Text>
              )}
            </View>
            {isEditingDate && (
              <DatePicker date={date} onDateChange={onDateChange} mode="date" />
            )}
          </View>
          <View style={{...styles.inputGroupWide, paddingTop: 10}}>
            <TouchableOpacity
              style={{
                ...styles.ctaButton,
                backgroundColor: isNumeric(value)
                  ? color(goalColor)
                  : color(goalColor, 0.7),

                marginBottom: 10,
              }}
              disabled={!isNumeric(value)}
              onPress={onSave}>
              <Text style={styles.ctaButtonText}>Save Report</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  )
}

export default ReportModal
