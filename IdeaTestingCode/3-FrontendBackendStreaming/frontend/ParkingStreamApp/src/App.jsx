import { useState, useRef } from 'react'
import './App.css'
import TextField from '@mui/material/TextField'
import DisplayStream from './DashboardStream'

function App() {

  const [accID, setAccID] = useState("")
  const [timeoutSec, setTimeoutSec] = useState(10)

  const enterTimeoutSec = (e)=>{

    const inputNum = Number(e.target.value);
    
    if (!isNaN(inputNum))
    {
      setTimeoutSec(inputNum);
    }
  }

  //onChange={(e)=>{accID.current = e.target.value}}

  return (
    <>
      <div>
        <TextField variant="outlined"
          label="Account ID"
          value={accID.current}
          onChange={(e)=>{setAccID(e.target.value)}}
          >

        </TextField>

        <TextField variant="outlined"
          label="Time out Sec"
          value={timeoutSec}
          onChange={enterTimeoutSec}>

        </TextField>

        {
          DisplayStream({accID:accID, expTime:timeoutSec})
        }

      </div>
    </>
  )
}

export default App
