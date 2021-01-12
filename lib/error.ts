import Toast from 'react-native-simple-toast'

const defaultMessage = 'Something went wrong!'

export const logError = (message?: string) => {
  console.log(message || defaultMessage)
}

export const showDefaultError = (
  errorMessage?: string,
  shouldLogError: boolean = false,
) => {
  Toast.showWithGravity(defaultMessage, Toast.SHORT, Toast.TOP)
  if (shouldLogError) {
    logError(errorMessage)
  }
}

export const showError = (
  errorMessage?: string,
  shouldLogError: boolean = false,
) => {
  Toast.showWithGravity(errorMessage || defaultMessage, Toast.SHORT, Toast.TOP)
  if (shouldLogError) {
    logError(errorMessage)
  }
}
