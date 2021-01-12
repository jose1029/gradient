import React, {useState, useEffect} from 'react'
import {View, Text, TextInput} from 'react-native'
import {color, createStyleSheet} from '../lib/util'
import style from '../lib/style'

const styles = createStyleSheet({
  ...style,
  nameLabel: {
    ...style.inputLabel,
    fontWeight: '600',
    fontSize: 28,
    marginBottom: 15,
  },
  nameInput: {
    ...style.textInput,
    fontSize: 22,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
})

const suggestions = [
  'Lose weight',
  'Exercise more',
  'Run a marathon',
  'Learn French',
  'Learn Spanish',
  'Learn to play guitar',
  'Learn to play piano',
  'Learn to cook',
  'Write a book',
  'Write a screenplay',
  'Read War and Peace',
  'Make better investments',
  'Start a blog',
  'Read more',
  'Get organized',
  'Never stop learning',
]

const r2h = (r: number) => {
  const h = r.toString(16)
  return h.length === 1 ? `0${h}` : h
}

const intervalDuration = 50
const switchTime = 7000
// switchTimerVal is set for convenience but has to be calculated manually for use in timeColor formula derivation
const switchTimerVal = switchTime / intervalDuration // = 140

type GoalNameInputProps = {
  name: string
  onNameChange: (text: string) => void
  onNext: () => void
}

const GoalNameInput = ({name, onNameChange, onNext}: GoalNameInputProps) => {
  const [suggestion, setSuggestion] = useState('')
  const [lastSuggestions, setLastSuggestions] = useState<string[]>([])
  const [suggestionColor, setSuggestionColor] = useState(color('light-gray'))
  const [timer, setTimer] = useState(0)

  useEffect(() => {
    const suggestionInterval = setInterval(() => {
      const timerMod = timer % switchTimerVal

      if (timerMod === 0) {
        const nextIdx = Math.floor(Math.random() * suggestions.length)
        let count = 0
        while (
          lastSuggestions.includes(
            suggestions[(nextIdx + count) % suggestions.length],
          )
        ) {
          count += 1
        }
        const nextSuggestion =
          suggestions[(nextIdx + count) % suggestions.length]
        setSuggestion(nextSuggestion)
        if (lastSuggestions.length > suggestions.length / 2) {
          lastSuggestions.shift()
        }
        setLastSuggestions([...lastSuggestions, nextSuggestion])
      }

      // Based on regression dependent on switchTimerVal
      // http://www.xuru.org/rt/PR.asp
      // Enter:
      // 0 242
      // <switchTimerVal> 242
      // <switchTimerVal / 2> 200
      const timeColor = Math.floor(
        0.008571428571 * timerMod ** 2 - 1.2 * timerMod + 242,
      )

      setSuggestionColor(`#${r2h(timeColor).repeat(3)}`)
      setTimer(timer + 1)
    }, intervalDuration)
    return () => clearInterval(suggestionInterval)
  })

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.nameLabel}>I want to...</Text>
      <TextInput
        style={styles.nameInput}
        onChangeText={onNameChange}
        value={name}
        placeholder={suggestion}
        placeholderTextColor={suggestionColor}
        returnKeyType="done"
        onSubmitEditing={onNext}
        enablesReturnKeyAutomatically
      />
    </View>
  )
}

export default GoalNameInput
