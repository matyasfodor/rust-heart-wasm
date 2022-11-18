import * as wasmForceatlas2 from "wasm-forceatlas2";
import forceAtlas2 from "graphology-layout-forceatlas2";
import randomLayout from "graphology-layout/random";

import { useEffect, useState } from "react";
import "./Demo.css";
import Graph from "graphology";
import { SigmaContainer } from "@react-sigma/core";
import { getRandom, getRandomGraphWrapper, measureCallbackTime, MinimalGraph } from "./utils";

function Demo() {
  const [numberOfNodes, setNumberOfNodes] = useState<number | null>(32);
  const [numberOfEdges, setNumberOfEdges] = useState<number | null>(10);
  const [seed, setSeed] = useState<number | null>(0);

  const [running, setRunning] = useState(false);
  const [clearIntervalToken, setClearIntervalToken] = useState<number>();

  const [wasmGraph, setWasmGraph] = useState<null | Graph>(null);
  const [nativeGraph, setWasmGraphsetNativeGraph] = useState<null | Graph>(null);

  const [useWasm, setUseWasm] = useState(true);

  const [params, setParams] = useState<MinimalGraph | null>(null);

  const [metric, setMetric] = useState<number | null>(null);
  const iterations = 1;

  useEffect(() => {
    const params = getRandomGraphWrapper(numberOfNodes, numberOfEdges, getRandom(seed ?? 0));

    const graph = new Graph();

    if (!params) {
      return;
    }

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


  const nativeGraph = graph.copy();
  const wasmGraph = graph.copy();

    if (running) {
      const clearIntervalToken = setInterval(() => {

        // handle wasm
        // nativeGraph.nodeEntries();
        const nodes = nativeGraph.size;
        const edges = Array.from(nativeGraph.edgeEntries()).map((edge) => [edge.source, edge.target]);
        // const minimalGraph: MinimalGraph = {

        // }
        // handle native



      }, 1000);
      setClearIntervalToken(clearIntervalToken);
    } else {
      clearInterval(clearIntervalToken);
    }
  }, [running]);

  // useEffect(() => {
  //   if (params) {
      
  //   }
  // }, [params]);

  // useEffect(() => {
  //   if (params) {
  //     const graph = new Graph();

  //     if (useWasm) {
  //       const [resp, elapsedTime] = measureCallbackTime(() =>
  //         wasmForceatlas2.generate_layout({
  //           ...params,
  //           iterations,
  //           settings: {
  //             chunk_size: null,
  //             dimensions: 2,
  //             dissuade_hubs: false,
  //             ka: 0.01,
  //             kg: 0.001,
  //             kr: 0.002,
  //             lin_log: false,
  //             speed: 1.0,
  //             prevent_overlapping: null,
  //             strong_gravity: false,
  //           },
  //         })
  //       );
  //       setMetric(elapsedTime);

  //       const parsedResponse: number[][] = JSON.parse(resp);
  //       parsedResponse.forEach((coords, i) => {
  //         graph.addNode(i, {
  //           x: coords[0],
  //           y: coords[1],
  //           label: `Node ${i}`,
  //           size: 10,
  //         });
  //       });

  //       params.edges.forEach(([from, to]) => {
  //         graph.addEdge(from, to);
  //       });
  //     } else {
  //       const random = getRandom(seed ?? 0);
  //       for (let i = 0; i < params.nodes; i++) {
  //         graph.addNode(i, {
  //           label: `Node ${i}`,
  //           size: 10,
  //         });
  //       }

  //       for (const [a, b] of params.edges) {
  //         graph.addEdge(a, b);
  //       }

  //       randomLayout.assign(graph, { rng: random });

  //       const [coordinates, elapsedTime] = measureCallbackTime(() => 
  //         forceAtlas2(graph, iterations)
  //       );
  //       setMetric(elapsedTime);

  //       graph.updateEachNodeAttributes((node, attributes) => {
  //         return {
  //           ...attributes,
  //           ...coordinates[node],
  //         }
  //       });

  //     }

  //     setWasmGraph(graph);
  //   }
  // }, [params]);

  const handleOnClick = () => {
    setRunning((current) => !current);
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
        <button onClick={() => handleOnClick()}>{running ? 'Stop': 'Start'}</button>
      </div>
      <div>
        {wasmGraph && (
          <SigmaContainer
            style={{ height: "500px", width: "500px", position: "relative" }}
            graph={wasmGraph}
          />
        )}
        {metric !== null && <p>It took {metric} ms to compute</p>}
      </div>
    </div>
  );
}

export default Demo;
