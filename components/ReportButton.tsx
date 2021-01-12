import React from 'react'
import {Text, Dimensions, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'
import moment from 'moment'
import style from '../lib/style'
import {
  metricDisplayName,
  color,
  createStyleSheet,
  formatChange,
} from '../lib/util'
import {Metric} from '../lib/database'
import {getChange} from '../lib/insights'

export const reportButtonMarginConst = 40 / 8
export const reportButtonSize =
  (Dimensions.get('window').width - 12 * reportButtonMarginConst) / 3

const styles = createStyleSheet({
  ...style,
  reportButton: {
    width: reportButtonSize,
    height: reportButtonSize * 0.85,
    marginHorizontal: reportButtonMarginConst,
    borderRadius: 15,
    padding: 10,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  metricName: {
    ...style.textSemibold,
    fontSize: 14,
    lineHeight: 20,
    color: color('white'),
  },
  lastReport: {
    ...style.text,
    fontSize: 11,
    color: color('white'),
  },
  change: {
    ...style.text,
    fontSize: 11,
    color: color('white'),
  },
})

type ReportButtonProps = {
  metric: Metric
  onReportPress: (metric: Metric) => void
}

const ReportButton = ({metric, onReportPress}: ReportButtonProps) => {
  const firstReport = metric.reports.length
    ? metric.reports.sorted('date')[0]
    : null
  const lastReport = metric.reports.length
    ? metric.reports.sorted('date', true)[0]
    : null

  let changePeriod = 7
  if (firstReport === null) {
    changePeriod = -1
  } else {
    const firstReportDiff = moment().diff(moment(firstReport.date), 'day')
    if (firstReportDiff < 6) {
      changePeriod = firstReportDiff + 1
    }
  }

  const change =
    changePeriod > 0
      ? getChange(metric, moment().subtract(1, 'day'), moment(), changePeriod)
      : null

  let opacity = 1
  if (lastReport) {
    if (moment().isSame(moment(lastReport.date), 'day')) {
      opacity = 0.75
    } else if (
      moment().subtract(1, 'day').isSame(moment(lastReport.date), 'day')
    ) {
      opacity = 0.875
    }
  }

  return (
    <TouchableOpacity
      style={{
        ...styles.reportButton,
        backgroundColor: color(metric.goal?.[0]?.color, opacity),
      }}
      onPress={() => onReportPress(metric)}>
      <View>
        <Text style={styles.metricName} numberOfLines={1}>
          {metricDisplayName(metric)}
        </Text>
        <Text style={styles.lastReport} numberOfLines={1}>
          {lastReport
            ? `${lastReport.value} on ${moment(lastReport.date).format(
                'MM/DD',
              )}`
            : 'No reports'}
        </Text>
      </View>
      <View>
        <Text style={styles.change} numberOfLines={1}>
          {change !== null ? formatChange(change) : null}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

export default ReportButton
