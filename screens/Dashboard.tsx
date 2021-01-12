import React, {useState, useEffect, useContext, useRef} from 'react'
import {
  View,
  FlatList,
  ListRenderItemInfo,
  SectionList,
  SectionListData,
  Text,
  TouchableOpacity,
} from 'react-native'
import {useSafeArea} from 'react-native-safe-area-context'
import {StackNavigationProp} from '@react-navigation/stack'
import {CompositeNavigationProp} from '@react-navigation/native'
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs'
import {List} from 'realm'
import moment from 'moment'
import UserContext from '../contexts/UserContext'
import ReportButton, {reportButtonMarginConst} from '../components/ReportButton'
import Debug from '../lib/debug'
import {
  averageNormalizedCollections,
  distributionMovingAverage,
  getDataRange,
  getFirstReports,
  getLastReports,
  normalizedDistributions,
} from '../lib/insights'
import style from '../lib/style'
import ReportModal from '../components/ReportModal'
import Logo from '../assets/images/logo.svg'
import Dots from '../assets/images/dots.svg'
import {color, createStyleSheet, newList} from '../lib/util'
import {
  Dataset,
  DateRange,
  GoalOptionsData,
  Measurement,
  NavigationStackParamList,
  TabParamList,
} from '../types'
import {Goal, Metric} from '../lib/database'
import GoalOptionsModal from '../components/GoalOptionsModal'
import AddGoalButton from '../components/AddGoalButton'
import OverviewChart from '../components/OverviewChart'

const styles = createStyleSheet({
  ...style,
  reportList: {
    ...style.scrollView,
    paddingHorizontal: reportButtonMarginConst * 2,
  },
  reportRow: {
    flexGrow: 1,
    marginVertical: 6.25,
  },
  goalName: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: reportButtonMarginConst * 2,
    paddingHorizontal: reportButtonMarginConst * 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricList: {
    marginTop: 2,
    marginBottom: 8,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: reportButtonMarginConst,
  },
})

type DashboardProps = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, 'Dashboard'>,
    StackNavigationProp<NavigationStackParamList>
  >
}

