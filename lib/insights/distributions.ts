import moment, {Moment, unitOfTime} from 'moment'
import {List} from 'realm'
import {formatQueryDate} from '../util'
import {Metric, Report} from '../database'
import {
  CollectionMap,
  Dataset,
  Distribution,
  DistributionCollection,
  DistributionFiltered,
  SnapshotCollection,
} from '../../types'

export const normalizeCollection = (collection: Distribution[]) => {
  const collectionFiltered = collection.filter(
    (d) => d.value !== null,
  ) as DistributionFiltered[]

  const max =
    collectionFiltered.length &&
    Math.max(...collectionFiltered.map((x) => x.value))
  const min =
    collectionFiltered.length &&
    Math.min(...collectionFiltered.map((x) => x.value))

  const collectionNormalized = collection.map((x) => {
    let value = null
    if (x.value !== null) {
      if (max === min) {
        value = 0.5
      } else {
        value = (x.value - min) / (max - min)
      }
    }

    return {
      ...x,
      value,
    }
  })

  return collectionNormalized
}

export const averageNormalizedCollections = (
  collections: DistributionCollection,
  metrics: List<Metric> | Metric[],
  firstReports: Report[],
) => {
  const averageCollectionMap: CollectionMap = {}
  for (const metric of metrics) {
    let lastReportedValue = null

    for (const collection of collections[metric.id]) {
      const {date, value} = collection
      const dateKey = date.toISOString()

      let reportedValue = value

      if (
        reportedValue === null &&
        lastReportedValue !== null &&
        metric.isSnapshot
      ) {
        reportedValue = lastReportedValue
      }

      if (reportedValue !== null) {
        if (averageCollectionMap[dateKey]) {
          averageCollectionMap[dateKey].reported =
            averageCollectionMap[dateKey].reported || value !== null

          averageCollectionMap[dateKey].value +=
            (metric.isDecreasing ? 1 - reportedValue : reportedValue) *
            metric.weight
        } else {
          averageCollectionMap[dateKey] = {
            reported: value !== null,
            value:
              (metric.isDecreasing ? 1 - reportedValue : reportedValue) *
              metric.weight,
          }
        }

        lastReportedValue = reportedValue
      }
    }
  }

  const averageCollection = []
  for (const [date, {reported, value}] of Object.entries(
    averageCollectionMap,
  )) {
    const avgValue =
      value /
      firstReports
        // .filter((report) =>
        //   moment(report.date).isSameOrBefore(moment(date), 'day'),
        // )
        .reduce((accum, report) => accum + (report.metric?.[0]?.weight || 0), 0)

    averageCollection.push({
      date: moment(date),
      value: Number.isFinite(avgValue) ? avgValue : 0,
      reported,
    })
  }

  return averageCollection
}

export const averageNormalizedSnapshots = (
  snapshots: SnapshotCollection,
  date: Moment,
  metrics: List<Metric> | Metric[],
  firstReports: Report[],
) => {
  let value = null

  for (const metric of metrics) {
    const snapshot = snapshots[metric.id]

    if (snapshot !== null) {
      if (value === null) {
        value = (metric.isDecreasing ? 1 - snapshot : snapshot) * metric.weight
      } else {
        value += (metric.isDecreasing ? 1 - snapshot : snapshot) * metric.weight
      }
    }
  }

  if (value === null) {
    return 0
  }

  const avgValue =
    value /
    firstReports
      // .filter((report) =>
      //   moment(report.date).isSameOrBefore(moment(date), 'day'),
      // )
      .reduce((accum, report) => accum + (report.metric?.[0]?.weight || 0), 0)

  return Number.isFinite(avgValue) ? avgValue : 0
}

export const metricDistribution = (
  metric: Metric,
  startDate: Moment,
  endDate: Moment,
  period: unitOfTime.DurationConstructor,
) => {
  const data: Distribution[] = []

  if (moment(startDate).isAfter(endDate, period)) {
    return data
  }

  for (
    let currDay = moment(startDate).startOf(period);
    currDay.isSameOrBefore(endDate, period);
    currDay.add(1, period).startOf(period)
  ) {
    const periodStartDay = moment(currDay)
    const periodEndDay = moment(currDay).endOf(period)

    const reportsInRange = metric.reports.filtered(
      `date >= ${formatQueryDate(periodStartDay)} AND date <= ${formatQueryDate(
        periodEndDay,
      )}`,
    )

    let value = null
    if (reportsInRange.length) {
      if (metric.isSnapshot) {
        value = reportsInRange.avg('value')
      } else {
        value = reportsInRange.sum('value')
      }
    } else if (!metric.isSnapshot) {
      value = 0
    }

    data.push({
      date: moment(periodStartDay),
      value,
    })
  }

  return data
}

