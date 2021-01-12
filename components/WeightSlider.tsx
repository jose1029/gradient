import React from 'react'
import {Dimensions} from 'react-native'
import Slider from '@react-native-community/slider'
import style from '../lib/style'
import {color, createStyleSheet} from '../lib/util'

const styles = createStyleSheet({
  ...style,
  weightSlider: {
    width: Dimensions.get('window').width - 80,
  },
})

type WeightSliderProps = {
  weight: number
  onChange: (value: number) => void
}

const WeightSlider = ({weight, onChange}: WeightSliderProps) => (
  <Slider
    style={styles.weightSlider}
    minimumTrackTintColor={color('purple')}
    minimumValue={0}
    maximumValue={100}
    step={5}
    value={weight}
    onValueChange={onChange}
  />
)

export default WeightSlider
