import React from 'react'
import {Dimensions, View} from 'react-native'
import {VictoryAxis, VictoryChart, VictoryLine} from 'victory-native'
import {DomainPropType} from 'victory-core'
import {v4 as uuid} from 'uuid'
import {Defs, LinearGradient, Stop} from 'react-native-svg'
import moment from 'moment'
import ChartTheme from '../lib/chart-theme'
import style from '../lib/style'
import {createStyleSheet} from '../lib/util'
import {Dataset, DateRange} from '../types'

const styles = createStyleSheet({
  ...style,
  overviewChart: {
    alignItems: 'center',
    alignContent: 'center',
    marginLeft: 10,
  },
})

type OverviewChartProps = {
  dataset: Dataset
  domain?: {x: DateRange; y?: [number, number]}
}

const OverviewChart = ({dataset, domain}: OverviewChartProps) => {
  const chartWidth = Dimensions.get('window').width
  const chartHeight = 300

  const yPadding = domain?.y ? 20 : undefined

  return (
    <View style={styles.overviewChart}>
      <VictoryChart
        theme={ChartTheme}
        scale={{x: 'time'}}
        width={chartWidth}
        height={chartHeight}
        domainPadding={{
          x: [0, 0],
          y: yPadding ? [yPadding, yPadding] : [0, 0],
        }}
        domain={(domain as unknown) as DomainPropType}>
        <VictoryAxis fixLabelOverlap />
        <VictoryAxis
          dependentAxis
          tickFormat={(t) => `${Math.round(t * 100)}%`}
        />
        {dataset.map((data, index) => (
          <VictoryLine
            key={uuid()}
            style={{
              data: {
                stroke: `url(#overviewGradient-${index})`,
                strokeWidth: 3,
              },
            }}
            data={data.data}
            x="date"
            y="value"
          />
        ))}
        {dataset.map((data, index) => (
          <Defs key={uuid()}>
            {moment().diff(
              moment(data.data[data.data.length - 1].date),
              'days',
            ) > 0 ? (
              <LinearGradient
                id={`overviewGradient-${index}`}
                x1="0"
                y1="0"
                x2="1"
                y2="0">
                <Stop
                  offset="0%"
                  stopColor={data.color}
                  stopOpacity={index === 1 ? '0.7' : '0.4'}
                />
                <Stop
                  offset="100%"
                  stopColor={data.color}
                  stopOpacity={index === 1 ? '0.7' : '0.4'}
                />
              </LinearGradient>
            ) : (
              <LinearGradient
                id={`overviewGradient-${index}`}
                x1="0"
                y1="0"
                x2="1"
                y2="0">
                <Stop
                  offset="0%"
                  stopColor={data.color}
                  stopOpacity={index === 1 ? '0.7' : '0.4'}
                />
                <Stop
                  offset={`${
                    99 -
                    (moment(data.data[data.data.length - 1].date).diff(
                      moment(data.data[data.data.length - 2].date),
                    ) /
                      moment(data.data[data.data.length - 1].date).diff(
                        moment(data.data[0].date),
                      )) *
                      100
                  }%`}
                  stopColor={data.color}
                  stopOpacity={index === 1 ? '0.7' : '0.4'}
                />
                <Stop
                  offset={`${
                    100 -
                    (moment(data.data[data.data.length - 1].date).diff(
                      moment(data.data[data.data.length - 2].date),
                    ) /
                      moment(data.data[data.data.length - 1].date).diff(
                        moment(data.data[0].date),
                      )) *
                      100
                  }%`}
                  stopColor={data.color}
                  stopOpacity={index === 1 ? '0.35' : '0.2'}
                />
                <Stop offset="100%" stopColor={data.color} stopOpacity="0" />
              </LinearGradient>
            )}
          </Defs>
        ))}
      </VictoryChart>
    </View>
  )
}

export default OverviewChart
