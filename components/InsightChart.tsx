import React from 'react'
import {Dimensions, View} from 'react-native'
import {VictoryLine, VictoryGroup} from 'victory-native'
import {DomainPropType} from 'victory-core'
import {v4 as uuid} from 'uuid'
import {Moment} from 'moment'
import ChartTheme from '../lib/chart-theme'
import style from '../lib/style'
import {createStyleSheet} from '../lib/util'
import {Dataset} from '../types'

const styles = createStyleSheet({
  ...style,
  insightChart: {
    alignItems: 'center',
    alignContent: 'center',
  },
})

type InsightChartProps = {
  dataset: Dataset
  domain?: {x: [Moment, Moment]; y?: [number, number]}
  abstractScale?: boolean
}

const InsightChart = ({dataset, domain, abstractScale}: InsightChartProps) => {
  const chartWidth = Dimensions.get('window').width
  const chartHeight = 100

  return (
    <View style={styles.insightChart}>
      <VictoryGroup
        theme={ChartTheme}
        scale={abstractScale ? undefined : {x: 'time'}}
        width={chartWidth}
        height={chartHeight}
        domainPadding={1}
        padding={0}
        domain={(domain as unknown) as DomainPropType}>
        {dataset.map((data) => (
          <VictoryLine
            key={uuid()}
            style={{
              data: {
                stroke: data.color,
                strokeWidth: 3,
              },
            }}
            data={data.data}
            x="date"
            y="value"
          />
        ))}
      </VictoryGroup>
    </View>
  )
}

export default InsightChart
