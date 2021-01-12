import React, {useCallback, useState} from 'react'
import {
  FlatList,
  Keyboard,
  ListRenderItemInfo,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import {useSafeArea} from 'react-native-safe-area-context'
import analytics from '@segment/analytics-react-native'
import {RouteProp, useFocusEffect} from '@react-navigation/native'
import {StackNavigationProp} from '@react-navigation/stack'
import style from '../lib/style'
import MetricModal from '../components/MetricModal'
import {db, Goal, Metric} from '../lib/database'
import ColorButton from '../components/ColorButton'
import {
  color as colorFunc,
  createStyleSheet,
  getOrCreateUser,
  isEmpty,
  newList,
} from '../lib/util'
import BackButton from '../components/BackButton'
import MetricItem from '../components/Metric'
import {showDefaultError} from '../lib/error'
import InstructionsButton from '../components/InstructionsButton'
import AddMetricsInstructions from '../components/AddMetricsInstructions'
import {MetricDetails, NavigationStackParamList} from '../types'

const styles = createStyleSheet({
  ...style,
  nameInputGroup: {
    ...style.inputGroup,
    paddingHorizontal: 10,
    marginTop: 10,
  },
})

type AddMetricsProps = {
  navigation: StackNavigationProp<NavigationStackParamList, 'AddMetrics'>
  route: RouteProp<NavigationStackParamList, 'AddMetrics'>
}

const AddMetrics = ({navigation, route}: AddMetricsProps) => {
  const {goalName, isOnboarding, doneScreen} = route.params ?? {}
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [name, setName] = useState('')
  const [color, setColor] = useState('purple')
  const [editingMetric, setEditingMetric] = useState<Metric | null>(null)
  const [editingMetricIndex, setEditingMetricIndex] = useState<number | null>(
    null,
  )
  const [showingInstructions, toggleShowingInstructions] = useState(
    !!isOnboarding,
  )

  const addMetric = () => {
    const metric = new Metric()
    setMetrics([...metrics, metric])
    return metric
  }

  const onMetricAdd = () => {
    setEditingMetric(addMetric())
    setEditingMetricIndex(metrics.length - 1)
  }

  useFocusEffect(
    useCallback(() => {
      setMetrics(newList())
      setName(goalName)
      if (!showingInstructions) {
        const metric = new Metric()
        setMetrics([...metrics, metric])
        setEditingMetric(metric)
        setEditingMetricIndex(metrics.length - 1)
      }
    }, [goalName]),
  )

  const clearEditingMetric = () => {
    setEditingMetric(null)
    setEditingMetricIndex(null)
  }

  const onMetricSave = (metricDetails: MetricDetails) => {
    if (editingMetric === null || editingMetricIndex === null) {
      return
    }

    analytics.track('Metric Saved', {
      name: metricDetails.name,
      isSnapshot: metricDetails.isSnapshot,
      isDecreasing: metricDetails.isDecreasing,
      weight: metricDetails.weight,
      goalName: name,
      goalColor: color,
      goalMetrics: metrics.length,
    })

    editingMetric.name = metricDetails.name
    editingMetric.isSnapshot = metricDetails.isSnapshot
    editingMetric.isDecreasing = metricDetails.isDecreasing
    editingMetric.weight = metricDetails.weight

    clearEditingMetric()
  }

  const onMetricDelete = () => {
    if (editingMetric === null || editingMetricIndex === null) {
      return
    }

    analytics.track('Metric Deleted', {
      name: editingMetric.name,
      isSnapshot: editingMetric.isSnapshot,
      isDecreasing: editingMetric.isDecreasing,
      weight: editingMetric.weight,
    })

    metrics.splice(editingMetricIndex, 1)

    clearEditingMetric()
  }

  const onMetricHide = () => {
    Keyboard.dismiss()

    if (editingMetric === null || editingMetricIndex === null) {
      return
    }

    if (isEmpty(editingMetric.name)) {
      metrics.splice(editingMetricIndex, 1)
    }

    clearEditingMetric()
  }

  const onMetricEdit = (metric: Metric, index: number) => {
    setEditingMetric(metric)
    setEditingMetricIndex(index)
  }

  const onDone = () => {
    Keyboard.dismiss()

    try {
      db()?.write(() => {
        const user = getOrCreateUser()

        if (!user) {
          throw new Error('User could not be retrieved')
        }

        const lastOrder = user.goals.max('order') as number | null | undefined
        const nextGoal = new Goal(
          name,
          lastOrder !== null && lastOrder !== undefined ? lastOrder + 1 : 0,
          color,
          metrics,
        )

        user.goals.push(nextGoal)
      })

      analytics.track('Goal Created', {
        name,
        color,
        metrics: metrics.length,
      })
    } catch (e) {
      showDefaultError(e, true)
    }

    setMetrics([])
    setEditingMetric(null)
    // TODO change any to the correct type
    navigation.navigate(doneScreen || ('Root' as any))
  }

  const renderMetric = ({item: metric, index}: ListRenderItemInfo<Metric>) => (
    <MetricItem metric={metric} onPress={() => onMetricEdit(metric, index)} />
  )

  const headerComponent = (
    <>
      <View style={styles.headerContainer}>
        <BackButton />
        <InstructionsButton
          onPress={() => {
            analytics.track('Metrics Instructions Opened')

            toggleShowingInstructions(true)
          }}
        />
      </View>
      <View style={styles.nameInputGroup}>
        <Text style={styles.inputLabel}>Goal Name</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={{
              ...styles.textInput,
              flexGrow: 1,
            }}
            onChangeText={setName}
            value={name}
            returnKeyType="next"
          />
          <ColorButton color={color} onChange={setColor} />
        </View>
      </View>
      <View
        style={{
          paddingTop: 15,
          paddingBottom: 5,
          paddingHorizontal: 10,
        }}>
        <Text style={styles.inputLabel}>Metrics</Text>
      </View>
    </>
  )

  const footerComponent = (
    <>
      <View style={styles.inputGroup}>
        <TouchableOpacity
          style={styles.ctaButtonSecondary}
          onPress={onMetricAdd}>
          <Text
            style={{
              ...styles.ctaButtonSecondaryText,
              color: colorFunc(color),
            }}>
            + Add Metric
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputGroup}>
        <TouchableOpacity
          style={{
            ...styles.ctaButtonShort,
            backgroundColor: isEmpty(name)
              ? colorFunc(color, 0.7)
              : colorFunc(color),
          }}
          disabled={isEmpty(name)}
          onPress={onDone}>
          <Text style={styles.ctaButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </>
  )

  return (
    <>
      <View
        style={{
          ...styles.safeAreaView,
          paddingTop: useSafeArea().top || 10,
        }}>
        <FlatList
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          data={metrics}
          renderItem={renderMetric}
          ListHeaderComponent={headerComponent}
          ListFooterComponent={footerComponent}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
      <MetricModal
        goalColor={color}
        metric={editingMetric}
        onSave={onMetricSave}
        onDelete={onMetricDelete}
        onHide={onMetricHide}
      />
      <AddMetricsInstructions
        isVisible={showingInstructions}
        onClose={() => toggleShowingInstructions(false)}
        onComplete={() => {
          if (metrics.length === 0) {
            onMetricAdd()
          }
        }}
      />
    </>
  )
}

export default AddMetrics
