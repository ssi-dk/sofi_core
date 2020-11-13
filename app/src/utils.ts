export type StringOrNumber = string | number;

export type NotEmpty = {
  [K in StringOrNumber]: any;
};

export type IndexableOf<T extends NotEmpty> = keyof Pick<
  T,
  { [K in keyof T]: T[K] extends string | number ? K : never }[keyof T]
>;

/**
 * transforms:
 *      [{id: 1, genre: "funk"}, {id: 2, genre: "jazz"}]
 * into:
 *      {1: {id: 1, genre: "funk"}, 2: {id: 2, genre: "jazz"} }
 *
 * The types enforce that it's an indexable, non-nullable property that gets used
 * But types can't enforce uniqueness; if there's duplicates, the last item wins
 *
 * @param array Array of objects with an a unique id or index property
 * @param keyField the unique id or index property
 */
export function arrayToNormalizedHashmap<
  T extends NotEmpty,
  K extends IndexableOf<T>
>(array: T[], keyField: K) {
  return array.reduce((obj: { [k in T[K]]: T }, item) => {
    const cpy = { ...obj };
    cpy[item[keyField]] = item;
    return cpy;
  }, {} as { [k in T[K]]: T });
}
