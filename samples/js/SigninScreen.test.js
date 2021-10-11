import React from 'react'
import SigninScreen from './SigninScreen'
import { renderWithApollo } from '#/utils'
import { act, fireEvent } from '@testing-library/react-native'
import { emailPresent, emailNotPresent, phonePresent } from './mocks'
import { range } from 'lodash-es'

jest.mock('../../App/root-store/index', () => {
  const useStore = () => {
    return { person: [{ church_data: { country: 'NZ', logo_url: null } }] }
  }
  return { useStore }
})

const mockstandin = jest.fn()

jest.mock('../../services/LoginService', () => {
  return {
    __esModule: true,
    default: jest.fn(() => 42),
    getLoginDetails: (a, b, c, d) => mockstandin()
  }
})

test('renders', async () => {
  const { getByText } = renderWithApollo(<SigninScreen />)
  getByText('Send signin email')
})

test('submits email login request', async () => {
  const { getByText, queryByA11yLabel, getByA11yLabel, getByTestId } = renderWithApollo(
    <SigninScreen />,
    emailPresent
  )
  const fld = getByA11yLabel('Your Email')
  fireEvent.changeText(fld, 'test@email.com')
  fireEvent(fld, 'onBlur')
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(queryByA11yLabel('Passcode')).toBeNull()

  const btn = getByA11yLabel('Send signin email')
  await act(async () => {
    fireEvent.press(btn)
    await new Promise(resolve => setTimeout(resolve, 0))
    getByText('Login code sent to your email!')
    getByA11yLabel('Passcode')
  })

  range(1, 7).map(n => {
    const f = getByTestId(`pass-${n}`)
  })
  const codeFld = getByA11yLabel('Passcode')
  fireEvent.changeText(codeFld, '100000')
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(mockstandin).toHaveBeenCalled()
})

test('submits email login request, when  user is not found', async () => {
  const { getByText, queryByA11yLabel, getByA11yLabel } = renderWithApollo(
    <SigninScreen />,
    emailNotPresent
  )
  const fld = getByA11yLabel('Your Email')
  fireEvent.changeText(fld, 'test@email.com')
  fireEvent(fld, 'onBlur')
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(queryByA11yLabel('Passcode')).toBeNull()

  const btn = getByA11yLabel('Send signin email')
  await act(async () => {
    fireEvent.press(btn)
    await new Promise(resolve => setTimeout(resolve, 0))
    getByText("Sorry, Couldn't find you. Please check your login credentials and try again.")
  })
})

test('submits phone login request', async () => {
  const { getByA11yLabel, getByTestId } = renderWithApollo(<SigninScreen />, phonePresent)

  const mobileButton = getByA11yLabel('Mobile')
  fireEvent.press(mobileButton)

  const fld = getByA11yLabel('Mobile Number')
  expect(fld).toBeTruthy()
  fireEvent.changeText(fld, '0276236003')
  fireEvent(fld, 'onBlur')
  await new Promise(resolve => setTimeout(resolve, 0))

  const btn = getByA11yLabel('Send passcode')
  await act(async () => {
    fireEvent.press(btn)
    await new Promise(resolve => setTimeout(resolve, 0))
    getByA11yLabel('Passcode')
  })

  range(1, 7).map(n => {
    const f = getByTestId(`pass-${n}`)
  })
  const codeFld = getByA11yLabel('Passcode')
  fireEvent.changeText(codeFld, '100000')
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(mockstandin).toHaveBeenCalled()
})

test('no verification link works', async () => {
  const { getByText, queryByA11yLabel, getByA11yLabel, getByTestId } = renderWithApollo(
    <SigninScreen />,
    emailPresent
  )
  const fld = getByA11yLabel('Your Email')
  fireEvent.changeText(fld, 'test@email.com')
  fireEvent(fld, 'onBlur')
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(queryByA11yLabel('Passcode')).toBeNull()

  const btn = getByA11yLabel('Send signin email')
  await act(async () => {
    fireEvent.press(btn)
    await new Promise(resolve => setTimeout(resolve, 0))
    getByText('Login code sent to your email!')
    getByA11yLabel('Passcode')
  })

  range(1, 7).map(n => {
    const f = getByTestId(`pass-${n}`)
  })

  const verifButton = getByA11yLabel('Resend verification email')
  fireEvent.press(verifButton)
  expect(queryByA11yLabel('Passcode')).toBeNull()
  expect(queryByA11yLabel('Resend verification email')).toBeNull()
})

test('presses send signin email without email', async () => {
  const { getByA11yLabel, getByText } = renderWithApollo(<SigninScreen />, emailPresent)
  const btn = getByA11yLabel('Send signin email')

  await act(async () => {
    fireEvent.press(btn)
    await new Promise(resolve => setTimeout(resolve, 0))
    getByText("looks like it's blank")
  })
})

test('ensures email is lowercase', async () => {
  const { queryByA11yLabel, getByA11yLabel} = renderWithApollo(
    <SigninScreen />,
    emailPresent
  )
  const fld = getByA11yLabel('Your Email')
  fireEvent.changeText(fld, 'TEST@EMAIL.com')
  fireEvent(fld, 'onBlur')
  await new Promise(resolve => setTimeout(resolve, 0))
  expect(queryByA11yLabel('Passcode')).toBeNull()
  const btn = getByA11yLabel('Send signin email')
  await act(async () => {
    fireEvent.press(btn)
    await new Promise(resolve => setTimeout(resolve, 0))
    getByA11yLabel('Passcode')
  })
})
