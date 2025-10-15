import { QueryExpression, QueryOperand } from "sap-client";

const HISTORY_STORAGE_KEY = "searchHistory"
const MAX_HISTORY_LEN = 5;

export type SearchItem = { pinned: boolean, timestamp: string, query: QueryExpression }
export type SearchHistory = SearchItem[]

// For now, history is stored in localstorage. NOT on backend
export const getSearchHistory = () => {
    const rawJson = localStorage.getItem(HISTORY_STORAGE_KEY);
    const history: SearchHistory = JSON.parse(rawJson) || [];
    return history;

}

let callbacks = []

export const registerHistoryCB = (cb: () => void) => {
    callbacks.push(cb)
}
export const deRegisterHistoryCB = (cb: () => void) => {
    callbacks = callbacks.filter(c => c !== cb);
}
const saveSearchHistory = (history: SearchHistory) => {
    const rawJson = JSON.stringify(history)
    localStorage.setItem(HISTORY_STORAGE_KEY, rawJson);
}

export const setPinned = (item: SearchItem, pinned: boolean) => {
    const history = getSearchHistory()
    history.forEach(h => {
        if (h.timestamp == item.timestamp) {
            h.pinned = pinned
        }
    })
    saveSearchHistory(history);
    callbacks.forEach(cb => cb());
}


export const recurseSearchTree = (e?: QueryExpression | QueryOperand): QueryOperand[] => {
    if (!e) {
        return []
    }
    if ("field" in e && e.field) {
        return [{ field: e.field.toString(), term: e.term?.toString(), term_max: e.term_max, term_min: e.term_min }]
    }
    return [...recurseSearchTree(e.left), ...recurseSearchTree(e.right)]
}


export const displayOperandName = ({ field, term, term_max, term_min }: QueryOperand) => {
    if (term) {
        return `${field}=${term}`
    } else if (term_max && term_min) {
        return `${new Date(term_min).toLocaleDateString()} < ${field} < ${new Date(term_max).toLocaleDateString()}`
    } else if (term_max) {
        return `${field} < ${new Date(term_max).toLocaleDateString()}`
    } else if (term_min) {
        return `${field} > ${new Date(term_min).toLocaleDateString()}`
    }
}

export const checkExpressionEquality = (e1: QueryExpression, e2: QueryExpression) => {
    const l1 = recurseSearchTree(e1);
    const l2 = recurseSearchTree(e2);



    l1.sort((a, b) => a.field.localeCompare(b.field))
    l2.sort((a, b) => a.field.localeCompare(b.field))

    // To check equality of expressions, they need to be sorted and converted to strings since 
    // js checks object and array equality by pointer equality
    const str1 = l1.map(displayOperandName).join(",")
    const str2 = l2.map(displayOperandName).join(",")
    return str1 === str2
}


export const appendToSearchHistory = (query: QueryExpression) => {
    if (recurseSearchTree(query).length == 0) {
        // Ignore empty searches
        return;
    }

    const current = getSearchHistory();

    // Check if matches existing search
    const existing = current.find(c => checkExpressionEquality(c.query, query))
    if (existing) {
        // Move existing to top
        const withoutExisting = current.filter(c => c !== existing)
        existing.timestamp = new Date().toISOString();
        saveSearchHistory([existing, ...withoutExisting])
    } else {
        const item: SearchItem = { pinned: false, query, timestamp: new Date().toISOString() };

        let nonPinnedCount = 0

        const newHistory = [item, ...current].filter(c => {
            if (c.pinned) {
                return true
            }
            nonPinnedCount += 1;
            return nonPinnedCount <= MAX_HISTORY_LEN;
        })
        saveSearchHistory(newHistory);
    }

    callbacks.forEach(c => c());
}
