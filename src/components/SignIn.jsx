//====================================================================================================
//        File: components/SignIn.jsx
// Description: SignIn Component
//====================================================================================================

//====================================================================================================
// Libralies
//====================================================================================================
import React from 'react';
import ReactDOM from 'react-dom';
import { browserHistory } from 'react-router';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import AWS from 'aws-sdk';
import { AuthenticationDetails, CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js';

//====================================================================================================
// Component
//====================================================================================================
class SignIn extends React.Component {

  constructor(props) {
    super(props);

    this.getUserPool = this.getUserPool.bind(this);
    this.getCognitoUser = this.getCognitoUser.bind(this);
    this.getAuthenticationDetails = this.getAuthenticationDetails.bind(this);
    this.onSignIn = this.onSignIn.bind(this);
  }

  getUserPool(){

    const userPoolData = {
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      ClientId: process.env.COGNITO_APP_CLIENT_ID
    };
  
    let userPool = new CognitoUserPool(userPoolData);
    
    return userPool;
  }

  getCognitoUser(username, userPool){

    let cognitoUserData = {
      Username : username,
      Pool : userPool
    };

    let cognitoUser = new CognitoUser(cognitoUserData);

    return cognitoUser;
  }

  getAuthenticationDetails(){

    let authenticationData = {
      Username : this.refs.Username.input.value,
      Password : this.refs.Password.input.value
    };

    let authenticationDetails = new AuthenticationDetails(authenticationData);
    
    return authenticationDetails;
  }

  onSignIn(){

    let _this = this;

    let userPool = this.getUserPool();
    let cognitoUser = this.getCognitoUser(this.refs.Username.input.value, userPool);
    let authenticationDetails = this.getAuthenticationDetails();
    
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (authresult) {
        let jwtToken = authresult.getIdToken().getJwtToken();
        let cognitoIdp = 'cognito-idp.' + process.env.REGION + '.amazonaws.com/' + process.env.COGNITO_USER_POOL_ID;

        // Add the User's Id Token to the Cognito credentials login map.
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: process.env.COGNITO_IDENTITY_POOL_ID,
            Logins: {
                [cognitoIdp]: jwtToken
            }
        });

        browserHistory.push("mypage")
      },

      onFailure: function(err) {
        console.log(err.message);
        _this.refs.ErrorMessage.innerText = err.message;
      },

      newPasswordRequired: function(userAttributes, requiredAttributes) {
        console.log('New Password Required');
        // TODO: new password challenge logic
        let newPassword = process.env.DEFAULT_PASSWORD;
        cognitoUser.completeNewPasswordChallenge(newPassword, null, this)
      }
    });
  }

  render() {
    return (
      <div className="signIn">
        <TextField type="text" ref="Username" hintText="Username" floatingLabelText="Username" fullWidth={true} defaultValue={process.env.DEFAULT_USERNAME} /><br/>
        <TextField type="password" ref="Password" hintText="Password" floatingLabelText="Password" fullWidth={true} defaultValue={process.env.DEFAULT_PASSWORD} /><br/>
        <div ref="ErrorMessage" className="alert"></div><br/>
        <RaisedButton label="Sign in" fullWidth={true} onTouchTap={this.onSignIn} />
      </div>
    );
  }
}

export default SignIn;
