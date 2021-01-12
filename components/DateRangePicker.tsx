import React, {useState, useEffect} from 'react'
import {View, Text, Dimensions, TouchableOpacity} from 'react-native'
import Modal from 'react-native-modal'
import {CalendarList, DotMarking, PeriodMarking} from 'react-native-calendars'
import moment, {Moment} from 'moment'
import style from '../lib/style'
import {color, createStyleSheet} from '../lib/util'
import {DateRange} from '../types'

const styles = createStyleSheet({
  ...style,
  topButtonsContainer: {
    ...style.inputRowSpaced,
    marginTop: 15,
    marginHorizontal: 15,
  },
  topButton: style.ctaButtonSecondary,
  topButtonText: {
    ...style.ctaButtonSecondaryText,
    fontSize: 16,
    color: color('black-lighter'),
  },
  bottomButtonsContainer: {
    ...style.inputRowCenter,
    marginTop: 5,
    marginBottom: 15,
    marginHorizontal: 15,
  },
  bottomButton: {
    ...style.ctaButtonShort,
    backgroundColor: color('light-gray'),
    paddingVertical: 5,
    borderRadius: 15,
  },
  bottomButtonActive: {
    ...style.ctaButtonShort,
    backgroundColor: color('purple'),
    paddingVertical: 5,
    borderRadius: 15,
  },
  bottomButtonText: {
    ...style.text,
    color: color('black-lighter', 0.8),
    fontSize: 14,
  },
  bottomButtonTextActive: {
    ...style.text,
    color: color('white'),
    fontSize: 14,
  },
})

type DateRangePickerProps = {
  isVisible: boolean
  onClose: () => void
  dateRange: DateRange
  onDateRangeChange: (dateRange: DateRange) => void
}

type MarkedDates = {
  [date: string]: PeriodMarking & DotMarking
}

type CalendarObject = {
  day: number
  month: number
  year: number
  timestamp: number
  dateString: string
}

