import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { Users, Home } from './components/pages';
import './App.css';

function App() {
  return (
    <div className="container">
      <BrowserRouter>
        <Route exact path="/" component={Home}/>
        <Route exact path="/users/" component={Home}/>
        <Route path="/users/:nickname" component={Users}/>
      </BrowserRouter>
    </div>
  );
}

export default App;