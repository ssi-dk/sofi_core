export type StringOrNumber = string | number;

export type NotEmpty = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
>(array: T[], keyField: K): { [k in T[K]]: T } {
  return array.reduce((obj: { [k in T[K]]: T }, item) => {
    const cpy = { ...obj };
    cpy[item[keyField]] = item;
    return cpy;
  }, {} as { [k in T[K]]: T });
}

/**
 * Perform deep merge of given objects.
 * In the event of a conflict, latest object wins.
 *
 * @param objects n-arity of objects to merge
 */
export function deepMerge<T extends object>(...objects: T[]) {
  const isObject = (obj: any) => obj && typeof obj === "object";

  function deepMergeInner(target: object, source: object) {
    Object.keys(source).forEach((key: string) => {
      const targetValue = target[key];
      const sourceValue = source[key];
      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        target[key] = targetValue.concat(sourceValue);
      } else if (isObject(targetValue) && isObject(sourceValue)) {
        target[key] = deepMergeInner({ ...targetValue }, sourceValue);
      } else {
        target[key] = sourceValue;
      }
    });
    return target;
  }

  if (objects.length < 2) {
    throw new Error(
      "deepMerge: this function expects at least 2 objects to be provided"
    );
  }

  if (objects.some((object) => !isObject(object))) {
    throw new Error('deepMerge: all values should be of type "object"');
  }

  const target = objects.shift();
  let source: object;

  while ((source = objects.shift())) {
    deepMergeInner(target, source);
  }
  return target;
}
