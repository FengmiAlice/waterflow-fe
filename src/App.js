import './App.css';
import  {routes}  from './router'
import { useRoutes } from 'react-router-dom';
export default function App(){
      const elements = useRoutes(routes)
     return elements;

}

