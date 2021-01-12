import React from 'react'
import {Dimensions, View} from 'react-native'
import {
  VictoryBar,
  VictoryLine,
  VictoryChart,
  VictoryClipContainer,
  VictoryAxis,
} from 'victory-native'
import {DomainPropType} from 'victory-core'
import {v4 as uuid} from 'uuid'
import moment, {Moment} from 'moment'
import ChartTheme from '../lib/chart-theme'
import style from '../lib/style'
import {createStyleSheet} from '../lib/util'
import {Dataset} from '../types'

const styles = createStyleSheet({
  ...style,
  analyticsChart: {
    alignItems: 'center',
    marginLeft: 10,
  },
})

type AnalyticsChartProps = {
  barData?: Dataset
  lineData?: Dataset
  domain?: {x: [Moment, Moment]; y?: [number, number]}
  screenPadding?: number
  isGradient?: boolean
  height?: number
}

const AnalyticsChart = ({
  barData,
  lineData,
  domain,
  screenPadding,
  isGradient,
  height,
}: AnalyticsChartProps) => {
  const chartWidth = Dimensions.get('window').width - (screenPadding ?? 10)
  const chartHeight = height ?? 300

  let barWidth: number | undefined
  if (barData?.length) {
    barWidth = chartWidth / barData[0].data.length / 2
  } else if (lineData?.length) {
    barWidth = chartWidth / lineData[0].data.length / 2
  }

  const newDomain:
    | {x: [Moment, Moment]; y?: [number, number]}
    | undefined = domain

  let cornerRadius = 1

  if (newDomain) {
    const dateDiff = newDomain.x[1].diff(newDomain.x[0], 'day')

    switch (dateDiff) {
      case 0:
        barWidth = chartWidth / 2
        newDomain.x[1] = moment(newDomain.x[0]).add(6, 'hours')
        break
      case 1:
        barWidth = chartWidth / 3
        break
      case 2:
        barWidth = chartWidth / 5
        break
      default:
        barWidth = chartWidth / newDomain.x[1].diff(newDomain.x[0], 'days') / 2
    }

    if (dateDiff <= 31) {
      cornerRadius = 2
    }

    if (isGradient) {
      newDomain.y = [0, 1]
    }
  }

  const padding = barWidth ? barWidth / 2 : 0

  return (
    <View style={styles.analyticsChart}>
      <VictoryChart
        theme={ChartTheme}
        scale={{x: 'time'}}
        width={chartWidth}
        height={chartHeight}
        domainPadding={{
          x: [padding, padding],
          y: domain?.y ? [padding, padding] : [0, 1],
        }}
        domain={(newDomain as unknown) as DomainPropType}>
        <VictoryAxis fixLabelOverlap />
        <VictoryAxis
          dependentAxis
          tickFormat={(t) =>
            isGradient ? `${Math.round(t * 100)}%` : Math.round(t * 100) / 100
          }
        />
        {barData &&
          barData.map((bar, idx) => (
            <VictoryBar
              key={uuid()}
              style={{
                data: {
                  fill: bar.color,
                },
              }}
              data={bar.data}
              x="date"
              y="value"
              barWidth={barWidth}
              cornerRadius={cornerRadius}
              groupComponent={<VictoryClipContainer />}
            />
          ))}
        {lineData &&
          lineData.map((line, idx) => (
            <VictoryLine
              key={uuid()}
              style={{
                data: {
                  stroke: line.color,
                  strokeWidth: 2,
                },
              }}
              data={line.data}
              x="date"
              y="value"
              groupComponent={<VictoryClipContainer />}
            />
          ))}
      </VictoryChart>
    </View>
  )
}

export default AnalyticsChart
