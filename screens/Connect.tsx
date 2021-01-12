import React from 'react'
import {Dimensions, ScrollView, Text, View} from 'react-native'
import {useSafeArea} from 'react-native-safe-area-context'
import {color, createStyleSheet} from '../lib/util'
import style from '../lib/style'
import Logo from '../assets/images/logo.svg'
import UnderConstruction from '../assets/images/under-construction.svg'

const styles = createStyleSheet({
  ...style,
  titleContainer: {
    ...style.titleContainer,
    marginHorizontal: 10,
    marginTop: 15,
    marginBottom: 20,
  },
})

const Connect = () => (
  <View
    style={{
      ...styles.safeAreaView,
      paddingTop: useSafeArea().top || 10,
    }}>
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={{
        ...styles.scrollViewContainer,
        flexGrow: 0.5,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <View style={styles.logoContainer}>
        <Logo width={35} height={35} fill={color('purple')} />
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Connect</Text>
      </View>
      <View
        style={{
          flexGrow: 1,
          alignItems: 'center',
        }}>
        <UnderConstruction width={250} height={154} />
        <Text
          style={{
            ...styles.text,
            fontSize: 24,
            textAlign: 'center',
            marginTop: 28,
          }}>
          Coming Soon
        </Text>
      </View>
    </ScrollView>
  </View>
)

export default Connect
