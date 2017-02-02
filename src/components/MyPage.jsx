//====================================================================================================
//        File: components/MyPage.jsx
// Description: MyPage Component
//====================================================================================================

//====================================================================================================
// Libralies
//====================================================================================================
import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import { browserHistory } from 'react-router';
import { CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js';
import apigClientFactory from 'aws-api-gateway-client';

//====================================================================================================
// Component
//====================================================================================================
class MyPage extends React.Component {

  constructor(props) {
    super(props);

    this.getUserPool = this.getUserPool.bind(this);
    this.getCognitoUser = this.getCognitoUser.bind(this);
    this.getUserAttributes = this.getUserAttributes.bind(this);
    this.onCallApi = this.onCallApi.bind(this);
    this.onSignOut = this.onSignOut.bind(this);
  }

  componentWillMount(){
    this.cognitoUser = this.signInCheck();
  }

  signInCheck(){

    let _this = this;

    let userPool = this.getUserPool();
    let cognitoUser = userPool.getCurrentUser();
    
    if (!cognitoUser) {
      browserHistory.push("/");
      return;
    }

    cognitoUser.getSession(function(error, session) {
      if(error) {
        console.log(error);
        browserHistory.push("/");
        return;
      }
      if(session) {
        _this.getUserAttributes(cognitoUser);
      }
    });

    return cognitoUser;
  }

  getUserAttributes(cognitoUser){

    let _this = this;

    cognitoUser.getUserAttributes(function(error, attributes) {

      let attributeRecords = [];
      for(let attribute of attributes) {

        let attributeRecord = {
          name: attribute.getName(),
          value: attribute.getValue()
        };

        attributeRecords.push(attributeRecord);
      }

      _this.refs.attributes.innerText = JSON.stringify(attributeRecords);

    });

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

  onCallApi(){

    let _this = this;

    _this.refs.apiResponse.innerHTML = '';

    let apigClientConfig = {
      invokeUrl: process.env.INVOKE_URL
    };
    let apigClient = apigClientFactory.newClient(apigClientConfig);

    let invokeConfig = {
      //This is where any header, path, or querystring request params go. The key is the parameter named as defined in the API
      params : {

      },
      // Template syntax follows url-template https://www.npmjs.com/package/url-template
      pathTemplate : '/',
      method : 'GET',
      //If there are any unmodeled query parameters or headers that need to be sent with the request you can add them here
      additionalParams : {
        headers: {
            Authorization: this.cognitoUser.signInUserSession.idToken.jwtToken
        }
      },
      //This is where you define the body of the request
      body : {

      }
    };
    
    // Invoke
    apigClient.invokeApi(
      invokeConfig.params,
      invokeConfig.pathTemplate,
      invokeConfig.method,
      invokeConfig.additionalParams,
      invokeConfig.body)
    .then(function(result){
      //This is where you would put a success callback
      console.log(result);
      _this.refs.apiResponse.innerHTML = result.data.message;
    })
    .catch( function(result){
      //This is where you would put an error callback
      console.log(result);
    });
  }

  onSignOut(){
    this.cognitoUser.signOut();
    browserHistory.push("/");
  }

  render() {
    return (
      <div className="myPage">
        - My Page -<br/>
        <br/>
        <div ref="attributes"></div><br/>
        <br/>
        <RaisedButton label="Call API" fullWidth={true} onTouchTap={this.onCallApi} /><br/>
        <div ref="apiResponse"></div><br/>
        <RaisedButton label="Sign Out" fullWidth={true} onTouchTap={this.onSignOut} />
      </div>
    );
  }
}

export default MyPage;
