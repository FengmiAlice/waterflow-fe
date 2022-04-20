// import React from 'react';
// import logo from './logo.svg';
// import { Counter } from './features/counter/Counter';
import './App.css';
import { useRoutes }  from 'react-router-dom'
import  {routes}  from './router'

export default function App(){
  return  useRoutes(routes);
}

