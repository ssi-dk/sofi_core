import { Square } from "@chakra-ui/react";
import {
  AnalysisResult,
  ApprovalStatus,
  AnalysisSorting,
  QueryExpression,
  QueryOperand,
  QueryOperator,
} from "sap-client";

const HISTORY_STORAGE_KEY = "searchHistory";
const MAX_HISTORY_LEN = 5;

export type SearchItem = {
  pinned: boolean;
  timestamp: string;
  query: QueryExpression;
};
export type SearchHistory = SearchItem[];

// For now, history is stored in localstorage. NOT on backend
export const getSearchHistory = () => {
  const rawJson = localStorage.getItem(HISTORY_STORAGE_KEY);
  const history: SearchHistory = JSON.parse(rawJson) || [];
  return history;
};

let callbacks = [];

export const registerHistoryCB = (cb: () => void) => {
  callbacks.push(cb);
};
export const deRegisterHistoryCB = (cb: () => void) => {
  callbacks = callbacks.filter((c) => c !== cb);
};
const saveSearchHistory = (history: SearchHistory) => {
  const rawJson = JSON.stringify(history);
  localStorage.setItem(HISTORY_STORAGE_KEY, rawJson);
};

export const setPinned = (item: SearchItem, pinned: boolean) => {
  const history = getSearchHistory();
  history.forEach((h) => {
    if (h.timestamp == item.timestamp) {
      h.pinned = pinned;
    }
  });
  saveSearchHistory(history);
  callbacks.forEach((cb) => cb());
};

export const recurseSearchTree = (
  e?: QueryExpression | QueryOperand
): QueryOperand[] => {
  if (!e) {
    return [];
  }
  if ("field" in e && e.field) {
    return [
      {
        field: e.field.toString(),
        term: e.term?.toString(),
        term_max: e.term_max,
        term_min: e.term_min,
      },
    ];
  }

  // Handle OR operations specially - group terms for the same field
  if (e.operator === "OR") {
    const leftOperands = recurseSearchTree(e.left);
    const rightOperands = recurseSearchTree(e.right);

    // Group operands by field
    const fieldGroups = new Map<string, string[]>();

    [...leftOperands, ...rightOperands].forEach((operand) => {
      if (
        operand.field &&
        operand.term &&
        !operand.term_max &&
        !operand.term_min
      ) {
        const existing = fieldGroups.get(operand.field) || [];
        existing.push(operand.term);
        fieldGroups.set(operand.field, existing);
      }
    });

    // Convert grouped fields back to operands with multiple terms
    const result: QueryOperand[] = [];
    fieldGroups.forEach((terms, field) => {
      if (terms.length === 1) {
        result.push({ field, term: terms[0] });
      } else {
        // For multiple terms, we need to represent them somehow
        // Since we can only use 'term', we'll create separate operands
        // but mark them as being part of the same logical group
        terms.forEach((term) => {
          result.push({ field, term });
        });
      }
    });

    // Add any range operands that weren't grouped
    [...leftOperands, ...rightOperands].forEach((operand) => {
      if (operand.term_max || operand.term_min) {
        result.push(operand);
      }
    });

    return result;
  }

  return [...recurseSearchTree(e.left), ...recurseSearchTree(e.right)];
};

// Helper function to create OR expression for multiple values in the same field
export const createOrExpression = (
  field: string,
  values: string[]
): QueryExpression => {
  if (values.length === 0) {
    return null;
  }

  if (values.length === 1) {
    return {
      field,
      term: values[0],
    } as QueryOperand;
  }

  // Create OR expression for multiple values
  let expression: QueryExpression = {
    field,
    term: values[0],
  } as QueryOperand;

  for (let i = 1; i < values.length; i++) {
    expression = {
      operator: QueryOperator.OR,
      left: expression,
      right: {
        field,
        term: values[i],
      } as QueryOperand,
    };
  }

  return expression;
};

// Helper function to create AND expression between different fields
export const createAndExpression = (
  expressions: QueryExpression[]
): QueryExpression => {
  if (expressions.length === 0) {
    return null;
  }

  if (expressions.length === 1) {
    if (!expressions[0].operator) {
      return { left: expressions[0] };
    }
    return expressions[0];
  }

  let result = expressions[0];
  for (let i = 1; i < expressions.length; i++) {
    result = {
      operator: QueryOperator.AND,
      left: result,
      right: expressions[i],
    };
  }

  return result;
};

