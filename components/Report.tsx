import React from 'react'
import {Text, View, TouchableOpacity} from 'react-native'
import moment from 'moment'
import style from '../lib/style'
import {color, createStyleSheet} from '../lib/util'
import DeleteIcon from '../assets/images/footer-close.svg'
import {Report as ReportType} from '../lib/database'

const styles = createStyleSheet({
  ...style,
  reportContainer: {
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: color('light-gray'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reportActions: {
    flexDirection: 'row',
  },
})

type ReportProps = {
  report: ReportType
  onReportDelete: (report: ReportType) => void
  noTopBorder?: boolean
}

const Report = ({report, onReportDelete, noTopBorder}: ReportProps) => (
  <View
    style={{
      ...styles.reportContainer,
      borderTopWidth: noTopBorder ? 0 : 1,
    }}>
    <Text style={styles.text}>
      {report.value} on {moment(report.date).format('MM/DD')}
    </Text>
    <View style={styles.reportActions}>
      <TouchableOpacity
        style={styles.reportDeleteAction}
        onPress={() => onReportDelete(report)}>
        <DeleteIcon width={18} height={18} fill={color('gray')} />
      </TouchableOpacity>
    </View>
  </View>
)

export default Report
