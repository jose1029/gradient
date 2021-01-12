import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import analytics from '@segment/analytics-react-native'
import React, {useEffect, useState} from 'react'
import {SafeAreaProvider} from 'react-native-safe-area-context'
import {
  setJSExceptionHandler,
  setNativeExceptionHandler,
} from 'react-native-exception-handler'
import {Collection, CollectionChangeSet} from 'realm'
import UserContext from './contexts/UserContext'
import {init as initAnalytics} from './lib/analytics'
import {app, authenticate, connect, isAuthenticated, User} from './lib/database'
import {showDefaultError} from './lib/error'
import {getUserCollection} from './lib/util'
import AddGoal from './screens/AddGoal'
import AddMetrics from './screens/AddMetrics'
import Loading from './screens/Loading'
import Root from './screens/Root'
import Welcome from './screens/Welcome'
import EditGoal from './screens/EditGoal'
import Reports from './screens/Reports'
import ReorderGoals from './screens/ReorderGoals'
import {NavigationStackParamList} from './types'

setJSExceptionHandler((e, isFatal) => {
  if (e === undefined || (e.name === undefined && e.message === undefined)) {
    analytics.track('JS Exception Handled', {
      isFatal,
      name: 'undefined',
      message: (e as unknown) as string,
    })
    showDefaultError(`${isFatal ? 'Fatal:' : ''} ${e}`, true)
  } else {
    analytics.track('JS Exception Handled', {
      isFatal,
      name: e.name,
      message: e.message,
    })
    showDefaultError(`${isFatal ? 'Fatal:' : ''} ${e.name} ${e.message}`, true)
  }
}, true)

setNativeExceptionHandler((e) => {
  analytics.track('Native Exception Handled', {
    message: e,
  })

  showDefaultError(e, true)
})

const Stack = createStackNavigator<NavigationStackParamList>()

const App = () => {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [userChange, setUserChange] = useState<CollectionChangeSet | undefined>(
    undefined,
  )

  const [isLoading, toggleLoading] = useState(true)
  const [isOnboarding, toggleOnboarding] = useState(true)

  const routeNameRef = React.useRef<string | null | undefined>(null)
  const navigationRef = React.useRef<NavigationContainerRef | null | undefined>(
    null,
  )

  const userListener = (
    nextUsers: Collection<User>,
    change: CollectionChangeSet,
  ) => {
    setUser(nextUsers?.length ? nextUsers[0] : null)
    setUserChange(change)
  }

  useEffect(() => {
    initAnalytics()

    let userCollection: Realm.Results<User & Realm.Object> | undefined

    const initUserCollection = () => {
      userCollection = getUserCollection()
      userCollection?.addListener(userListener)
    }

    if (!isAuthenticated()) {
      authenticate()
        .then(connect)
        .then(initUserCollection)
        .catch(showDefaultError)
    } else {
      connect().then(initUserCollection).catch(showDefaultError)
    }

    return () => {
      userCollection?.removeListener(userListener)
    }
  }, [app.currentUser])

  useEffect(() => {
    if (user) {
      analytics.identify(user.id, {
        ownerId: app.currentUser?.id,
        createdAt: user.createdAt.toISOString(),
        isDebug: user.isDebug,
      })
    }
    toggleLoading(user === undefined)
    toggleOnboarding(user === null)
  }, [user, userChange])

  return (
    <UserContext.Provider value={user}>
      <SafeAreaProvider>
        <NavigationContainer
          ref={
            navigationRef as React.MutableRefObject<NavigationContainerRef | null>
          }
          onReady={() => {
            routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name

            if (routeNameRef.current) {
              analytics.screen(routeNameRef.current)
            }
          }}
          onStateChange={() => {
            const previousRouteName = routeNameRef.current
            const currentRouteName = navigationRef.current?.getCurrentRoute()
              ?.name

            if (previousRouteName !== currentRouteName && currentRouteName) {
              analytics.screen(currentRouteName)
            }

            routeNameRef.current = currentRouteName
          }}>
          <Stack.Navigator
            headerMode="none"
            initialRouteName={(() => {
              if (isLoading) {
                return 'Loading'
              }
              if (isOnboarding) {
                return 'Welcome'
              }
              return 'Root'
            })()}>
            {isLoading ? (
              <Stack.Screen name="Loading" component={Loading} />
            ) : (
              <>
                {isOnboarding && (
                  <Stack.Screen name="Welcome" component={Welcome} />
                )}
                <Stack.Screen name="Root" component={Root} />
                <Stack.Screen name="AddGoal" component={AddGoal} />
                <Stack.Screen name="AddMetrics" component={AddMetrics} />
                <Stack.Screen name="EditGoal" component={EditGoal} />
                <Stack.Screen name="ReorderGoals" component={ReorderGoals} />
                <Stack.Screen name="Reports" component={Reports} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </UserContext.Provider>
  )
}

export default App