export const metricMovingAverageSnapshot = (
  metric: Metric,
  date: Moment,
  periodDays: number,
) => {
  const adjPeriod = periodDays - 1

  if (adjPeriod < 0) {
    return null
  }

  const periodStartDay = moment(date).subtract(adjPeriod, 'days').startOf('day')

  const periodEndDay = moment(date).endOf('day')

  const reportsInRange = metric.reports.filtered(
    `date >= ${formatQueryDate(periodStartDay)} AND date <= ${formatQueryDate(
      periodEndDay,
    )}`,
  )

  let value = null
  if (reportsInRange.length) {
    if (metric.isSnapshot) {
      value = reportsInRange.avg('value')
    } else {
      const sum = reportsInRange.sum('value')
      if (sum !== null) {
        value = sum / periodDays
      }
    }
  }

  return value
}

export const metricMovingAverage = (
  metric: Metric,
  startDate: Moment,
  endDate: Moment,
  periodDays: number,
) => {
  const adjPeriod = periodDays - 1

  const data: Distribution[] = []

  if (adjPeriod < 0 || moment(startDate).isAfter(endDate, 'day')) {
    return data
  }

  for (
    let currDay = moment(startDate).startOf('day');
    currDay.isSameOrBefore(endDate, 'day');
    currDay.add(1, 'day').startOf('day')
  ) {
    const periodStartDay = moment(currDay)
      .subtract(adjPeriod, 'days')
      .startOf('day')

    const periodEndDay = moment(currDay).endOf('day')

    const reportsInRange = metric.reports.filtered(
      `date >= ${formatQueryDate(periodStartDay)} AND date <= ${formatQueryDate(
        periodEndDay,
      )}`,
    )

    let value = null
    if (reportsInRange.length) {
      if (metric.isSnapshot) {
        value = reportsInRange.avg('value')
      } else {
        const sum = reportsInRange.sum('value')
        if (sum !== null) {
          value = sum / periodDays
        }
      }
    } else if (!metric.isSnapshot) {
      value = 0
    }

    data.push({
      date: moment(currDay),
      value,
    })
  }

  return data
}

export const distributionMovingAverage = (
  data: Distribution[],
  startDate: Moment,
  endDate: Moment,
  periodDays: number,
) => {
  const adjPeriod = periodDays - 1

  if (adjPeriod < 0 || moment(startDate).isAfter(endDate, 'day')) {
    return data
  }

  const dataMap: {[p: string]: number} = {}

  for (const d of data) {
    const periodStartDay = moment(d.date).startOf('day')

    const periodEndDay = moment(d.date).add(adjPeriod, 'days').endOf('day')

    for (
      let currDay = moment(periodStartDay).startOf('day');
      currDay.isSameOrBefore(periodEndDay, 'day');
      currDay.add(1, 'day').startOf('day')
    ) {
      const dateKey = currDay.toISOString()
      if (d.value !== null) {
        if (dataMap[dateKey]) {
          dataMap[dateKey] += d.value
        } else {
          dataMap[dateKey] = d.value
        }
      }
    }
  }

  const averageCollection = []
  for (
    let currDay = moment(startDate).startOf('day');
    currDay.isSameOrBefore(endDate, 'day');
    currDay.add(1, 'day').startOf('day')
  ) {
    const dateKey = currDay.toISOString()
    if (dataMap[dateKey] !== undefined) {
      const avgValue = dataMap[dateKey] / periodDays

      averageCollection.push({
        date: moment(currDay),
        value: Number.isFinite(avgValue) ? avgValue : null,
      })
    }
  }

  return averageCollection
}

export const normalizedDistributions = (
  metrics: List<Metric> | Metric[],
  startDate: Moment,
  endDate: Moment,
  period: unitOfTime.DurationConstructor,
) => {
  const normalizedDists: DistributionCollection = {}

  for (const metric of metrics) {
    const distribution = metricDistribution(metric, startDate, endDate, period)

    normalizedDists[metric.id] = normalizeCollection(distribution)
  }

  return normalizedDists
}

