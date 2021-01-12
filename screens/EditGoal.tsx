import React, {useState} from 'react'
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  ListRenderItemInfo,
  Alert,
} from 'react-native'
import {useSafeArea} from 'react-native-safe-area-context'
import analytics from '@segment/analytics-react-native'
import {RouteProp} from '@react-navigation/native'
import {StackNavigationProp} from '@react-navigation/stack'
import BackButton from '../components/BackButton'
import MetricModal from '../components/MetricModal'
import style from '../lib/style'
import {db, Metric, Report} from '../lib/database'
import {color as colorFunc, createStyleSheet, isEmpty} from '../lib/util'
import ColorButton from '../components/ColorButton'
import Spacer from '../components/Spacer'
import MetricItem from '../components/Metric'
import {showDefaultError} from '../lib/error'
import {MetricDetails, NavigationStackParamList} from '../types'

const styles = createStyleSheet({
  ...style,
  nameInputGroup: {
    ...style.inputGroup,
    paddingHorizontal: 10,
    marginTop: 10,
  },
})

type EditGoalProps = {
  navigation: StackNavigationProp<NavigationStackParamList, 'EditGoal'>
  route: RouteProp<NavigationStackParamList, 'EditGoal'>
}

const EditGoal = ({navigation, route}: EditGoalProps) => {
  const {goal} = route.params ?? {}
  const [name, onNameChange] = useState(goal.name)
  const [color, onColorChange] = useState(goal.color)
  const [editingMetric, setEditingMetric] = useState<Metric | null>(null)

  const addMetric = () => {
    let metric: Realm.Object | null = null

    try {
      db()?.write(() => {
        metric = db()?.create(Metric.schema.name, new Metric()) ?? null
        if (!metric) {
          throw new Error('Metric could not be created')
        }
        goal.metrics.push(metric)
      })
    } catch (e) {
      showDefaultError(e, true)
    }

    return metric
  }

  const onUpdate = () => {
    analytics.track('Goal Updated', {
      name: goal.name,
      color: goal.color,
      metrics: goal.metrics.length,
    })

    try {
      db()?.write(() => {
        goal.name = name
        goal.color = color
      })
    } catch (e) {
      showDefaultError(e, true)
    }

    if (navigation.canGoBack()) {
      navigation.goBack()
    } else {
      navigation.navigate('Root')
    }
  }

  const onDelete = () => {
    analytics.track('Goal Deleted', {
      name: goal.name,
      color: goal.color,
      metrics: goal.metrics.length,
    })

    try {
      db()?.write(() => {
        db()?.delete(goal)
      })
    } catch (e) {
      showDefaultError(e, true)
    }

    if (navigation.canGoBack()) {
      navigation.goBack()
    } else {
      navigation.navigate('Root')
    }
  }

  const interpretIncrementalChanges = () => {
    if (editingMetric === null || editingMetric.reports.length === 0) {
      return
    }

    const reversedReports = editingMetric.reports.sorted('date', true)

    db()?.write(() => {
      let lastReport: Report | null = null

      reversedReports.forEach((report) => {
        if (lastReport !== null) {
          lastReport.value -= report.value
        }
        lastReport = report
      })

      db()?.delete(lastReport)
    })
  }

  const writeMetric = (metricDetails: MetricDetails) => {
    if (editingMetric === null) {
      return
    }

    try {
      db()?.write(() => {
        editingMetric.name = metricDetails.name
        editingMetric.isSnapshot = metricDetails.isSnapshot
        editingMetric.isDecreasing = metricDetails.isDecreasing
        editingMetric.weight = metricDetails.weight
      })
    } catch (e) {
      showDefaultError(e, true)
    }

    setEditingMetric(null)
  }

  const onMetricSave = (metricDetails: MetricDetails) => {
    if (editingMetric === null) {
      return
    }

    analytics.track('Metric Saved', {
      name: metricDetails.name,
      isSnapshot: metricDetails.isSnapshot,
      isDecreasing: metricDetails.isDecreasing,
      weight: metricDetails.weight,
      goalName: goal.name,
      goalColor: goal.color,
      goalMetrics: goal.metrics.length,
    })

    if (
      editingMetric.isSnapshot &&
      !metricDetails.isSnapshot &&
      editingMetric.reports.length > 0
    ) {
      Alert.alert(
        'Interpret Incremental Changes',
        'Would you like Gradient to interpret incremental changes from previous snapshot values? This cannot be undone!',
        [
          {
            text: 'No',
            onPress: () => writeMetric(metricDetails),
          },
          {
            text: 'Yes',
            onPress: () => {
              interpretIncrementalChanges()
              writeMetric(metricDetails)
            },
          },
        ],
        {cancelable: false},
      )
    } else {
      writeMetric(metricDetails)
    }
  }

  const onMetricDelete = () => {
    if (editingMetric === null) {
      return
    }

    analytics.track('Metric Deleted', {
      name: editingMetric.name,
      isSnapshot: editingMetric.isSnapshot,
      isDecreasing: editingMetric.isDecreasing,
      weight: editingMetric.weight,
    })

    try {
      db()?.write(() => {
        db()?.delete(editingMetric)
      })
    } catch (e) {
      showDefaultError(e, true)
    }

    setEditingMetric(null)
  }

  const onMetricHide = () => {
    Keyboard.dismiss()

    if (editingMetric === null) {
      return
    }

    if (isEmpty(editingMetric.name)) {
      try {
        db()?.write(() => {
          db()?.delete(editingMetric)
        })
      } catch (e) {
        showDefaultError(e, true)
      }
    }

    setEditingMetric(null)
  }

  const onMetricAdd = () => {
    setEditingMetric(addMetric)
  }

  const onMetricEdit = (metric: Metric) => {
    setEditingMetric(metric)
  }

  const renderMetric = ({item: metric}: ListRenderItemInfo<Metric>) => (
    <MetricItem metric={metric} onPress={() => onMetricEdit(metric)} />
  )

  const headerComponent = (
    <>
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.headerText}>Edit Goal</Text>
        <Spacer />
      </View>
      <View style={styles.nameInputGroup}>
        <Text style={styles.inputLabel}>Goal Name</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={{
              ...styles.textInput,
              flexGrow: 1,
            }}
            onChangeText={onNameChange}
            value={name}
            returnKeyType="next"
          />
          <ColorButton color={color} onChange={onColorChange} />
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
        <View style={styles.inputRowCenter}>
          <TouchableOpacity
            style={{
              ...styles.ctaButtonShort,
              backgroundColor: colorFunc('white'),
              borderColor: colorFunc(color),
              borderWidth: 1,
            }}
            onPress={onDelete}>
            <Text
              style={{
                ...styles.ctaButtonText,
                color: colorFunc(color),
              }}>
              Delete
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              ...styles.ctaButtonShort,
              backgroundColor: isEmpty(name)
                ? colorFunc(color, 0.7)
                : colorFunc(color),
            }}
            disabled={isEmpty(name)}
            onPress={onUpdate}>
            <Text style={styles.ctaButtonText}>Update</Text>
          </TouchableOpacity>
        </View>
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
          data={goal.metrics}
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
    </>
  )
}

export default EditGoal
