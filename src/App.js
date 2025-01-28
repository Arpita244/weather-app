import logo from './logo.svg';
import './App.css';
import { apifun } from './api';
import {useEffect,useState} from "react"
function App() {
  const[data,setdata]=useState("")
  useEffect(async()=>{
    const d=await apifun
    console.log(d)
    setdata(JSON.stringify(d));
  },[])
  
  return (
{data}
  );
}

export default App;
