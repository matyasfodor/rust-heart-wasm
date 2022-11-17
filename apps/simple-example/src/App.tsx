import * as wasmForceatlas2 from 'wasm-forceatlas2'
import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

function useDebounce<T, U>(value: T, callback: (a: T) => U, delay?: number): U {
  const [debouncedValue, setDebouncedValue] = useState<U>(callback(value))

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(callback(value)), delay || 500)
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])
  return debouncedValue
}


function App() {
  const [inputValue, setInputValue] = useState<string>("");

  const params = useDebounce(inputValue, (inputVal): null | {edges: number[][], nodes: number} => {
    try {
      const edges: number[][] = JSON.parse(inputVal);
      let nodes = 0;
      edges.forEach((pair: number[]) => {
        if (!Array.isArray(pair) || pair.length !== 2) {
          throw new Error("Invalid pair");
        }
        pair.forEach((number: number) => {
          if (number > nodes) {
            nodes = number;
          }
        });
      });

      nodes += 1;

      return {
        edges,
        nodes,
      }
    } catch (e) {
      console.log('Error parsing');
      return null;
    }
  });

  const [response, setResponse] = useState<unknown | null>(null)


  useEffect(() => {
    if (params) {
      const resp = wasmForceatlas2.generate_layout(params);
      setResponse(JSON.parse(resp));
    }

  }, [params])


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
        <input onChange={(e) => setInputValue(e.target.value)} value={inputValue}/>
        <pre>{JSON.stringify(response, null, 2)}</pre>
      </div>
    </div>
  )
}

export default App
