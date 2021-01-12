import React, {useEffect, useState} from 'react'
import {FlatList, ListRenderItemInfo, Text, View} from 'react-native'
import {useSafeArea} from 'react-native-safe-area-context'
import moment from 'moment'
import analytics from '@segment/analytics-react-native'
import {RouteProp} from '@react-navigation/native'
import {Results} from 'realm'
import BackButton from '../components/BackButton'
import style from '../lib/style'
import Spacer from '../components/Spacer'
import {color, createStyleSheet, metricDisplayName, newList} from '../lib/util'
import ReportItem from '../components/Report'
import {db, Report} from '../lib/database'
import {showDefaultError} from '../lib/error'
import {NavigationStackParamList} from '../types'

const styles = createStyleSheet(style)

type ReportsProps = {
  route: RouteProp<NavigationStackParamList, 'Reports'>
}

const Reports = ({route}: ReportsProps) => {
  const {metric} = route.params ?? {}

  const [reports, setReports] = useState<Results<Report>>(newList())

  useEffect(() => {
    setReports(metric.reports.sorted('date', true))
  }, [metric])

  const deleteReport = (report: Report) => {
    analytics.track('Report Deleted', {
      goalId: report.metric?.[0]?.goal?.[0]?.id,
      goalName: report.metric?.[0]?.goal?.[0]?.name,
      goalColor: report.metric?.[0]?.goal?.[0]?.color,
      metricCount: report.metric?.[0]?.goal?.[0]?.metrics?.length,
      metricId: report.metric?.[0]?.id,
      metricName: report.metric?.[0]?.name,
      metricIsSnapshot: report.metric?.[0]?.isSnapshot,
      metricIsDecreasing: report.metric?.[0]?.isDecreasing,
      metricWeight: report.metric?.[0]?.weight,
      date: moment(report.date).toISOString(),
      value: +report.value,
    })

    try {
      db()?.write(() => {
        db()?.delete(report)
      })
    } catch (e) {
      showDefaultError(e, true)
    }

    setReports(metric.reports.sorted('date', true))
  }

  const renderReport = ({item: report, index}: ListRenderItemInfo<Report>) => (
    <ReportItem
      report={report}
      onReportDelete={deleteReport}
      noTopBorder={index === 0}
    />
  )

  const renderHeader = () => (
    <>
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.headerText}>Reports</Text>
        <Spacer />
      </View>
      <View style={styles.titleContainer}>
        <Text
          style={{
            ...styles.title,
            paddingTop: 20,
            paddingBottom: 10,
            color: color(metric.goal?.[0]?.color),
          }}
          numberOfLines={1}>
          {metricDisplayName(metric)}
        </Text>
      </View>
    </>
  )

  return (
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
        data={reports}
        ListHeaderComponent={renderHeader}
        renderItem={renderReport}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  )
}

export default Reports
