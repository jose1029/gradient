import React from 'react'
import {render, fireEvent} from 'react-native-testing-library'

import App from '../App'

describe('App', () => {
  describe('Navigation', () => {
    it('renders the Loading screen', async () => {
      const component = <App />

      const {findByText} = render(component)

      const loadingText = await findByText('Loading')

      expect(loadingText).toBeTruthy()
    })
  })
})
