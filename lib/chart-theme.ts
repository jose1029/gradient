import {VictoryThemeDefinition} from 'victory-core'
import {VictoryTheme} from 'victory-native'
import {color} from './util'

const baseTheme = VictoryTheme.material

export default {
  ...baseTheme,
  dependentAxis: {
    style: {
      ...baseTheme.axis?.style,
      axis: {
        ...baseTheme.axis?.style?.axis,
        strokeWidth: 0,
      },
      grid: {
        ...baseTheme.axis?.style?.grid,
        stroke: color('gray', 0.4),
        strokeDasharray: '5, 5',
      },
      ticks: {
        ...baseTheme.axis?.style?.ticks,
        stroke: color('gray', 0.4),
        size: 0,
      },
      tickLabels: {
        ...baseTheme.axis?.style?.tickLabels,
        fill: color('gray'),
      },
    },
  },
  independentAxis: {
    style: {
      ...baseTheme.axis?.style,
      axis: {
        ...baseTheme.axis?.style?.axis,
        stroke: color('gray', 0.4),
        strokeWidth: 1,
      },
      grid: {
        ...baseTheme.axis?.style?.grid,
        strokeWidth: 0,
      },
      ticks: {
        ...baseTheme.axis?.style?.ticks,
        size: 2,
        strokeWidth: 0,
      },
      tickLabels: {
        ...baseTheme.axis?.style?.tickLabels,
        fill: color('gray'),
      },
    },
  },
  line: {
    interpolation: 'basis',
  },
} as VictoryThemeDefinition
