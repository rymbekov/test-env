import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import ScreenPreview from '../components/previewView';
import appHistory from '../helpers/history';

export default () => (
  <Router history={appHistory}>
    <Switch>
      <Route path="/preview/:id" component={ScreenPreview} />
    </Switch>
  </Router>
);
