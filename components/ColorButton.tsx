import React from 'react'
import {TouchableOpacity} from 'react-native'
import style from '../lib/style'
import {color as colorFunc, createStyleSheet} from '../lib/util'

const styles = createStyleSheet({
  ...style,
  colorButton: {
    alignSelf: 'center',
    padding: 15,
    margin: 20,
    borderRadius: 100,
  },
})

const colorMap: {[key: string]: string} = {
  purple: 'blue',
  blue: 'green',
  green: 'orange',
  orange: 'purple',
}

type ColorButtonProps = {
  color: string
  onChange: (color: string) => void
}

const ColorButton = ({color, onChange}: ColorButtonProps) => {
  const onPress = () => {
    onChange(colorMap[color] || 'purple')
  }

  return (
    <TouchableOpacity
      style={{
        ...styles.colorButton,
        backgroundColor: colorFunc(color),
      }}
      onPress={onPress}
    />
  )
}

export default ColorButton
