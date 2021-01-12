import React, {memo} from 'react'
import {TouchableOpacity, View} from 'react-native'
import analytics from '@segment/analytics-react-native'
import style from '../lib/style'
import {createStyleSheet} from '../lib/util'
import {Insight as InsightType} from '../types'

const styles = createStyleSheet({
  ...style,
  insightContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  insightContent: {
    justifyContent: 'space-around',
    flexDirection: 'column',
    alignItems: 'center',
  },
})

type InsightProps = {
  insight: InsightType
  index: number
}

const Insight = memo(({insight, index}: InsightProps) => (
  <TouchableOpacity
    style={styles.insightContainer}
    onPress={() => {
      analytics.track('Insight Pressed', {
        index,
        insightId: insight.id,
        goalId: insight.goal?.id,
        goalName: insight.goal?.name,
        metricId: insight.metric?.id,
        metricName: insight.metric?.name,
        weight: insight.weight,
        handled: !!insight.onPress,
      })
      insight.onPress?.()
    }}>
    <View style={styles.insightContent}>
      {insight.content && insight.content()}
      {insight.image && insight.image()}
      {insight.chart && insight.chart()}
    </View>
  </TouchableOpacity>
))

export default Insight
