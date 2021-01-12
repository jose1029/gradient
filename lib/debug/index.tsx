import React, {useContext, useState} from 'react'
import {
  Alert,
  Button,
  Dimensions,
  LogBox,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Modal from 'react-native-modal'
import {useSafeArea} from 'react-native-safe-area-context'
import UserContext from '../../contexts/UserContext'
import {app, db, Goal, Metric, Report, User} from '../database'
import {color, createStyleSheet, newList} from '../util'
import {showDefaultError} from '../error'
import style from '../style'
import sampleGoals from './data'

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
])

const styles = createStyleSheet(style)

const Debug = () => {
  const user = useContext(UserContext)
  const [isVisible, toggleVisible] = useState(false)
  const [numTaps, setNumTaps] = useState(0)

  const insets = useSafeArea()

  const divider = () => (
    <View
      style={{
        borderBottomColor: color('gray'),
        borderBottomWidth: 1,
        marginVertical: 15,
      }}
    />
  )

  return (
    <>
      <View
        style={{
          position: 'absolute',
          top: insets.top,
          left: 0,
        }}>
        <TouchableOpacity
          activeOpacity={user?.isDebug ? 0.7 : 0}
          onPress={() => {
            if (user?.isDebug) {
              toggleVisible(true)
              setNumTaps(0)
            } else {
              setNumTaps(numTaps + 1)
              if (numTaps >= (__DEV__ ? 2 : 10)) {
                toggleVisible(true)
                setNumTaps(0)
              }
            }
          }}>
          <Text
            style={{color: user?.isDebug ? color('red') : 'rgba(0, 0, 0, 0)'}}>
            Debug
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        isVisible={isVisible}
        style={styles.modalViewContainer}
        hideModalContentWhileAnimating>
        <View
          style={{
            ...styles.modalViewFull,
            maxHeight: Dimensions.get('window').height - insets.top - 100,
          }}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={{
              ...styles.scrollViewContainer,
              paddingVertical: 20,
            }}
            keyboardShouldPersistTaps="handled">
            <Text
              style={{
                ...styles.textSemibold,
                textAlign: 'center',
                marginBottom: 10,
              }}>
              RUNNING IN{' '}
              <Text style={{fontWeight: '800'}}>
                {__DEV__ ? 'DEBUG' : 'RELEASE'}
              </Text>{' '}
              MODE
            </Text>

            <Button
              title={user ? `user.isDebug = ${user.isDebug}` : 'No user'}
              color={(() => {
                if (user) {
                  if (user.isDebug) {
                    return color('red')
                  }
                  return color('green')
                }
                return color('gray')
              })()}
              onPress={() => {
                if (!user) {
                  return
                }

                try {
                  db()?.write(() => {
                    user.isDebug = !user.isDebug
                  })
                } catch (e) {
                  showDefaultError(e, true)
                }
              }}
            />

            {divider()}

            <Text
              style={{
                ...styles.textBold,
                textAlign: 'center',
                marginBottom: 10,
                fontSize: 16,
              }}>
              USERS
            </Text>

            {db()
              ?.objects('User')
              .map((obj) => {
                const u = (obj as unknown) as User
                return (
                  <Button
                    key={u.id}
                    title={u.id}
                    color={(() => {
                      if (u.id === user?.id) {
                        return color('blue')
                      }
                      if (u.isDebug) {
                        return 'rgba(86, 16, 16, 1)'
                      }
                      return 'rgba(23, 79, 69, 1)'
                    })()}
                    onPress={() => {
                      if (u.id === user?.id) {
                        return
                      }

                      db()?.write(() => {
                        if (user) {
                          user.isActive = false
                        }
                        u.isActive = true
                      })
                    }}
                  />
                )
              })}

            {divider()}

            <Button
              title="Create User"
              color={color('purple')}
              onPress={() => {
                try {
                  db()?.write(() => {
                    if (user) {
                      user.isActive = false
                    }
                    db()?.create(User.schema.name, new User([], true, true))
                  })
                } catch (e) {
                  showDefaultError(e, true)
                }
              }}
            />

            <Button
              title="Populate Sample Data"
              color={color('purple')}
              onPress={() => {
                if (!user) {
                  return
                }

                try {
                  db()?.write(() => {
                    sampleGoals.forEach((g) => {
                      const metrics: Metric[] = []

                      g.metrics.forEach((m) => {
                        const reports: Report[] = []

                        m.reports.forEach((r) => {
                          const report = new Report(r.date, r.value)
                          report.createdAt = r.createdAt
                          reports.push(report)
                        })

                        const metric = new Metric(
                          m.name,
                          m.isSnapshot,
                          m.isDecreasing,
                          m.weight,
                          reports,
                        )
                        metric.createdAt = m.createdAt
                        metrics.push(metric)
                      })

                      const goal = new Goal(g.name, g.order, g.color, metrics)
                      goal.createdAt = g.createdAt
                      user.goals.push(goal)
                    })
                  })
                } catch (e) {
                  showDefaultError(e, true)
                }
              }}
            />

            <Button
              title="Deactivate Current User"
              color={color('purple')}
              onPress={() => {
                if (!user) {
                  return
                }

                try {
                  db()?.write(() => {
                    user.isActive = false
                  })
                } catch (e) {
                  showDefaultError(e, true)
                }
              }}
            />

            {divider()}

            <Button
              title="Reset User Goals"
              color={color('red')}
              onPress={() => {
                if (!user) {
                  return
                }

                Alert.alert(
                  'Danger!',
                  "Are you sure you want to reset the current user's goals?",
                  [
                    {
                      text: 'No, take me back!',
                      style: 'cancel',
                    },
                    {
                      text: "Yes, I'm sure!",
                      onPress: () => {
                        try {
                          db()?.write(() => {
                            user.goals = newList()
                          })
                        } catch (e) {
                          showDefaultError(e, true)
                        }
                      },
                    },
                  ],
                  {cancelable: false},
                )
              }}
            />

            <Button
              title="Delete Current User"
              color={color('red')}
              onPress={() => {
                if (!user) {
                  return
                }

                Alert.alert(
                  'Danger!',
                  'Are you sure you want to delete the current user?',
                  [
                    {
                      text: 'No, take me back!',
                      style: 'cancel',
                    },
                    {
                      text: "Yes, I'm sure!",
                      onPress: () => {
                        try {
                          db()?.write(() => {
                            db()?.delete(user)
                          })
                        } catch (e) {
                          showDefaultError(e, true)
                        }
                      },
                    },
                  ],
                  {cancelable: false},
                )
              }}
            />

            <Button
              title="Full Database Reset"
              color={color('red')}
              onPress={() => {
                Alert.alert(
                  'Danger!',
                  'Are you sure you want to reset the database?',
                  [
                    {
                      text: 'No, take me back!',
                      style: 'cancel',
                    },
                    {
                      text: "Yes, I'm sure!",
                      onPress: () => {
                        try {
                          try {
                            db()?.write(() => {
                              db()?.deleteAll()
                            })
                          } catch (e) {
                            showDefaultError(e, true)
                          }
                        } catch (e) {
                          showDefaultError(e, true)
                        }
                      },
                    },
                  ],
                  {cancelable: false},
                )
              }}
            />

            <Button
              title="Remove App User"
              color={color('red')}
              onPress={() => {
                if (!app.currentUser) {
                  return
                }

                Alert.alert(
                  'Danger!',
                  'Are you sure you want to remove the current app user?',
                  [
                    {
                      text: 'No, take me back!',
                      style: 'cancel',
                    },
                    {
                      text: "Yes, I'm sure!",
                      onPress: () => {
                        app.removeUser(app.currentUser!)
                      },
                    },
                  ],
                  {cancelable: false},
                )
              }}
            />

            {divider()}

            <Button
              title="Close"
              onPress={() => {
                toggleVisible(false)
              }}
            />
          </ScrollView>
        </View>
      </Modal>
    </>
  )
}

export default Debug
