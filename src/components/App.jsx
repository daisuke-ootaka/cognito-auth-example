//====================================================================================================
//        File: components/App.jsx
// Description: Main App Component
//====================================================================================================

//====================================================================================================
// Libralies
//====================================================================================================
import React from 'react';
import {browserHistory, History, IndexRoute, Route, Router} from 'react-router';

import SignIn from './SignIn';
import MyPage from './MyPage';

//====================================================================================================
// Component
//====================================================================================================
class App extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Router history={browserHistory}>
          <Route path="/" component={SignIn}/>
          <Route path="/mypage" component={MyPage}/>
        </Router>
      </div>
    );
  }
}

export default App;
