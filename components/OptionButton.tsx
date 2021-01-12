import React from 'react'
import {Text, TouchableOpacity} from 'react-native'
import style from '../lib/style'
import {createStyleSheet} from '../lib/util'

const styles = createStyleSheet(style)

type OptionButtonProps = {
  label: string
  value: boolean
  isActive: boolean
  onValueChange: (value: boolean) => void
}

const OptionButton = ({
  label,
  value,
  isActive,
  onValueChange,
}: OptionButtonProps) => (
  <TouchableOpacity
    style={isActive ? styles.optionButtonActive : styles.optionButton}
    onPress={() => onValueChange(value)}>
    <Text
      style={
        isActive ? styles.optionButtonTextActive : styles.optionButtonText
      }>
      {label}
    </Text>
  </TouchableOpacity>
)

export default OptionButton
