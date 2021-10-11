import { Platform, ScrollView } from 'react-native'
import { View, Text, Button } from 'react-native-ui-lib'
import Header from '~/Components/Home/Header'
import Chooser from '~/Components/Auth/Chooser'
import { Title } from '~/Components/Auth/Title/Title'
import { isIphoneX } from 'react-native-iphone-x-helper'
import { Navigation } from 'react-native-navigation'
import { useApolloClient, useMutation } from '@apollo/react-hooks'
import { LOGIN_REQUEST } from '~/Queries/signin'
import { getLoginDetails } from '~/services/LoginService'

import React, { useState } from 'react'
import EmailAddress from '~/Components/Auth/Email'
import PhoneInput from '~/Components/Auth/PhoneInput'

import { isNil, mergeRight } from 'ramda'
import Config from 'react-native-config'
import { ProcessError } from '~/services/ErrorService'
import styles from '../styles'
import { PassCode } from '~/Components/Auth/PassCode/PassCode'
import { useStore } from '~/App/root-store/index'
import { FlipCard } from '~/Components/Shared/FlipCard/FlipCard'
import { toLower } from 'lodash-es'
import KeyboardSpacer from 'react-native-keyboard-spacer'

// TODO: Refactor Signin Wrapper per platform.
function SigninWrapper (props) {
  if (Platform.OS == 'ios') {
    return (
      <View centerH marginV-5 useSafeArea={isIphoneX()}>
        <ScrollView
          contentContainerStyle={mergeRight(styles.container, {
            justifyContent: 'center',
            paddingBottom: 40
          })}
        >
          {props.children}
        </ScrollView>
      </View>
    )
  } else {
    return (
      <ScrollView
        contentContainerStyle={mergeRight(styles.container, { flex: 0, paddingBottom: 40 })}
      >
        <View centerH useSafeArea={isIphoneX()}>
          {props.children}
        </View>
      </ScrollView>
    )
  }
}

function SigninScreen (props) {
  const { componentId, onError } = props
  const [authMethod, setAuthMethod] = useState('email')
  const [identifier, setIdentifier] = useState(null)
  const [message, setMessage] = useState(null)
  const [authCode, setAuthCode] = useState(null)
  const [visible, setVisible] = useState(false)
  const [emailError, setEmailError] = useState(null)
  const [phoneError, setPhoneError] = useState(null)
  const client = useApolloClient()

  const store = useStore()
  let localPerson = store.person[0]

  const [loginRequest] = useMutation(LOGIN_REQUEST, {
    variables: { identifier: identifier },
    context: { uri: Config.REACT_APP_GRAPHQL_PUBLIC_API },
    onError (errors) {
      out = ProcessError(errors)
      setMessage(out['message'])
    },
    onCompleted (data) {
      if (isNil(data.LoginRequest)) {
        setMessage("Sorry, Couldn't find you. Please check your login credentials and try again.")
        return
      }

      if (authMethod === 'email') {
        setMessage('Login code sent to your email!')
        setAuthCode(data.LoginRequest)
        setVisible(true)
      }

      if (authMethod === 'mobile') {
        setAuthCode(data.LoginRequest)
        setVisible(true)
      }
    }
  })

  const handleChangeEmail = data => {
    setMessage(null)
  }

  const handleAuthChange = data => {
    setAuthMethod(data)
    setMessage(null)
    setIdentifier(null)
  }

  const handleloginRequest = () => {
    if (!identifier) {
      if (authMethod == 'email') {
        setEmailError("looks like it's blank")
      } else {
        setPhoneError("looks like it's blank")
      }
      return
    }
    loginRequest()
  }

  return (
    <SigninWrapper>
      <Header label='Cancel' onPress={() => Navigation.dismissModal(componentId)} />
      <View marginT-20 />
      <Title />
      <View marginT-40 />
      <Chooser onChooserPress={data => handleAuthChange(data)} />
      <View marginT-40 />
      {authMethod == 'email' ? (
        <View marginH-10>
          <EmailAddress
            error={emailError}
            onChangeEmail={data => handleChangeEmail(data)}
            onValidEmail={data => setIdentifier(toLower(data))}
          />
        </View>
      ) : (
        <PhoneInput
          error={phoneError}
          defaultCountry={localPerson?.church_data?.country}
          onChangeNumber={() => {
            setMessage(null)
            setIdentifier(null)
          }}
          onValidPhone={data => setIdentifier(data)}
        />
      )}
      <Text center marginB-10>
        {message}
      </Text>
      <FlipCard
        front={
          <Button
            accessibilityLabel={authMethod == 'email' ? 'Send signin email' : 'Send passcode'}
            testID={'signin'}
            label={authMethod == 'email' ? 'Send signin email' : 'Send passcode'}
            size='large'
            onPress={() => handleloginRequest()}
          />
        }
        back={
          visible && (
            <View>
              <PassCode
                onSuccess={code => getLoginDetails(authCode + code, client, onError, onError)}
              />
              <Button
                marginT-5
                link
                accessibilityLabel={
                  authMethod == 'email' ? 'Resend verification email' : 'Resend passcode'
                }
                label={authMethod == 'email' ? 'Resend verification email' : 'Resend passcode'}
                onPress={() => setVisible(false)}
              />
            </View>
          )
        }
        visible={visible}
      />
      {Platform.select({ ios: <KeyboardSpacer topSpacing={visible ? 150 : 0} /> })}
    </SigninWrapper>
  )
}

export default SigninScreen
