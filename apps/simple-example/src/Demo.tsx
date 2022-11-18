import * as wasmForceatlas2 from "wasm-forceatlas2";
import forceAtlas2 from "graphology-layout-forceatlas2";
import randomLayout from "graphology-layout/random";

import { useEffect, useState } from "react";
import "./Demo.css";
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
  edges: number[][];
  nodes: number;
};

/**
 * get a random set of links of length l between n nodes
 * Inspired from: http://bl.ocks.org/erkal/9746513
 * @param n number of nodes
 * @param l number of links
 * @param random injected random function to seed the algorithm
 * @returns list of links
 */
const getRandomGraph = (
  n: number,
  l: number,
  random: () => number
): MinimalGraph => {
  return {
    edges: randomChoose(unorderedPairs(range(n)), l, random),
    nodes: n,
  };
};

const getRandomGraphWrapper = (
  n: number | null,
  l: number | null,
  random: () => number
): MinimalGraph | null => {
  if (n && l) {
    return getRandomGraph(n, l, random);
  }
  return null;
};

const measureCallbackTime = <T,>(fn: () => T): [T, number] => {
  const startTime = performance.now();
  const resp = fn();
  const endTime = performance.now();
  return [resp, endTime - startTime];
};

function Demo() {
  const [numberOfNodes, setNumberOfNodes] = useState<number | null>(32);
  const [numberOfEdges, setNumberOfEdges] = useState<number | null>(10);
  const [seed, setSeed] = useState<number | null>(0);

  const [graph, setGraph] = useState<null | Graph>(null);

  const [useWasm, setUseWasm] = useState(true);

  const [params, setParams] = useState<MinimalGraph | null>(null);

  const [metric, setMetric] = useState<number | null>(null);
  const iterations = 500;

  useEffect(() => {
    if (params) {
      const graph = new Graph();

      if (useWasm) {
        const [resp, elapsedTime] = measureCallbackTime(() =>
          wasmForceatlas2.generate_layout({
            ...params,
            iterations,
            settings: {
              chunk_size: null,
              dimensions: 2,
              dissuade_hubs: false,
              ka: 0.01,
              kg: 0.001,
              kr: 0.002,
              lin_log: false,
              speed: 1.0,
              prevent_overlapping: null,
              strong_gravity: false,
            },
          })
        );
        setMetric(elapsedTime);

        const parsedResponse: number[][] = JSON.parse(resp);
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
      } else {
        const random = getRandom(seed ?? 0);
        for (let i = 0; i < params.nodes; i++) {
          graph.addNode(i, {
            label: `Node ${i}`,
            size: 10,
          });
        }

        for (const [a, b] of params.edges) {
          graph.addEdge(a, b);
        }

        randomLayout.assign(graph, { rng: random });

        const [coordinates, elapsedTime] = measureCallbackTime(() => 
          forceAtlas2(graph, iterations)
          // forceAtlas2.assign(graph, iterations)
        );
        setMetric(elapsedTime);
        // console.log(coordinates);
        // for (const node of graph.nodeEntries()) {
        //   // node.attributes['x']
        //   // console.log('Node', node);
        //   node.attributes = {
        //     ...node.attributes,
        //     ...coordinates[node.node],
        //   };
        //   // console.log(node);
        // }
        // graph.forEachNode((node, attributes) => {
        //   // console.log("Node", node, attributes, coordinates[node].x, coordinates[node].y);
        //   // attributes.x = coordinates[node].x;
        //   // attributes.y = coordinates[node].y;
        //   graph.updateNodeAttributes(node, )
        // });

        graph.updateEachNodeAttributes((node, attributes) => {
          return {
            ...attributes,
            ...coordinates[node],
          }
        });

      }

      setGraph(graph);
    }
  }, [params]);

  const handleOnClick = () => {
    setParams(
      getRandomGraphWrapper(numberOfNodes, numberOfEdges, getRandom(seed ?? 0))
    );
  };

  return (
    <div className="App">
      <h1>Graph generator demo</h1>
      <div className="card">
        <label htmlFor="numberOfNodes">Number of nodes:</label>
        <input
          type="number"
          name="numberOfNodes"
          onChange={(e) =>
            setNumberOfNodes(
              !isNaN(e.target.valueAsNumber) ? e.target.valueAsNumber : null
            )
          }
          value={numberOfNodes ?? ""}
        />
        <label htmlFor="numberOfEdges">Number of edges:</label>
        <input
          type="number"
          name="numberOfEdges"
          max={numberOfNodes ? ((numberOfNodes* (numberOfNodes-1) / 2)) : 10000}
          onChange={(e) =>
            setNumberOfEdges(
              !isNaN(e.target.valueAsNumber) ? e.target.valueAsNumber : null
            )
          }
          value={numberOfEdges ?? ""}
        />
        <label htmlFor="seed">Seed:</label>
        <input
          type="number"
          name="seed"
          onChange={(e) =>
            setSeed(
              !isNaN(e.target.valueAsNumber) ? e.target.valueAsNumber : null
            )
          }
          value={seed ?? ""}
        />
        <label htmlFor="useWasm">Use wasm</label>
        <input
          name="useWasm"
          type="checkbox"
          checked={useWasm}
          onChange={(e) => setUseWasm(e.target.checked)}
        />
        <button onClick={() => handleOnClick()}>Render</button>
      </div>
      <div>
        {graph && (
          <SigmaContainer
            style={{ height: "500px", width: "500px", position: "relative" }}
            graph={graph}
          />
        )}
        {metric !== null && <p>It took {metric} ms to compute</p>}
      </div>
    </div>
  );
}

export default Demo;
