import * as wasmForceatlas2 from "wasm-forceatlas2";
import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import Graph from "graphology";
import { SigmaContainer } from "@react-sigma/core";

const getRandom = (seed: number): (() => number) => {
  return (): number => {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
};

/**
 * returns a random k element subset of s
 * @param s list of elements
 * @param k number of elements to return
 * @returns subset of s
 */
function randomChoose<T>(s: T[], k: number, random: () => number): T[] {
  var a = [],
    i = -1,
    j;
  while (++i < k) {
    j = Math.floor(random() * s.length);
    a.push(s.splice(j, 1)[0]);
  }
  return a;
}

/**
 * returns the list of all unordered pairs from s
 * @param s a list of elements
 * @returns
 */
function unorderedPairs<T>(s: T[]): T[][] {
  var i = -1,
    a = [],
    j;
  while (++i < s.length) {
    j = i;
    while (++j < s.length) a.push([s[i], s[j]]);
  }
  return a;
}

const range = (n: number): number[] => [...Array(n).keys()];

type MinimalGraph = {
  edges: number[][]; nodes: number;
}


/**
 * get a random set of links of length l between n nodes
 * @param n number of nodes
 * @param l number of links
 * @param random injected random function to seed the algorithm
 * @returns list of links
 */
const getRandomGraph = (n: number, l: number, random: () => number): MinimalGraph => {
  return {
    edges: randomChoose(unorderedPairs(range(n)), l, random),
    nodes: n,
  }
};

function useDebounce<T, U>(value: T, callback: (a: T) => U, delay?: number): U {
  const [debouncedValue, setDebouncedValue] = useState<U>(callback(value));

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedValue(callback(value)),
      delay || 500
    );
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  return debouncedValue;
}

function App() {
  const [inputValue, setInputValue] = useState<string>("");
  const [graph, setGraph] = useState<null | Graph>(null);
  const [seed, setSeed] = useState(0);
  const [numberOfNodes, setNumberOfNodes] = useState<number>(32);
  const [numberOfEdges, setNumberOfEdges] = useState<number>(10);

  const [params, setParams] = useState<MinimalGraph>(getRandomGraph(numberOfNodes, numberOfEdges, getRandom(seed)))

  useEffect(() => {
    if (params) {
      const resp = wasmForceatlas2.generate_layout(params);
      const parsedResponse: number[][] = JSON.parse(resp);

      const graph = new Graph();

      parsedResponse.forEach((coords, i) => {
        graph.addNode(i, {
          x: coords[0],
          y: coords[1],
          label: `Node ${i}`,
          size: 10,
        });
      });

      params.edges.forEach(([from, to]) => {
        graph.addEdge(from, to);
      });

      setGraph(graph);
    }
  }, [params]);

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
        <input
          onChange={(e) => setInputValue(e.target.value)}
          value={inputValue}
        />
      </div>
      <div>
        {graph && (
          <SigmaContainer
            style={{ height: "500px", width: "500px", position: "relative" }}
            graph={graph}
          />
        )}
      </div>
    </div>
  );
}

export default App;
