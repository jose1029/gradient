import React from 'react'
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import Dashboard from './Dashboard'
import Analytics from './Analytics'
import DashboardIcon from '../assets/images/footer-goals.svg'
import AnalyticsIcon from '../assets/images/footer-analytics.svg'
import {color} from '../lib/util'

const Tab = createBottomTabNavigator()

type TabBarIconProps = {
  focused: boolean
  size: number
}

const Root = () => (
  <Tab.Navigator
    initialRouteName="Dashboard"
    screenOptions={({route}) => ({
      tabBarIcon: ({focused, size}: TabBarIconProps) => {
        switch (route.name) {
          case 'Dashboard':
            return (
              <DashboardIcon
                width={size}
                height={size}
                fill={color(focused ? 'purple' : 'gray')}
              />
            )
          case 'Analytics':
            return (
              <AnalyticsIcon
                width={size}
                height={size}
                fill={color(focused ? 'purple' : 'gray')}
              />
            )
          default:
            return null
        }
      },
    })}
    tabBarOptions={{
      showLabel: false,
    }}>
    <Tab.Screen name="Dashboard" component={Dashboard} />
    <Tab.Screen name="Analytics" component={Analytics} />
  </Tab.Navigator>
)

export default Root
