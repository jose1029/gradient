import React from 'react'
import {Dimensions, Text} from 'react-native'
import {CompositeNavigationProp} from '@react-navigation/native'
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs'
import {StackNavigationProp} from '@react-navigation/stack'
import {List} from 'realm'
import moment from 'moment'
import style from '../style'
import AddGoalsImage from '../../assets/images/add-post.svg'
import AddMetricsImage from '../../assets/images/design-objectives.svg'
import AddReportsImage from '../../assets/images/setup-analytics.svg'
import {getInsightsForGoal} from './goal'
import {color, createStyleSheet, formatChange} from '../util'
import {Goal} from '../database'
import {Insight, NavigationStackParamList, TabParamList} from '../../types'
import {
  averageNormalizedCollections,
  distributionMovingAverage,
  getFirstReports,
  getLastReports,
  getNormalizedChange,
  normalizedDistributions,
  normalizedMovingAverages,
} from './distributions'
import InsightContent from '../../components/InsightContent'
import InsightChart from '../../components/InsightChart'

const styles = createStyleSheet({
  ...style,
  insightText: {
    flexGrow: 1,
    fontSize: 14,
  },
})

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Dashboard'>,
  StackNavigationProp<NavigationStackParamList>
>

export const getOverallInsights = (goals: List<Goal>): Insight[] => {
  const metrics = goals
    .map((goal) => goal.metrics.map((metric) => metric))
    .flat()

  if (!metrics.length) {
    return []
  }

  const insights = []

  const firstReports = getFirstReports(metrics)
  const lastReports = getLastReports(metrics)

  if (!firstReports.length || !lastReports.length) {
    return []
  }

  const firstReportDate = moment.min(firstReports.map((r) => moment(r.date)))
  const lastReportDate = moment.max(lastReports.map((r) => moment(r.date)))

  if (
    moment(lastReportDate)
      .startOf('day')
      .diff(moment(firstReportDate).startOf('day'), 'days') >= 7
  ) {
    const oneDayChange = getNormalizedChange(
      metrics,
      moment(lastReportDate).subtract(1, 'day'),
      moment(lastReportDate),
      7,
      moment(lastReportDate).subtract(1, 'month'),
      moment(lastReportDate),
      firstReports,
    )

    insights.push({
      id: `overall-one-day-change`,
      content: () => (
        <InsightContent
          header="Overall"
          callout={formatChange(oneDayChange)}
          description="in the last day"
        />
      ),
      chart: () => {
        const firstDateInPeriod = moment(lastReportDate).subtract(8, 'weeks') // TODO update period

        const dayDists = normalizedDistributions(
          metrics,
          firstReportDate,
          lastReportDate,
          'day',
        )

        const averageDayDist = averageNormalizedCollections(
          dayDists,
          metrics,
          firstReports,
        )

        const averageSevenDayMA = distributionMovingAverage(
          averageDayDist,
          firstReportDate,
          lastReportDate,
          7,
        )

        return (
          <InsightChart
            dataset={[
              {
                data: averageDayDist,
                color: color('insight-chart-primary'),
              },
              {
                data: averageSevenDayMA,
                color: color('insight-chart-secondary'),
              },
            ]}
            domain={{x: [firstDateInPeriod, lastReportDate]}}
          />
        )
      },
      weight: Math.abs(oneDayChange) * 2,
    })

    const oneWeekChange = getNormalizedChange(
      metrics,
      moment(lastReportDate).subtract(7, 'day'),
      moment(lastReportDate),
      7,
      moment(lastReportDate).subtract(1, 'month'),
      moment(lastReportDate),
      firstReports,
    )

    insights.push({
      id: `overall-one-week-change`,
      content: () => (
        <InsightContent
          header="Overall"
          callout={formatChange(oneWeekChange)}
          description="in the last week"
        />
      ),
      chart: () => {
        const firstDateInPeriod = moment(lastReportDate).subtract(8, 'weeks') // TODO update period

        const dayDists = normalizedDistributions(
          metrics,
          firstReportDate,
          lastReportDate,
          'day',
        )

        const averageDayDist = averageNormalizedCollections(
          dayDists,
          metrics,
          firstReports,
        )

        const averageSevenDayMA = distributionMovingAverage(
          averageDayDist,
          firstReportDate,
          lastReportDate,
          7,
        )

        return (
          <InsightChart
            dataset={[
              {
                data: averageDayDist,
                color: color('insight-chart-primary'),
              },
              {
                data: averageSevenDayMA,
                color: color('insight-chart-secondary'),
              },
            ]}
            domain={{x: [firstDateInPeriod, lastReportDate]}}
          />
        )
      },
      weight: Math.abs(oneWeekChange) * 2,
    })
  }

  return insights
}

export const getInsights = (
  goals: List<Goal>,
  navigation: NavigationProp,
): Insight[] => {
  if (!goals) {
    return []
  }

  const insights = []

  const overallInsights = getOverallInsights(goals)
  for (const i of overallInsights) {
    insights.push(i)
  }

  const usedMetricIds: string[] = []
  const usedGoalIds: string[] = []

  const goalInsights = goals
    .map((goal) => getInsightsForGoal(goal, navigation))
    .flat()
    .sort((a, b) => b.weight - a.weight)
    .filter((insight) => {
      if (!Number.isFinite(insight.weight)) {
        return false
      }
      if (insight.metric) {
        if (usedMetricIds.includes(insight.metric.id)) {
          return false
        }
        usedMetricIds.push(insight.metric.id)
      } else if (insight.goal) {
        if (usedGoalIds.includes(insight.goal.id)) {
          return false
        }
        usedGoalIds.push(insight.goal.id)
      }
      return true
    })
    .slice(0, 3)

  for (const i of goalInsights) {
    insights.push(i)
  }

  if (insights.length) {
    return insights
  }

  if (!goals.length) {
    return [
      {
        id: 'add-goals',
        weight: 0,
        image: () => (
          <AddGoalsImage
            width={(Dimensions.get('window').width - 100) / 2}
            height={(Dimensions.get('window').width - 100) / 2}
          />
        ),
        content: () => (
          <Text style={styles.insightText}>
            Create a goal to start adding reports!
          </Text>
        ),
        onPress: () =>
          navigation.navigate('AddGoal', {doneScreen: 'Dashboard'}),
      },
    ]
  }

  if (!goals.filtered('metrics.@count > 0').length) {
    return [
      {
        id: 'add-metrics',
        weight: 0,
        image: () => (
          <AddMetricsImage
            width={(Dimensions.get('window').width - 100) / 2}
            height={(Dimensions.get('window').width - 100) / 2}
          />
        ),
        content: () => (
          <Text style={styles.insightText}>
            Create metrics for your goals to start adding reports!
          </Text>
        ),
      },
    ]
  }

  return [
    {
      id: 'add-reports',
      weight: 0,
      image: () => (
        <AddReportsImage
          width={(Dimensions.get('window').width - 100) / 2}
          height={(Dimensions.get('window').width - 100) / 2}
        />
      ),
      content: () => (
        <Text style={styles.insightText}>
          Add more reports to see insights!
        </Text>
      ),
    },
  ]
}
