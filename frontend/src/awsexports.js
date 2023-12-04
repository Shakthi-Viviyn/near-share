export default {
    Auth: {
      Cognito: {
        //  Amazon Cognito User Pool ID
        userPoolId: 'ca-central-1_GoOSURaNb',
        // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
        userPoolClientId: '1fk1ahdh848p6adnpt6q0stvqp',
        // OPTIONAL - This is used when autoSignIn is enabled for Auth.signUp
        // 'code' is used for Auth.confirmSignUp, 'link' is used for email link verification
        signUpVerificationMethod: 'code', // 'code' | 'link'
        loginWith: {
          // OPTIONAL - Hosted UI configuration
          oauth: {
            scopes: [
              'email',
              'profile',
              'openid',
              'aws.cognito.signin.user.admin'
            ],
            redirectSignIn: ['http://localhost:3000/'],
            redirectSignOut: ['http://localhost:3000/'],
            responseType: 'token' // or 'token', note that REFRESH token will only be generated when the responseType is code
          }
        }
      }
    }
  }