import React, {useState, useEffect, useContext} from 'react'
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ListRenderItemInfo,
} from 'react-native'
import {useSafeArea} from 'react-native-safe-area-context'
import moment from 'moment'
import analytics from '@segment/analytics-react-native'
import {List} from 'realm'
import AnalyticsChart from '../components/AnalyticsChart'
import style from '../lib/style'
import {
  normalizedDistributions,
  normalizedMovingAverages,
  metricDistribution,
  metricMovingAverage,
  averageNormalizedCollections,
  getFirstReports,
  distributionMovingAverage,
  getDataRange,
} from '../lib/insights'
import {
  color,
  metricDisplayName,
  goalDisplayName,
  createStyleSheet,
  newList,
} from '../lib/util'
import Logo from '../assets/images/logo.svg'
import CalendarIcon from '../assets/images/cta-calendar.svg'
import DateRangePicker from '../components/DateRangePicker'
import UserContext from '../contexts/UserContext'
import {Goal, Metric} from '../lib/database'
import {Dataset, DateRange} from '../types'
import data from '../lib/debug/data'

const styles = createStyleSheet({
  ...style,
  dateButton: {
    alignSelf: 'center',
    backgroundColor: '#F2F2F3',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
  },
  goalName: {
    ...style.textBold,
    fontSize: 20,
  },
  analyticsChartContainer: {
    flexGrow: 1,
    padding: 20,
    marginBottom: 40,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: color('gray'),
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4.65,
    elevation: 8,
  },
  metricSelectorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metricSelector: {
    ...style.ctaButtonShort,
    backgroundColor: color('light-gray'),
    paddingVertical: 5,
    marginHorizontal: 5,
    marginVertical: 5,
    borderRadius: 15,
  },
  metricSelectorText: {
    ...style.text,
    color: color('black-lighter', 0.8),
    fontSize: 14,
  },
  metricSelectorTextActive: {
    ...style.text,
    color: color('white'),
    fontSize: 14,
  },
  titleContainer: {
    ...style.titleContainer,
    margin: 10,
    marginBottom: 20,
  },
  title: {
    ...style.title,
    margin: 0,
  },
})

type SelectedMetric = {
  [key: string]: boolean
}

type SelectedMetrics = {
  [key: string]: SelectedMetric
}

