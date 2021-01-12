import {Moment} from 'moment'
import {StyleSheet} from 'react-native'
import {db, Goal, Metric, User} from './database'

export const color = (colorName?: string, opacity = 1): string => {
  if (!colorName) {
    return `rgba(83, 56, 139, ${opacity})`
  }

  switch (colorName) {
    case 'purple':
      return `rgba(83, 56, 139, ${opacity})`
    case 'blue':
      return `rgba(30, 101, 208, ${opacity})`
    case 'green':
      return `rgba(49, 171, 149, ${opacity})`
    case 'orange':
      return `rgba(236, 167, 86, ${opacity})`
    case 'red':
      return `rgba(224, 87, 87, ${opacity})`
    case 'purple-darker':
      return `rgba(58, 39, 97, ${opacity})`
    case 'blue-darker':
      return `rgba(21, 70, 145, ${opacity})`
    case 'green-darker':
      return `rgba(34, 119, 104, ${opacity})`
    case 'orange-darker':
      return `rgba(202, 119, 22, ${opacity})`
    case 'red-darker':
      return `rgba(183, 33, 33, ${opacity})`
    case 'white':
      return `rgba(255, 255, 255, ${opacity})`
    case 'gray':
      return `rgba(169, 167, 174, ${opacity})`
    case 'light-gray':
      return `rgba(242, 242, 242, ${opacity})`
    case 'black':
      return `rgba(25, 17, 42, ${opacity})`
    case 'black-lighter':
      return `rgba(37, 33, 42, ${opacity})`
    case 'insight-chart-primary':
      return color('purple', 0.7)
    case 'insight-chart-secondary':
      return color('gray', 0.4)
    default:
      return `rgba(83, 56, 139, ${opacity})`
  }
}

// Must be called in write transaction
export const getOrCreateUser: () => (User & Realm.Object) | undefined = () => {
  const users = db()
    ?.objects<User>(User.schema.name)
    .filtered('isActive == true')
  if (users?.length) {
    return users[0]
  }
  const user = db()?.create(User.schema.name, new User())
  return user as (User & Realm.Object) | undefined
}

export const getUserCollection = () =>
  db()?.objects<User>(User.schema.name).filtered('isActive == true')

export const goalDisplayName = (goal?: Goal) =>
  goal?.name?.trim() || 'Untitled Goal'

export const metricDisplayName = (metric?: Metric) =>
  metric?.name?.trim() || 'Untitled Metric'

export const isEmpty = (text?: string) => !text?.trim()

export const isNotEmpty = (text?: string) => !isEmpty(text)

export const isNumeric = (text?: string) =>
  isNotEmpty(text) && Number.isFinite(+text!)

export const formatQueryDate = (date: Moment) =>
  date.utc().format('YYYY-MM-DD@HH:mm:ss')

export const newList = () => [] as any

export const createStyleSheet = (styles: any) =>
  StyleSheet.create<StyleSheet.NamedStyles<any>>(styles)

export const formatChange = (change: number, precision = 1) =>
  `${change >= 0 ? '+' : ''}${
    Math.round(change * 100 * 10 ** precision) / 10 ** precision
  }%`