const Dashboard = ({navigation}: DashboardProps) => {
  const user = useContext(UserContext)
  const [goals, setGoals] = useState<List<Goal>>(newList())
  const [reportMetric, setReportMetric] = useState<Metric | null>(null)
  const [
    goalOptionsData,
    setGoalOptionsData,
  ] = useState<GoalOptionsData | null>(null)
  const [overviewDataset, setOverviewDataset] = useState<Dataset>([])
  const [overviewDomain, setOverviewDomain] = useState<
    | {
        x: DateRange
        y?: [number, number]
      }
    | undefined
  >(undefined)

  const optionsRef = useRef<{
    [key: string]: TouchableOpacity | null
  }>({})

  useEffect(() => {
    setGoals(user?.goals?.sorted('order') ?? newList())
  }, [user])

  useEffect(() => {
    const metrics = goals
      .map((goal) => goal.metrics.map((metric) => metric))
      .flat()

    if (!metrics.length) {
      setOverviewDomain(undefined)
      setOverviewDataset([])
      return
    }

    const firstReports = getFirstReports(metrics)
    const lastReports = getLastReports(metrics)

    if (!firstReports.length || !lastReports.length) {
      setOverviewDomain(undefined)
      setOverviewDataset([])
      return
    }

    const firstReportDate = moment.max(
      moment().subtract(3, 'months'),
      moment.min(firstReports.map((r) => moment(r.date))),
    )
    const lastReportDate = moment.max(lastReports.map((r) => moment(r.date)))

    if (moment(firstReportDate).isBefore(lastReportDate, 'day')) {
      const dayDists = normalizedDistributions(
        metrics,
        moment(firstReportDate).subtract(7, 'days'),
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
        moment(firstReportDate).subtract(7, 'days'),
        lastReportDate,
        7,
      )

      setOverviewDataset([
        {
          data: averageSevenDayMA,
          color: color('insight-chart-secondary'),
        },
        {
          data: averageDayDist.filter((dist) => dist.reported !== false),
          color: color('insight-chart-primary'),
        },
      ])

      setOverviewDomain({
        x: [firstReportDate, lastReportDate],
        y: getDataRange([overviewDataset]) ?? [0, 1],
      })
    } else {
      setOverviewDomain(undefined)
      setOverviewDataset([])
    }
  }, [goals])

  const onReportClose = () => {
    setReportMetric(null)
  }

  const onReportHistory = () => {
    if (reportMetric) {
      navigation.navigate('Reports', {metric: reportMetric})
      onReportClose()
    }
  }

  const onGoalOptionsClose = () => {
    setGoalOptionsData(null)
  }

  const onEditGoal = () => {
    if (goalOptionsData) {
      navigation.navigate('EditGoal', {
        goal: goalOptionsData.goal,
      })
      onGoalOptionsClose()
    }
  }

  const onReorderGoals = () => {
    if (goalOptionsData) {
      navigation.navigate('ReorderGoals', {
        goals,
      })
      onGoalOptionsClose()
    }
  }

  const handleGoalOptions = (goal: Goal, measurement: Measurement | null) => {
    setGoalOptionsData({
      goal,
      measurement,
    })
  }

  const renderHeaderComponent = () => (
    <>
      <View
        style={{
          ...styles.titleContainerPadded,
          alignItems: 'center',
        }}>
        <View
          style={{
            paddingVertical: 5,
          }}>
          <Logo width={35} height={35} fill={color('purple')} />
        </View>
        <AddGoalButton />
      </View>
      {overviewDataset.length && overviewDomain ? (
        <OverviewChart dataset={overviewDataset} domain={overviewDomain} />
      ) : null}
    </>
  )

  const renderGoalName = (info: {section: SectionListData<List<Metric>>}) => (
    <View style={styles.goalName}>
      <Text style={styles.textBold} numberOfLines={1}>
        {info.section.goal.name}
      </Text>
      <TouchableOpacity
        key={info.section.goal.id}
        ref={(ref) => {
          if (optionsRef.current && ref) {
            optionsRef.current[info.section.goal.id] = ref
          }
        }}
        onPress={() => {
          if (optionsRef.current?.[info.section.goal.id]) {
            optionsRef.current?.[info.section.goal.id]?.measureInWindow(
              (x, y, width, height) => {
                handleGoalOptions(info.section.goal, {
                  x,
                  y,
                  width,
                  height,
                })
              },
            )
          } else {
            handleGoalOptions(info.section.goal, null)
          }
        }}
        hitSlop={{
          bottom: 15,
          left: 20,
          right: 20,
          top: 15,
        }}>
        <Dots
          style={{marginTop: -5}}
          width={30}
          height={30}
          fill={color('black-lighter')}
        />
      </TouchableOpacity>
    </View>
  )

  const renderReportButton = ({item: metric}: ListRenderItemInfo<Metric>) => (
    <ReportButton metric={metric} onReportPress={setReportMetric} />
  )

  const data = goals.map((goal) => ({
    goal,
    data: [goal.metrics],
  }))

  return (
    <>
      <View
        style={{
          ...styles.safeAreaView,
          paddingTop: useSafeArea().top || 10,
        }}>
        <SectionList
          style={styles.reportList}
          contentContainerStyle={styles.scrollViewContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={renderHeaderComponent}
          sections={data}
          keyExtractor={(metrics) => metrics.map((metric) => metric.id).join()}
          renderSectionHeader={renderGoalName}
          renderItem={({item}) =>
            item.length ? (
              <FlatList
                style={styles.metricList}
                numColumns={3}
                columnWrapperStyle={styles.reportRow}
                scrollEnabled={false}
                data={item}
                renderItem={renderReportButton}
              />
            ) : (
              <View style={styles.metricList} />
            )
          }
        />
      </View>
      <ReportModal
        metric={reportMetric}
        onClose={onReportClose}
        onHistory={onReportHistory}
      />
      <GoalOptionsModal
        data={goalOptionsData}
        onEditGoal={onEditGoal}
        onReorderGoals={onReorderGoals}
        onClose={onGoalOptionsClose}
      />
      <Debug />
    </>
  )
}

export default Dashboard
