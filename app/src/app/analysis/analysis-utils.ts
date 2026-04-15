import { RootState } from "app/root-reducer";
import { useSelector } from "react-redux";
import { ColumnSlice } from "./analysis-query-configs";

export const UseApprovableColumns = () => {

    const columnConfigs = useSelector<RootState>(
        (s) => s.entities.columns
    ) as ColumnSlice;

    return [
        ...new Set(
            Object.values(columnConfigs || {})
                .map((c) => c?.approves_with)
                .reduce((a, b) => a.concat(b), [])
                .concat(
                    Object.values(columnConfigs || {})
                        .filter((c) => c?.approvable)
                        .filter((c) => !c?.computed)
                        .map((c) => c?.field_name)
                )
                .filter((x) => x !== undefined)
        ),
    ]
}