import {color} from './util'

const containers = {
  safeAreaView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    alignSelf: 'stretch',
    paddingHorizontal: 20,
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  containerCenter: {
    flexGrow: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  containerSpaced: {
    flexGrow: 1,
    alignSelf: 'stretch',
    justifyContent: 'space-between',
  },
  modalView: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignSelf: 'stretch',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalViewFull: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignSelf: 'stretch',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalViewContainer: {
    flex: 1,
  },
  modalViewContainerBottom: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  headerContainer: {
    marginTop: 10,
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  titleContainer: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  titleContainerCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoContainer: {
    marginLeft: 10,
    paddingVertical: 5,
  },
  logoContainerCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
}

const containersExtensions = {
  scrollViewContainerCenter: {
    ...containers.scrollViewContainer,
    justifyContent: 'center',
  },
  headerContainerPadded: {
    ...containers.headerContainer,
    paddingHorizontal: 20,
  },
  titleContainerPadded: {
    ...containers.titleContainer,
    paddingHorizontal: 20,
  },
}

const text = {
  text: {
    fontFamily: 'SFProDisplay-Regular',
    color: color('black'),
    fontSize: 16,
  },
  textRegular: {
    fontFamily: 'SFProDisplay-Regular',
    color: color('black'),
    fontSize: 16,
  },
  textLight: {
    fontFamily: 'SFProDisplay-Light',
    color: color('black'),
    fontSize: 16,
  },
  textSemibold: {
    fontFamily: 'SFProDisplay-Semibold',
    color: color('black'),
    fontSize: 16,
  },
  textBold: {
    fontFamily: 'SFProDisplay-Bold',
    color: color('black'),
    fontSize: 16,
  },
}

const textExtensions = {
  textMuted: {
    ...text.text,
    color: '#222222',
  },
  title: {
    ...text.textBold,
    flexGrow: 1,
    fontSize: 24,
    alignSelf: 'center',
  },
  titleCenter: {
    ...text.text,
    alignSelf: 'center',
    fontSize: 24,
    margin: 10,
  },
  headerText: {
    ...text.textSemibold,
    flexGrow: 1,
    alignSelf: 'center',
    textAlign: 'center',
  },
  inputLabel: {
    ...text.text,
    fontSize: 16,
    marginBottom: 10,
  },
  description: {
    ...text.text,
    color: color('black', 0.7),
    fontSize: 13,
    marginTop: 2,
  },
  ctaButtonText: {
    ...text.textSemibold,
    alignSelf: 'center',
    color: '#ffffff',
    fontSize: 18,
  },
  ctaButtonSecondaryText: {
    ...text.text,
    fontSize: 18,
    color: color('purple'),
  },
  optionButtonText: {
    ...text.text,
    color: color('black', 0.7),
  },
  optionButtonTextActive: {
    ...text.text,
    color: '#53388B',
  },
}

const buttons = {
  ctaButton: {
    alignSelf: 'stretch',
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: color('purple'),
  },
  ctaButtonSecondary: {},
  cancelButton: {
    backgroundColor: '#eeeeee',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    position: 'absolute',
    left: 10,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    margin: 10,
    borderRadius: 12,
    backgroundColor: '#F2F2F3',
  },
}

const buttonsExtensions = {
  ctaButtonShort: {
    ...buttons.ctaButton,
    marginHorizontal: 10,
    paddingHorizontal: 15,
  },
  optionButtonActive: {
    ...buttons.optionButton,
    backgroundColor: '#FFFFFF',
    shadowColor: '#53388B',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
}

const inputs = {
  inputGroup: {
    padding: 20,
  },
  inputGroupWide: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  inputRow: {
    flexDirection: 'row',
  },
  textInput: {
    ...text.text,
    fontSize: 20,
    backgroundColor: color('light-gray'),
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 12,
  },
}

const inputsExtensions = {
  inputRowGrow: {
    ...inputs.inputRow,
    flexGrow: 1,
  },
  inputRowCenter: {
    ...inputs.inputRow,
    justifyContent: 'center',
  },
  inputRowSpaced: {
    ...inputs.inputRow,
    justifyContent: 'space-between',
  },
}

export default {
  ...containers,
  ...containersExtensions,
  ...text,
  ...textExtensions,
  ...buttons,
  ...buttonsExtensions,
  ...inputs,
  ...inputsExtensions,
}
