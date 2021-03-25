/* eslint-disable @typescript-eslint/no-explicit-any */

export type StringOrNumber = string | number;

export type NotEmpty = {
  [K in StringOrNumber]: any;
};

export type IndexableOf<T extends NotEmpty> = keyof Pick<
  T,
  { [K in keyof T]: T[K] extends string | number ? K : never }[keyof T]
>;

export type PropFilter<T extends NotEmpty> = Partial<
  {
    [k in IndexableOf<T>]: string[];
  }
>;

export type RangeFilter<T extends NotEmpty> = Partial<
  {
    [k in keyof T]: { min: T[k]; max: T[k] };
  }
>;

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
  propFilters: PropFilter<T>,
  rangeFilters: RangeFilter<T>
) {
  const notEmpty = (t: T) => t !== null && t !== undefined;
  const ppreds = Object.keys(propFilters).map((k) => (t: T) =>
    propFilters[k].indexOf(t[k]) >= 0 || propFilters[k].length === 0
  );
  const rpreds = Object.keys(rangeFilters).map((k) => (t: T) =>
    rangeFilters[k].min <= t[k] && rangeFilters[k].max >= t[k]
  );
  return (t: T) =>
    notEmpty(t) && ppreds.every((p) => p(t)) && rpreds.every((p) => p(t));
}

export function invertMap(
  data: { [K: string]: string },
  normalizeKeys = false
) {
  return Object.entries(data).reduce(
    // eslint-disable-next-line
    (obj, item) =>
      (obj[item[1]] = normalizeKeys ? item[0] : item[0].toLocaleLowerCase()) &&
      obj,
    {}
  );
}

export function recurseTree(obj: Object, fn: (o: Object) => void) {
  fn(obj);
  // eslint-disable-next-line
  for (const k in obj) {
    if (typeof obj[k] === "object" && obj[k] !== null) recurseTree(obj[k], fn);
  }
}
