export const getRandom = (seed: number): (() => number) => {
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

export type MinimalGraph = {
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

export const getRandomGraphWrapper = (
  n: number | null,
  l: number | null,
  random: () => number
): MinimalGraph | null => {
  if (n && l) {
    return getRandomGraph(n, l, random);
  }
  return null;
};

export const measureCallbackTime = <T,>(fn: () => T): [T, number] => {
  const startTime = performance.now();
  const resp = fn();
  const endTime = performance.now();
  return [resp, endTime - startTime];
};