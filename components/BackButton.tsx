import React from 'react'
import {Text, TouchableOpacity, View} from 'react-native'
import {useNavigation} from '@react-navigation/native'
import style from '../lib/style'
import BackIcon from '../assets/images/cta-back.svg'
import {color, createStyleSheet} from '../lib/util'

const styles = createStyleSheet({
  ...style,
  backButtonContainer: {
    flexGrow: 1,
    flexBasis: 0,
  },
  backButton: {
    backgroundColor: '#F2F2F3',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
})

type BackButtonProps = {
  returnRoute?: string
}

const BackButton = ({returnRoute}: BackButtonProps) => {
  const navigation = useNavigation()

  const onPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    }
    if (returnRoute) {
      navigation.navigate(returnRoute)
    }
  }

  return (
    <View style={styles.backButtonContainer}>
      <TouchableOpacity style={styles.backButton} onPress={onPress}>
        <BackIcon width={14} height={16} fill={color('black-lighter')} />
        <Text
          style={{
            ...styles.text,
            fontSize: 14,
            marginLeft: 7,
          }}>
          Back
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default BackButton
