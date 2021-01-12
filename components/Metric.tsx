import React from 'react'
import {Text, TouchableOpacity} from 'react-native'
import style from '../lib/style'
import {color, createStyleSheet, metricDisplayName} from '../lib/util'
import {Metric as MetricType} from '../lib/database'

const styles = createStyleSheet({
  ...style,
  metricContainer: {
    padding: 20,
    marginBottom: 15,
    marginHorizontal: 10,
    borderRadius: 15,
    backgroundColor: color('light-gray'),
  },
})

type MetricProps = {
  metric: MetricType
  onPress: () => void
}

const Metric = ({metric, onPress}: MetricProps) => (
  <TouchableOpacity style={styles.metricContainer} onPress={onPress}>
    <Text
      style={{
        ...styles.text,
        fontSize: 18,
        color: color('black'),
        marginBottom: 4,
      }}
      numberOfLines={1}>
      {metricDisplayName(metric)}
    </Text>
    <Text
      style={{
        ...styles.textLight,
        fontSize: 12,
      }}
      numberOfLines={1}>
      {metric.isSnapshot ? 'Snapshot  ' : 'Incremental  '}
      <Text style={{fontWeight: '700'}}>&middot;</Text>
      {metric.isDecreasing ? '  Decreasing ' : '  Increasing  '}
      <Text style={{fontWeight: '700'}}>&middot;</Text>
      {`  ${metric.weight}x`}
    </Text>
  </TouchableOpacity>
)

export default Metric
