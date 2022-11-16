import * as test from 'test'
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'


// @ts-ignore
// const reverseJoin = (...args) => args;
// const moduleA = require('test')
function App() {
  const [count, setCount] = useState(0)

  console.log(test)

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count} {test.reverseJoin(1,2,3)}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
