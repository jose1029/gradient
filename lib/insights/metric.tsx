import React from 'react'
import moment from 'moment'
import InsightContent from '../../components/InsightContent'
import InsightChart from '../../components/InsightChart'
import {
  getChange,
  metricDistribution,
  metricMovingAverage,
} from './distributions'
import {color, formatChange, metricDisplayName} from '../util'
import {Metric} from '../database'
import {Insight} from '../../types'

export const getInsightsForMetric = (metric: Metric): Insight[] => {
  if (!metric) {
    return []
  }

  const insights = []

  const firstReportDate = metric.reports.min('date')
  const actualLastReportDate = metric.reports.max('date')

  const today = moment()
  let lastReportDate = actualLastReportDate
  if (
    !metric.isSnapshot &&
    moment(actualLastReportDate).isBefore(today, 'day')
  ) {
    lastReportDate = moment(today).subtract(1, 'day').toDate()
  }

  if (
    moment(lastReportDate)
      .startOf('day')
      .diff(moment(firstReportDate).startOf('day'), 'days') >= 7
  ) {
    const oneDayChange = getChange(
      metric,
      moment(lastReportDate).subtract(1, 'day'),
      moment(lastReportDate),
      7,
    )

    insights.push({
      id: `${metric.id}-one-day-change`,
      content: () => (
        <InsightContent
          header={metricDisplayName(metric)}
          callout={formatChange(oneDayChange)}
          description="in the last day"
        />
      ),
      chart: () => {
        const firstDateInPeriod = moment(lastReportDate).subtract(2, 'weeks')

        const dayDistRaw = metricDistribution(
          metric,
          moment(firstReportDate),
          moment(lastReportDate),
          'day',
        )

        const dayDist = metric.isSnapshot
          ? dayDistRaw.filter((ma) => ma.value !== null)
          : dayDistRaw.map((ma) => ({...ma, value: ma.value || 0}))

        const sevenDayMA = metricMovingAverage(
          metric,
          moment(firstReportDate),
          moment(lastReportDate),
          7,
        ).filter((ma) => ma.value !== null)

        return (
          <InsightChart
            dataset={[
              {
                data: dayDist,
                color: color('insight-chart-primary'),
              },
              {
                data: sevenDayMA,
                color: color('insight-chart-secondary'),
              },
            ]}
            domain={{x: [firstDateInPeriod, moment(lastReportDate)]}}
          />
        )
      },
      weight: Math.abs(oneDayChange),
    })

    const oneWeekChange = getChange(
      metric,
      moment(lastReportDate).subtract(7, 'day'),
      moment(lastReportDate),
      7,
    )

    insights.push({
      id: `${metric.id}-one-week-change`,
      content: () => (
        <InsightContent
          header={metricDisplayName(metric)}
          callout={formatChange(oneWeekChange)}
          description="in the last week"
        />
      ),
      chart: () => {
        const firstDateInPeriod = moment(lastReportDate).subtract(2, 'weeks')

        const dayDistRaw = metricDistribution(
          metric,
          moment(firstReportDate),
          moment(lastReportDate),
          'day',
        )

        const dayDist = metric.isSnapshot
          ? dayDistRaw.filter((ma) => ma.value !== null)
          : dayDistRaw.map((ma) => ({...ma, value: ma.value || 0}))

        const sevenDayMA = metricMovingAverage(
          metric,
          moment(firstReportDate),
          moment(lastReportDate),
          7,
        ).filter((ma) => ma.value !== null)

        return (
          <InsightChart
            dataset={[
              {
                data: dayDist,
                color: color('insight-chart-primary'),
              },
              {
                data: sevenDayMA,
                color: color('insight-chart-secondary'),
              },
            ]}
            domain={{x: [firstDateInPeriod, moment(lastReportDate)]}}
          />
        )
      },
      weight: Math.abs(oneWeekChange),
    })
  } else if (
    metric.reports.length > 1 &&
    moment(firstReportDate).isBefore(moment(lastReportDate))
  ) {
    const reportsSortedReverse = metric.reports.sorted('date', true)
    const reportDateDiff = moment(lastReportDate)
      .startOf('day')
      .diff(moment(firstReportDate).startOf('day'), 'days')
    const lastReportChange =
      (reportsSortedReverse[0].value - reportsSortedReverse[1].value) /
      Math.abs(reportsSortedReverse[0].value)

    insights.push({
      id: `${metric.id}-last-report-change`,
      content: () => (
        <InsightContent
          header={metricDisplayName(metric)}
          callout={formatChange(lastReportChange)}
          description="from last report"
        />
      ),
      chart: () => {
        if (reportDateDiff > 0) {
          const dayDistRaw = metricDistribution(
            metric,
            moment(firstReportDate),
            moment(lastReportDate),
            'day',
          )

          const dayDist = metric.isSnapshot
            ? dayDistRaw.filter((ma) => ma.value !== null)
            : dayDistRaw.map((ma) => ({...ma, value: ma.value || 0}))

          const sevenDayMA = metricMovingAverage(
            metric,
            moment(firstReportDate),
            moment(lastReportDate),
            reportDateDiff,
          ).filter((ma) => ma.value !== null)

          return (
            <InsightChart
              dataset={[
                {
                  data: dayDist,
                  color: color('insight-chart-primary'),
                },
                {
                  data: sevenDayMA,
                  color: color('insight-chart-secondary'),
                },
              ]}
            />
          )
        }
        return (
          <InsightChart
            dataset={[
              {
                data: metric.reports.map((report) => report.value),
                color: color('insight-chart-primary'),
              },
            ]}
            abstractScale
          />
        )
      },
      weight: Math.abs(lastReportChange) / 2,
    })
  } else if (metric.reports.length === 1) {
    const firstReport = metric.reports[0]

    const fakeData = (i: number) => {
      if (firstReport.value > 0) {
        return {
          date: moment().add(i, 'days'),
          value: 100 ** i,
        }
      }
      if (firstReport.value < 0) {
        return {
          date: moment().subtract(i, 'days'),
          value: -1 / 100 ** i,
        }
      }
      return {
        date: moment().add(i, 'days'),
        value: 0,
      }
    }

    insights.push({
      id: `${metric.id}-first-report`,
      content: () => (
        <InsightContent
          header={metricDisplayName(metric)}
          callout={`${!metric.isSnapshot && firstReport.value >= 0 ? '+' : ''}${
            firstReport.value
          }`}
          description="first report value"
        />
      ),
      chart: () => {
        return (
          <InsightChart
            dataset={[
              {
                data: [...Array(5).keys()].map((i) => fakeData(i)),
                color: color('insight-chart-primary'),
              },
            ]}
          />
        )
      },
      weight: 0,
    })
  }

  return insights.map((insight) => ({
    ...insight,
    metric,
  }))
}
