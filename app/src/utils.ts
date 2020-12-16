/* eslint-disable @typescript-eslint/no-explicit-any */

export type StringOrNumber = string | number;

export type NotEmpty = {
  [K in StringOrNumber]: any;
};

export type IndexableOf<T extends NotEmpty> = keyof Pick<
  T,
  { [K in keyof T]: T[K] extends string | number ? K : never }[keyof T]
>;

export type PropFilter<T extends NotEmpty> = {
  [k in IndexableOf<T>]: string[];
};

export type RangeFilter<T extends NotEmpty> = {
  [k in IndexableOf<T>]: {min: T[k], max: T[k]};
};

export type FilterPredicate<T extends NotEmpty> = (x: T) => boolean;

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
>(array: T[], keyField: K): { [k in T[K]]: T } {
  return array.reduce((obj: { [k in T[K]]: T }, item) => {
    const cpy = { ...obj };
    cpy[item[keyField]] = item;
    return cpy;
  }, {} as { [k in T[K]]: T });
}

export function predicateBuilder<T extends NotEmpty>(
  propFilters: PropFilter<T>
) {
  const preds = Object.keys(propFilters).map((k) => (t: T) =>
    (t !== null && t !== undefined && propFilters[k].indexOf(t[k]) >= 0) ||
    propFilters[k].length === 0
  );
  return (t: T) => preds.every((p) => p(t));
}