const DateRangePicker = ({
  isVisible,
  onClose,
  dateRange,
  onDateRangeChange,
}: DateRangePickerProps) => {
  const [firstDate, setFirstDate] = useState<Moment | null>(null)
  const [secondDate, setSecondDate] = useState<Moment | null>(null)
  const [markedDates, setMarkedDates] = useState<MarkedDates>({})
  const [currentRangePreset, setCurrentRangePreset] = useState<string | null>(
    null,
  )
  const [calendarPadding, setCalendarPadding] = useState(0)
  const [firstOpen, setFirstOpen] = useState(true)

  const formatted = (date: Moment) => date.format('YYYY-MM-DD')

  useEffect(() => {
    setFirstDate(dateRange[0])
    setSecondDate(dateRange[1])
  }, [dateRange])

  useEffect(() => {
    const nextMarkedDates: MarkedDates = {}
    const today = moment()

    let nextCurrentRangePreset = null

    if (firstDate && secondDate) {
      const firstIsBeforeSecond = firstDate.isSameOrBefore(secondDate, 'day')
      const first = firstIsBeforeSecond ? firstDate : secondDate
      const last = firstIsBeforeSecond ? secondDate : firstDate

      for (
        let curr = moment(first);
        curr.isSameOrBefore(last, 'day');
        curr.add(1, 'day')
      ) {
        nextMarkedDates[formatted(curr)] = {
          selected: true,
          color: color('purple'),
        }
      }

      nextMarkedDates[formatted(first)].startingDay = true
      nextMarkedDates[formatted(last)].endingDay = true

      if (
        today.isSameOrBefore(last, 'day') &&
        today.isSameOrAfter(first, 'day')
      ) {
        nextMarkedDates[formatted(today)].marked = true
        nextMarkedDates[formatted(today)].dotColor = color('white')
      } else {
        nextMarkedDates[formatted(today)] = {
          selected: true,
          color: color('purple', 0.5),
          startingDay: true,
          endingDay: true,
        }
      }

      if (last.isSame(today, 'day')) {
        if (moment(last).subtract(1, 'week').isSame(first, 'day')) {
          nextCurrentRangePreset = 'last-week'
        } else if (moment(last).subtract(1, 'month').isSame(first, 'day')) {
          nextCurrentRangePreset = 'last-month'
        }
      }
    } else if (firstDate || secondDate) {
      const onlyDate = firstDate || secondDate

      nextMarkedDates[formatted(onlyDate!)] = {
        selected: true,
        color: color('purple'),
        startingDay: true,
        endingDay: true,
      }

      if (today.isSame(onlyDate, 'day')) {
        nextMarkedDates[formatted(today)].marked = true
        nextMarkedDates[formatted(today)].dotColor = color('white')
      } else {
        nextMarkedDates[formatted(today)] = {
          selected: true,
          color: color('purple', 0.5),
          startingDay: true,
          endingDay: true,
        }
      }
    } else {
      nextMarkedDates[formatted(today)] = {
        selected: true,
        color: color('purple', 0.5),
        startingDay: true,
        endingDay: true,
      }
    }

    setMarkedDates(nextMarkedDates)
    setCurrentRangePreset(nextCurrentRangePreset)
  }, [firstDate, secondDate])

  const onDone = () => {
    if (firstDate && secondDate) {
      const firstIsBeforeSecond = firstDate.isSameOrBefore(secondDate, 'day')
      const first = firstIsBeforeSecond ? firstDate : secondDate
      const last = firstIsBeforeSecond ? secondDate : firstDate

      onDateRangeChange([first, last])
    } else {
      const onlyDate = firstDate || secondDate

      if (onlyDate) {
        onDateRangeChange([onlyDate, moment(onlyDate)])
      }
    }
    onClose()
  }

  const handleDatePress = (date: CalendarObject) => {
    const momentDate = moment(date.dateString)
    if (firstDate && secondDate) {
      setFirstDate(momentDate)
      setSecondDate(null)
    } else if (firstDate) {
      setSecondDate(momentDate)
    } else {
      setFirstDate(momentDate)
    }
  }

  const handleVisibleMonthsChange = () => {
    if (firstOpen) {
      setFirstOpen(false)
    } else {
      // Widths are based on default behavior for react-native-modal
      setCalendarPadding(Dimensions.get('window').width * 0.025)
    }
  }

  return (
    <Modal
      isVisible={isVisible}
      style={styles.modalViewContainer}
      hideModalContentWhileAnimating>
      <View
        style={{
          ...styles.modalViewFull,
          borderRadius: 10,
        }}>
        <View style={styles.topButtonsContainer}>
          <TouchableOpacity style={styles.topButton} onPress={onClose}>
            <Text style={styles.topButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.topButton} onPress={onDone}>
            <Text style={styles.topButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
        <CalendarList
          // Widths are based on default behavior for react-native-modal
          style={{
            paddingHorizontal: calendarPadding,
          }}
          calendarWidth={Dimensions.get('window').width * 0.9}
          horizontal
          pagingEnabled
          hideExtraDays={false}
          markingType="period"
          markedDates={markedDates}
          onDayPress={handleDatePress}
          onVisibleMonthsChange={handleVisibleMonthsChange}
        />
        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity
            style={
              currentRangePreset === 'last-week'
                ? styles.bottomButtonActive
                : styles.bottomButton
            }
            onPress={() => {
              setFirstDate(moment().subtract(1, 'week'))
              setSecondDate(moment())
            }}>
            <Text
              style={
                currentRangePreset === 'last-week'
                  ? styles.bottomButtonTextActive
                  : styles.bottomButtonText
              }>
              Last Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={
              currentRangePreset === 'last-month'
                ? styles.bottomButtonActive
                : styles.bottomButton
            }
            onPress={() => {
              setFirstDate(moment().subtract(1, 'month'))
              setSecondDate(moment())
            }}>
            <Text
              style={
                currentRangePreset === 'last-month'
                  ? styles.bottomButtonTextActive
                  : styles.bottomButtonText
              }>
              Last Month
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

export default DateRangePicker
