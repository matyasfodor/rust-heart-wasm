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

  const [graph, setGraph] = useState<null | Graph>(null);

  const [useWasm, setUseWasm] = useState(true);

  const [params, setParams] = useState<MinimalGraph | null>(null);

  const [metric, setMetric] = useState<number | null>(null);
  const iterations = 100;

  useEffect(() => {
    if (params) {
      const graph = new Graph();
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
      const nodes = Array.from(graph.nodeEntries()).map(({attributes}) => [attributes.x, attributes.y]);
      if (useWasm) {
        const [resp, elapsedTime] = measureCallbackTime(() =>
          wasmForceatlas2.generate_layout({
            edges: params.edges,
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
        setMetric(elapsedTime);

        const parsedResponse: number[][] = JSON.parse(resp);


        graph.updateEachNodeAttributes((node, attributes) => {
          const [x, y] = parsedResponse[parseInt(node)];
          return {
            ...attributes,
            x,
            y
          }
        });

      } else {
        const [coordinates, elapsedTime] = measureCallbackTime(() => 
          forceAtlas2(graph, iterations)
        );
        setMetric(elapsedTime);

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