export const normalizedMovingAverageSnapshots = (
  metrics: List<Metric> | Metric[],
  date: Moment,
  startDate: Moment,
  endDate: Moment,
  periodDays: number,
) => {
  const normalizedAverageSnapshots: SnapshotCollection = {}

  for (const metric of metrics) {
    const movingAverageSnapshot = metricMovingAverageSnapshot(
      metric,
      date,
      periodDays,
    )

    if (movingAverageSnapshot === null) {
      normalizedAverageSnapshots[metric.id] = null
    } else {
      const reportsInRange = metric.reports.filtered(
        `date >= ${formatQueryDate(startDate)} AND date <= ${formatQueryDate(
          endDate,
        )}`,
      )

      const max = reportsInRange.max('value') as number | null
      const min = reportsInRange.min('value') as number | null

      normalizedAverageSnapshots[metric.id] =
        max === null || min === null || max === min
          ? 0.5
          : (movingAverageSnapshot - min) / (max - min)
    }
  }

  return normalizedAverageSnapshots
}

export const normalizedMovingAverages = (
  metrics: List<Metric> | Metric[],
  startDate: Moment,
  endDate: Moment,
  periodDays: number,
) => {
  const normalizedAverages: DistributionCollection = {}

  for (const metric of metrics) {
    const movingAverage = metricMovingAverage(
      metric,
      startDate,
      endDate,
      periodDays,
    )

    normalizedAverages[metric.id] = normalizeCollection(movingAverage)
  }

  return normalizedAverages
}

export const getFirstReports = (metrics: List<Metric> | Metric[]): Report[] => {
  return metrics
    .filter((metric) => metric.reports.length > 0)
    .map((metric) => metric.reports.sorted('date')[0])
}

export const getLastReports = (metrics: List<Metric> | Metric[]): Report[] => {
  return metrics
    .filter((metric) => metric.reports.length > 0)
    .map((metric) => metric.reports.sorted('date', true)[0])
}

export const getChange = (
  metric: Metric,
  startDate: Moment,
  endDate: Moment,
  periodDays: number,
) => {
  const startSnapshot = metricMovingAverageSnapshot(
    metric,
    startDate,
    periodDays,
  )
  const endSnapshot = metricMovingAverageSnapshot(metric, endDate, periodDays)

  if (startSnapshot === null || endSnapshot === null) {
    return 0
  }

  return (endSnapshot - startSnapshot) / Math.abs(endSnapshot)
}

export const getNormalizedChange = (
  metrics: List<Metric> | Metric[],
  startDate: Moment,
  endDate: Moment,
  periodDays: number,
  rangeStartDate: Moment,
  rangeEndDate: Moment,
  firstReports: Report[],
) => {
  const startSnapshots = normalizedMovingAverageSnapshots(
    metrics,
    startDate,
    rangeStartDate,
    rangeEndDate,
    periodDays,
  )
  const averageStartSnapshot = averageNormalizedSnapshots(
    startSnapshots,
    startDate,
    metrics,
    firstReports,
  )

  const endSnapshots = normalizedMovingAverageSnapshots(
    metrics,
    endDate,
    rangeStartDate,
    rangeEndDate,
    periodDays,
  )
  const averageEndSnapshot = averageNormalizedSnapshots(
    endSnapshots,
    endDate,
    metrics,
    firstReports,
  )

  return (
    (averageEndSnapshot - averageStartSnapshot) / Math.abs(averageEndSnapshot)
  )
}

export const getDataRange: (
  datasets: Dataset[],
) => [number, number] | undefined = (datasets) => {
  const dataset: Dataset = []
  datasets.forEach((d) => dataset.push(...d))

  if (!dataset.length) {
    return undefined
  }

  return [
    Math.min(
      ...dataset.map((ds) =>
        Math.min(
          ...ds.data
            .filter(
              (d: {value: number | null; reported?: boolean}) =>
                d.value !== null && d.reported !== false,
            )
            .map((d: {value: number}) => d.value),
        ),
      ),
    ),
    Math.max(
      ...dataset.map((ds) =>
        Math.max(
          ...ds.data
            .filter(
              (d: {value: number | null; reported?: boolean}) =>
                d.value !== null && d.reported !== false,
            )
            .map((d: {value: number}) => d.value),
        ),
      ),
    ),
  ]
}