const Analytics = () => {
  const user = useContext(UserContext)
  const [goals, setGoals] = useState<List<Goal>>(newList())
  const [dateRange, onDateRangeChange] = useState<DateRange>([
    moment().subtract(1, 'month'),
    moment(),
  ])
  const [isEditingDateRange, toggleEditingDateRange] = useState(false)
  const [selectedMetrics, setSelectedMetrics] = useState<SelectedMetrics>({})
  const [selectedMetricsUpdated, toggleSelectedMetricsUpdated] = useState(false)

  useEffect(() => {
    setGoals(user?.goals?.sorted('order') ?? newList())
  }, [user])

  const getHeaderComponent = () => (
    <>
      <View
        style={{
          ...styles.titleContainer,
          alignItems: 'center',
          marginVertical: 0,
        }}>
        <View
          style={{
            paddingVertical: 5,
          }}>
          <Logo width={35} height={35} fill={color('purple')} />
        </View>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => toggleEditingDateRange(!isEditingDateRange)}>
          <CalendarIcon width={16} height={20} fill={color('black-lighter')} />
          <Text
            style={{
              ...styles.text,
              marginLeft: 7,
            }}>
            {moment(dateRange[0]).format('MM/DD')} -{' '}
            {moment(dateRange[1]).format('MM/DD')}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  )

  const renderMetricSelectors = (goal: Goal) => (
    <View style={styles.metricSelectorsContainer}>
      {goal.metrics.map((metric) => (
        <TouchableOpacity
          key={metric.id}
          style={
            selectedMetricsUpdated !== null &&
            selectedMetrics[goal.id]?.[metric.id]
              ? {
                  ...styles.metricSelector,
                  backgroundColor: color(goal.color),
                }
              : styles.metricSelector
          }
          onPress={() => {
            const nextSelectedMetrics = selectedMetrics

            if (!nextSelectedMetrics[goal.id]) {
              nextSelectedMetrics[goal.id] = {}
            }

            nextSelectedMetrics[goal.id][metric.id] = !nextSelectedMetrics[
              goal.id
            ][metric.id]

            if (nextSelectedMetrics[goal.id][metric.id]) {
              analytics.track('Analytics Metric Selected', {
                goalId: goal.id,
                goalName: goal.name,
                metricId: metric.id,
                metricName: metric.name,
              })
            } else {
              analytics.track('Analytics Metric Deselected', {
                goalId: goal.id,
                goalName: goal.name,
                metricId: metric.id,
                metricName: metric.name,
              })
            }

            setSelectedMetrics(nextSelectedMetrics)
            toggleSelectedMetricsUpdated(!selectedMetricsUpdated)
          }}>
          <Text
            style={
              selectedMetrics[goal.id]?.[metric.id]
                ? styles.metricSelectorTextActive
                : styles.metricSelectorText
            }>
            {metricDisplayName(metric)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )

  const renderAnalyticsChart = (goal: Goal) => {
    const selectedMetricsForGoal =
      selectedMetrics[goal.id] &&
      Object.keys(selectedMetrics[goal.id]).filter(
        (id) => !!selectedMetrics[goal.id][id],
      )
    const metrics = selectedMetricsForGoal?.length
      ? (selectedMetricsForGoal
          .map((id) => goal.metrics.find((metric) => metric.id === id))
          .filter((m) => !!m) as Metric[])
      : goal.metrics

    const startDate = moment(dateRange[0]).subtract(7, 'days')
    const endDate = dateRange[1]

    const barData: Dataset = []
    const lineData: Dataset = []
    let isGradient = false
    let isSnapshot = false

    if (selectedMetricsForGoal?.length && metrics.length === 1) {
      const dayDist = metricDistribution(metrics[0], startDate, endDate, 'day')

      const sevenDayMA = metricMovingAverage(metrics[0], startDate, endDate, 7)

      barData.push({
        data: dayDist,
        color: color(goal.color, 0.4),
      })

      lineData.push({
        data: sevenDayMA.filter((ma) => ma.value !== null),
        color: color(`${goal.color}-darker`, 2),
      })

      isSnapshot = metrics[0].isSnapshot
    } else {
      const firstReports = getFirstReports(metrics)

      const dayDists = normalizedDistributions(
        metrics,
        startDate,
        endDate,
        'day',
      )

      const averageDayDist = averageNormalizedCollections(
        dayDists,
        metrics,
        firstReports,
      )

      const averageSevenDayMA = distributionMovingAverage(
        averageDayDist,
        startDate,
        endDate,
        7,
      )

      barData.push({
        data: averageDayDist.filter((dist) => dist.reported !== false),
        color: color(goal.color, 0.4),
      })

      lineData.push({
        data: averageSevenDayMA,
        color: color(`${goal.color}-darker`, 2),
      })

      isGradient = true
    }

    return (
      <AnalyticsChart
        barData={barData}
        lineData={lineData}
        domain={{
          x: dateRange,
          y:
            !isGradient && isSnapshot
              ? getDataRange([barData, lineData])
              : undefined,
        }}
        screenPadding={30}
        isGradient={isGradient}
      />
    )
  }

  const renderGoal = ({item: goal}: ListRenderItemInfo<Goal>) => {
    return (
      <View style={styles.analyticsChartContainer}>
        <Text style={styles.goalName}>{goalDisplayName(goal)}</Text>
        {renderAnalyticsChart(goal)}
        {renderMetricSelectors(goal)}
      </View>
    )
  }

  return (
    <>
      <View
        style={{
          ...styles.safeAreaView,
          paddingTop: useSafeArea().top || 10,
        }}>
        <FlatList
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          data={goals}
          ListHeaderComponent={getHeaderComponent()}
          renderItem={renderGoal}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
      {isEditingDateRange && (
        <DateRangePicker
          isVisible={isEditingDateRange}
          onClose={() => toggleEditingDateRange(false)}
          dateRange={dateRange}
          onDateRangeChange={(newDateRange: DateRange) => {
            analytics.track('Analytics Date Range Changed', {
              start: newDateRange[0].toISOString(),
              end: newDateRange[1].toISOString(),
              days: newDateRange[1].diff(newDateRange[0], 'days') + 1,
            })
            onDateRangeChange(newDateRange)
          }}
        />
      )}
    </>
  )
}

export default Analytics
