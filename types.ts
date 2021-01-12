import {Moment} from 'moment'
import {List} from 'realm'
import {Goal, Metric} from './lib/database'

export type DateRange = [Moment, Moment]

export type Distribution = {
  date: Moment
  value: number | null
  reported?: boolean
}

export type DistributionCollection = {
  [key: string]: Distribution[]
}

export type DistributionFiltered = {
  date: Moment
  value: number
}

export type SnapshotCollection = {
  [key: string]: number | null
}

export type CollectionMap = {
  [key: string]: {
    reported: boolean
    value: number
  }
}

export type Dataset = {
  data: any[]
  color: string
}[]

export type Measurement = {
  x: number
  y: number
  width: number
  height: number
}

export type GoalOptionsData = {
  goal: Goal
  measurement: Measurement | null
}

export type Insight = {
  id: string
  weight: number
  content: () => any
  image?: () => any
  chart?: () => any
  onPress?: () => void
  goal?: Goal
  metric?: Metric
}

export type MetricDetails = {
  name: string
  isSnapshot: boolean
  isDecreasing: boolean
  weight: number
}

export type NavigationStackParamList = {
  Loading: undefined
  Welcome: undefined
  Root: undefined
  AddGoal: {
    isOnboarding?: boolean
    doneScreen?: string
  }
  AddMetrics: {
    goalName: string
    isOnboarding?: boolean
    doneScreen?: string
  }
  EditGoal: {
    goal: Goal
  }
  ReorderGoals: {
    goals: List<Goal>
  }
  Reports: {
    metric: Metric
  }
}

export type TabParamList = {
  Dashboard: undefined
  Analytics: undefined
  Settings: undefined
}
