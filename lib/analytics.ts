import analytics from '@segment/analytics-react-native'

const SEGMENT_WRITE_KEY_DEV = 'kQzZm0kG1gNMThZMDdCvRlhwsL7rA5y4'
const SEGMENT_WRITE_KEY_PROD = 'kF7Kmvr5Yc5muiZTDlkSuzhYEzbh1PMd'

export const init = () =>
  analytics.setup(__DEV__ ? SEGMENT_WRITE_KEY_DEV : SEGMENT_WRITE_KEY_PROD, {
    trackAppLifecycleEvents: true,
  })
