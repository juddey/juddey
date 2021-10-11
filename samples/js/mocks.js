import { LOGIN_REQUEST } from '~/Queries/signin'
import Config from 'react-native-config'

export const emailPresent = [
  {
    request: {
      query: LOGIN_REQUEST,
      variables: { identifier: 'test@email.com' },
      context: { uri: Config.REACT_APP_GRAPHQL_PUBLIC_API }
    },
    result: {
      data: {
        LoginRequest: 'ok'
      }
    }
  }
]

export const emailNotPresent = [
  {
    request: {
      query: LOGIN_REQUEST,
      variables: { identifier: 'test@email.com' },
      context: { uri: Config.REACT_APP_GRAPHQL_PUBLIC_API }
    },
    result: {
      data: {
        LoginRequest: null
      }
    }
  }
]

export const phonePresent = [
  {
    request: {
      query: LOGIN_REQUEST,
      variables: { identifier: '+64276236003' },
      context: { uri: Config.REACT_APP_GRAPHQL_PUBLIC_API }
    },
    result: {
      data: {
        LoginRequest: 'ok'
      }
    }
  }
]
