import React from 'react'
import {Text, TouchableOpacity, View} from 'react-native'
import {useSafeArea} from 'react-native-safe-area-context'
import {StackNavigationProp} from '@react-navigation/stack'
import style from '../lib/style'
import Logo from '../assets/images/logo.svg'
import {color, createStyleSheet} from '../lib/util'
import Debug from '../lib/debug'
import {NavigationStackParamList} from '../types'

const styles = createStyleSheet({
  ...style,
  welcomeContainerCenter: {
    ...style.containerCenter,
    padding: 10,
  },
  welcomeTitle: {
    ...style.textBold,
    fontSize: 32,
    marginTop: 40,
    marginBottom: 20,
    marginHorizontal: 10,
  },
  welcomeSubtitle: {
    ...style.textLight,
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 30,
    textAlign: 'center',
    marginHorizontal: 10,
  },
})

type WelcomeProps = {
  navigation: StackNavigationProp<NavigationStackParamList, 'Welcome'>
}

const Welcome = ({navigation}: WelcomeProps) => {
  const onNext = () => {
    navigation.navigate('AddGoal', {isOnboarding: true})
  }

  return (
    <>
      <View
        style={{
          ...styles.safeAreaView,
          paddingTop: useSafeArea().top || 10,
        }}>
        <View style={styles.welcomeContainerCenter}>
          <View style={styles.logoContainerCenter}>
            <Logo width={80} height={80} fill={color('purple')} />
          </View>
          <View style={styles.titleContainerCenter}>
            <Text style={styles.welcomeTitle}>Welcome to Gradient</Text>
          </View>
          <View style={styles.titleContainerCenter}>
            <Text style={styles.welcomeSubtitle}>
              Get started to define your goals and achieve visibility into your
              personal growth
            </Text>
          </View>
          <View style={styles.inputGroup}>
            <TouchableOpacity style={styles.ctaButton} onPress={onNext}>
              <Text style={styles.ctaButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Debug />
    </>
  )
}

export default Welcome
