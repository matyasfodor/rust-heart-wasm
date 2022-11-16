import reverseArguments from 'reverse-arguments';

export function join() {
  return Array.prototype.slice.call(arguments).join(',');
}

export const reverseJoin = reverseArguments(join);