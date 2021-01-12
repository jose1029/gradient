import React from 'react'
import {Text, View} from 'react-native'
import style from '../lib/style'
import {color, createStyleSheet} from '../lib/util'

const styles = createStyleSheet({
  ...style,
  insightContentContainer: {
    flexGrow: 1,
    alignSelf: 'flex-start',
  },
  header: {
    ...style.textSemibold,
    fontSize: 16,
    color: color('black'),
  },
  callout: {
    ...style.textBold,
    fontSize: 40,
    marginVertical: 2,
    color: color('purple'),
  },
  description: {
    ...style.text,
    fontSize: 12,
    color: color('black', 0.6),
  },
})

type InsightContentProps = {
  header?: string
  callout?: string
  description?: string
}

const InsightContent = ({
  header,
  callout,
  description,
}: InsightContentProps) => (
  <View style={styles.insightContentContainer}>
    {header && <Text style={styles.header}>{header}</Text>}
    {callout && <Text style={styles.callout}>{callout}</Text>}
    {description && <Text style={styles.description}>{description}</Text>}
  </View>
)

export default InsightContent
