import React from 'react'
import {View} from 'react-native'
import style from '../lib/style'
import {createStyleSheet} from '../lib/util'

const styles = createStyleSheet({
  ...style,
  spacerContainer: {
    flexGrow: 1,
    flexBasis: 0,
  },
})

type SpacerProps = {
  noFlex?: boolean
  width?: number
  height?: number
}

const Spacer = ({noFlex, width, height}: SpacerProps) => (
  <View
    style={{
      ...(noFlex ? {} : styles.spacerContainer),
      width: width ?? 'auto',
      height: height ?? 'auto',
    }}
  />
)

export default Spacer
