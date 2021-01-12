import * as ReactNative from 'react-native'

export const Animated = {
  add: jest.fn(),
  multiply: jest.fn(),
  createAnimatedComponent: jest.fn(),
}

export const Dimensions = {
  get: jest.fn(() => ({})),
}

export const Easing = {
  out: jest.fn(),
  in: jest.fn(),
  bezier: jest.fn(),
  poly: jest.fn(),
}

export const I18nManager = {
  isRTL: false,
}

export const Image = {}

export const NativeModules = {
  UIManager: {},
  ReactNativeExceptionHandler: {
    setHandlerforNativeException: jest.fn(),
  },
}

export const PanResponder = {
  create: jest.fn(() => ({
    panHandlers: {},
  })),
}

export const Platform = {
  ...ReactNative.Platform,
  OS: 'ios',
  Version: 123,
  isTesting: true,
  select: (objs) => objs.ios,
}

export const SectionList = {}

export const StatusBar = {}

export const StyleSheet = {
  create: jest.fn((o) => o),
  flatten: jest.fn(),
}

export const Text = {}

export const Touchable = {
  Mixin: {},
}

export const UIManager = {
  getViewManagerConfig: jest.fn(),
}

export const View = {
  propTypes: {},
}

export const ViewPropTypes = {}

export const YellowBox = {
  ignoreWarnings: jest.fn(),
}

export const requireNativeComponent = jest.fn(() => ({}))

export default Object.setPrototypeOf(
  {
    Animated,
    Dimensions,
    Easing,
    I18nManager,
    Image,
    NativeModules,
    PanResponder,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    Touchable,
    UIManager,
    View,
    ViewPropTypes,
    YellowBox,
    requireNativeComponent,
  },
  ReactNative,
)
