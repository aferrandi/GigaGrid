import {Tree} from "./TreeBuilder";
import {Row} from "../models/Row";
import {ColumnFormat} from "../models/ColumnLike";
import {SubtotalRow} from "../models/Row";

export enum SortDirection {
    ASC, DESC
}

export interface SortBy {
    colTag:string;
    format: ColumnFormat;
    customSortFn?:(a:Row, b:Row)=>number; // UDF for sorting
    direction: SortDirection
}

export class SortFactory {


    public static sortTree(tree:Tree, sortBys:SortBy[]):Tree {
        // FIXME the damn tree is so mutable ... but I can't think of a good way to manipulate trees that are immutable
        var sortFn = SortFactory.createCompositeSortFn(sortBys);
        SortFactory.recursivelyExecuteSort(tree.getRoot(), sortFn);
        return tree;
    }

    private static recursivelyExecuteSort(rootRow:SubtotalRow, fn:(a:Row, b:Row)=>number):void {
        if (rootRow.getNumChildren() !== 0) {
            rootRow.getChildren().sort(fn);
            rootRow.getChildren().forEach((child)=> {
                SortFactory.recursivelyExecuteSort(child, fn);
            })
        } else
            rootRow.detailRows.sort(fn);
    }

    private static createCompositeSortFn(sortBys:SortBy[]):(a:Row, b:Row)=>number {
        // iterate through the sortBys in order, create a sort function for each sort by
        // apply that sortBy function to the data, use the next sortBy as tie breaker
        return function (a:Row, b:Row):number {
            let i = 0;
            var sortFn = SortFactory.buildLexicalSortFn(sortBys[i]);
            var result = sortFn(a, b);
            while (result === 0 && i < (sortBys.length - 1)) {
                i++;
                sortFn = SortFactory.resolveSortFn(sortBys[i]);
                result = sortFn(a, b);
            }
            return result;
        };
    }

    private static resolveSortFn(sortBy:SortBy):(a:Row, b:Row)=>number {
        // todo implement and resolve other sort fn
        if (sortBy.customSortFn)
            return sortBy.customSortFn;
        else
            return SortFactory.buildLexicalSortFn(sortBy);
    }

    private static buildLexicalSortFn(sortBy:SortBy):(a:Row, b:Row)=>number {

        return function (a:Row, b:Row):number {

            const valA = a.data()[sortBy.colTag];
            const valB = b.data()[sortBy.colTag];

            var result = 0;

            if (!valA || !valB) {
                if (valA)
                    return -1; // b is greater
                else if (valB)
                    return 1; // a is greater
            }
            else {
                if (valA > valB)
                    result = 1; // a is greater
                else if (valB > valA)
                    result = -1; // b is greater
            }

            if (sortBy.direction === SortDirection.DESC)
                result = result * -1;

            return result;
        };

    }
}