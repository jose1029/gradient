import React from 'react'
import moment from 'moment'
import InsightContent from '../../components/InsightContent'
import InsightChart from '../../components/InsightChart'
import {getInsightsForMetric} from './metric'
import {
  averageNormalizedCollections,
  distributionMovingAverage,
  getFirstReports,
  getLastReports,
  getNormalizedChange,
  normalizedDistributions,
  normalizedMovingAverages,
} from './distributions'
import {color, formatChange, goalDisplayName} from '../util'
import {Goal} from '../database'
import {Insight} from '../../types'

export const getInsightsForNormalizedAverageGoal = (goal: Goal): Insight[] => {
  if (!goal || goal.metrics.length < 2) {
    return []
  }

  const insights = []

  const {metrics} = goal

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
      id: `${goal.id}-one-day-change`,
      content: () => (
        <InsightContent
          header={goalDisplayName(goal)}
          callout={formatChange(oneDayChange)}
          description="in the last day"
        />
      ),
      chart: () => {
        const firstDateInPeriod = moment(lastReportDate).subtract(2, 'weeks')

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
      id: `${goal.id}-one-week-change`,
      content: () => (
        <InsightContent
          header={goalDisplayName(goal)}
          callout={formatChange(oneWeekChange)}
          description="in the last week"
        />
      ),
      chart: () => {
        const firstDateInPeriod = moment(lastReportDate).subtract(2, 'weeks')

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

// TODO fix navigation type
export const getInsightsForGoal = (goal: Goal, navigation: any): Insight[] => {
  if (!goal) {
    return []
  }

  const goalInsights = getInsightsForNormalizedAverageGoal(goal)

  const metricInsights = goal.metrics
    .map((metric) => getInsightsForMetric(metric))
    .flat()

  return [...goalInsights, ...metricInsights].map((insight) => ({
    ...insight,
    goal,
  }))
}
