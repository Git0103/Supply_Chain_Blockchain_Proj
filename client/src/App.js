import React from 'react';
import './App.css';
import AssignRoles from './AssignRoles';
import Home from './Home';
import AddMed from './AddMed';
import Track from './Track';
import RMSDashboard from './dashboards/RMSDashboard';
import ManufacturerDashboard from './dashboards/ManufacturerDashboard';
import DistributorDashboard from './dashboards/DistributorDashboard';
import RetailerDashboard from './dashboards/RetailerDashboard';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/roles" component={AssignRoles} />
          <Route path="/addmed" component={AddMed} />
          <Route path="/track" component={Track} />
          <Route path="/rms-dashboard" component={RMSDashboard} />
          <Route path="/manufacturer-dashboard" component={ManufacturerDashboard} />
          <Route path="/distributor-dashboard" component={DistributorDashboard} />
          <Route path="/retailer-dashboard" component={RetailerDashboard} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