export const reconstructQueryFromOperands = (
  operands: QueryOperand[]
): QueryExpression => {
  if (operands.length === 0) {
    return {};
  }

  // Group operands by field
  const fieldGroups = new Map<string, QueryOperand[]>();

  operands.forEach((operand) => {
    const existing = fieldGroups.get(operand.field) || [];
    existing.push(operand);
    fieldGroups.set(operand.field, existing);
  });

  const expressions: QueryExpression[] = [];

  fieldGroups.forEach((fieldOperands, field) => {
    if (fieldOperands.length === 1) {
      const operand = fieldOperands[0];
      expressions.push({
        field: operand.field,
        term: operand.term,
        term_max: operand.term_max,
        term_min: operand.term_min,
      } as QueryOperand);
    } else {
      // Multiple operands for same field - create OR expression
      const terms = fieldOperands
        .filter((op) => op.term && !op.term_max && !op.term_min)
        .map((op) => op.term);

      if (terms.length > 0) {
        expressions.push(createOrExpression(field, terms));
      }

      // Add any range operands separately
      fieldOperands
        .filter((op) => op.term_max || op.term_min)
        .forEach((op) => {
          expressions.push({
            field: op.field,
            term_max: op.term_max,
            term_min: op.term_min,
          } as QueryOperand);
        });
    }
  });

  return createAndExpression(expressions);
};

export const displayOperandName = ({
  field,
  term,
  term_max,
  term_min,
}: QueryOperand) => {
  if (term) {
    return `${field}=${term}`;
  } else if (term_max && term_min) {
    return `${new Date(term_min).toLocaleDateString()} < ${field} < ${new Date(
      term_max
    ).toLocaleDateString()}`;
  } else if (term_max) {
    return `${field} < ${new Date(term_max).toLocaleDateString()}`;
  } else if (term_min) {
    return `${field} > ${new Date(term_min).toLocaleDateString()}`;
  }
};

export const checkSortEquality = (s1: AnalysisSorting, s2: AnalysisSorting) => {
  if (s1 === s2) {
    return true;
  }
  if (typeof s1 !== typeof s2) {
    // Checking for undefined
    return false;
  }

  // The comparison objects are recreated on every search, therefore we need to do more complicated equality:
  if (s1.column !== s2.column) {
    return false;
  }
  if (s1.ascending !== s2.ascending) {
    return false;
  }

  return true;
};

export const checkExpressionEquality = (
  e1: QueryExpression,
  e2: QueryExpression
) => {
  const l1 = recurseSearchTree(e1);
  const l2 = recurseSearchTree(e2);

  l1.sort((a, b) => a.field.localeCompare(b.field));
  l2.sort((a, b) => a.field.localeCompare(b.field));

  // Deep comparison for operands
  if (l1.length !== l2.length) {
    return false;
  }

  for (let i = 0; i < l1.length; i++) {
    const op1 = l1[i];
    const op2 = l2[i];

    if (op1.field !== op2.field) {
      return false;
    }

    // Compare single term
    if (op1.term !== op2.term) {
      return false;
    }

    // Compare range terms
    if (op1.term_max !== op2.term_max || op1.term_min !== op2.term_min) {
      return false;
    }
  }

  return true;
};

// Helper function to build query expression from filter state
export const buildQueryFromFilters = (
  propFilters: { [field: string]: string[] },
  rangeFilters: { [field: string]: { min?: any; max?: any } },
  approvalFilter: ApprovalStatus[]
): QueryExpression => {
  const expressions: QueryExpression[] = [];

  // Handle property filters (multiple values OR'ed together per field)
  Object.entries(propFilters).forEach(([field, values]) => {
    if (values && values.length > 0) {
      const orExpression = createOrExpression(field, values);
      if (orExpression) {
        expressions.push(orExpression);
      }
    }
  });

  // Handle range filters
  Object.entries(rangeFilters).forEach(([field, range]) => {
    if (range && (range.min !== undefined || range.max !== undefined)) {
      expressions.push({
        field,
        term_min: range.min,
        term_max: range.max,
      } as QueryOperand);
    }
  });
  if (approvalFilter.length > 0) {
    const orExpression = createOrExpression("approval_status", approvalFilter);
    if (orExpression) {
      expressions.push(orExpression);
    }
  }

  return createAndExpression(expressions);
};

export const appendToSearchHistory = (query: QueryExpression) => {
  if (recurseSearchTree(query).length == 0) {
    // Ignore empty searches
    return;
  }

  const current = getSearchHistory();

  // Check if matches existing search
  const existing = current.find((c) => checkExpressionEquality(c.query, query));
  if (existing) {
    // Move existing to top
    const withoutExisting = current.filter((c) => c !== existing);
    existing.timestamp = new Date().toISOString();
    saveSearchHistory([existing, ...withoutExisting]);
  } else {
    const item: SearchItem = {
      pinned: false,
      query,
      timestamp: new Date().toISOString(),
    };

    let nonPinnedCount = 0;

    const newHistory = [item, ...current].filter((c) => {
      if (c.pinned) {
        return true;
      }
      nonPinnedCount += 1;
      return nonPinnedCount <= MAX_HISTORY_LEN;
    });
    saveSearchHistory(newHistory);
  }

  callbacks.forEach((c) => c());
};
