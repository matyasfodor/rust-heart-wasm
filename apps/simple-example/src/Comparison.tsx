import * as wasmForceatlas2 from "wasm-forceatlas2";
import forceAtlas2 from "graphology-layout-forceatlas2";
import randomLayout from "graphology-layout/random";

import { useEffect, useState } from "react";
import "./Demo.css";
import Graph from "graphology";
import { SigmaContainer } from "@react-sigma/core";
import {
  getRandom,
  getRandomGraphWrapper,
  getStats,
  measureCallbackTime,
} from "./utils";


function Comparison() {
  const [numberOfNodes, setNumberOfNodes] = useState<number | null>(32);
  const [numberOfEdges, setNumberOfEdges] = useState<number | null>(10);
  const [seed, setSeed] = useState<number | null>(0);

  const [running, setRunning] = useState(false);
  const [clearIntervalToken, setClearIntervalToken] = useState<number>();

  const [wasmGraph, setWasmGraph] = useState<null | Graph>(null);
  const [nativeGraph, setNativeGraph] = useState<null | Graph>(null);

  const [wasmMetric, setWasmMetric] = useState<number[]>([]);
  const [nativeMetric, setNativeMetric] = useState<number[]>([]);

  const iterations = 100;

  useEffect(() => {
    const params = getRandomGraphWrapper(
      numberOfNodes,
      numberOfEdges,
      getRandom(seed ?? 0)
    );

    const graph = new Graph();

    if (!params) {
      return;
    }

    const random = getRandom(seed ?? 0);
    for (let i = 0; i < params.order; i++) {
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
        const nodes = Array.from(wasmGraph.nodeEntries()).map(
          ({ attributes: { x, y } }) => [x, y]
        );
        const edges = Array.from(wasmGraph.edgeEntries()).map((edge) => [
          parseInt(edge.source),
          parseInt(edge.target),
        ]);

        const [resp, wasmElapsedTime] = measureCallbackTime(() =>
          wasmForceatlas2.generate_layout({
            edges,
            nodes,
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

        setWasmMetric((arr) => [...arr, wasmElapsedTime]);

        const parsedResponse: number[][] = JSON.parse(resp);

        wasmGraph.updateEachNodeAttributes((node, attributes) => {
          const [x, y] = parsedResponse[parseInt(node)];
          return {
            ...attributes,
            x,
            y,
          };
        });

        setWasmGraph(wasmGraph);

        // handle native graph

        const [coordinates, nativeElapsedTime] = measureCallbackTime(() =>
          forceAtlas2(nativeGraph, iterations)
        );

        setNativeMetric((arr) => [...arr, nativeElapsedTime]);

        nativeGraph.updateEachNodeAttributes((node, attributes) => {
          return {
            ...attributes,
            ...coordinates[node],
          };
        });
        setNativeGraph(nativeGraph);
      }, 1000);
      setClearIntervalToken(clearIntervalToken);
    } else {
      clearInterval(clearIntervalToken);
    }
  }, [running]);

  const handleOnClick = () => {
    setRunning((current) => !current);
  };

  const wasmStats = getStats(wasmMetric);
  const nativeStats = getStats(nativeMetric);

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
          max={
            numberOfNodes ? (numberOfNodes * (numberOfNodes - 1)) / 2 : 10000
          }
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
        <button onClick={() => handleOnClick()}>
          {running ? "Stop" : "Start"}
        </button>
      </div>
      <div>
        {wasmGraph && (
          <SigmaContainer
            style={{ height: "500px", width: "500px", position: "relative" }}
            graph={wasmGraph}
          />
        )}
        {`Wasm metrics: mean: ${wasmStats.mean} std: ${wasmStats.std} length: ${wasmStats.length} last: ${wasmStats.last}`}
      </div>
      <div>
        {nativeGraph && (
          <SigmaContainer
            style={{ height: "500px", width: "500px", position: "relative" }}
            graph={nativeGraph}
          />
        )}
          {`Native metrics: mean: ${nativeStats.mean} std: ${nativeStats.std} length: ${nativeStats.length} last: ${nativeStats.last}`}
      </div>
    </div>
  );
}

export default Comparison;
