import React from 'react'
import {Text, TouchableOpacity, View} from 'react-native'
import style from '../lib/style'
import {createStyleSheet} from '../lib/util'

const styles = createStyleSheet({
  ...style,
  instructionsButtonContainer: {
    flexGrow: 1,
    flexBasis: 0,
  },
  instructionsButton: {
    backgroundColor: '#F2F2F3',
    borderRadius: 100,
    alignSelf: 'flex-end',
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
})

type InstructionsButtonProps = {
  onPress: () => void
}

const InstructionsButton = ({onPress}: InstructionsButtonProps) => (
  <View style={styles.instructionsButtonContainer}>
    <TouchableOpacity style={styles.instructionsButton} onPress={onPress}>
      <Text
        style={{
          ...styles.textSemibold,
          fontSize: 18,
          lineHeight: 20,
        }}>
        ?
      </Text>
    </TouchableOpacity>
  </View>
)

export default InstructionsButton
