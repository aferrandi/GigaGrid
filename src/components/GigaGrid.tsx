import * as React from 'react';
import * as Flux from 'flux';
import * as FluxUtils from 'flux/utils';
import * as Immutable from 'immutable';
import ReactElement = __React.ReactElement;
import {DetailTableRow,SubtotalTableRow} from "./TableRow";
import {SubtotalBy} from "../models/ColumnLike";
import {ColumnDef} from "../models/ColumnLike";
import {ColumnFormat} from "../models/ColumnLike";
import {Row} from "../models/Row";
import {TableRowColumnDef} from "../models/ColumnLike";
import {SubtotalRow} from "../models/Row";
import {DetailRow} from "../models/Row";
import {TableHeader} from "./TableHeader";
import {TreeRasterizer} from "../static/TreeRasterizer";
import {Tree} from "../static/TreeBuilder";
import {GigaStore} from "../store/GigaStore";
import ReduceStore = FluxUtils.ReduceStore;
import Dispatcher = Flux.Dispatcher;
import {GigaAction} from "../store/GigaStore";
import {SortBy} from "../models/ColumnLike";

export interface GigaProps extends React.Props<GigaGrid> {
    initialSubtotalBys?:SubtotalBy[]
    initialSortBys?:SortBy[]
    data:any[]
    columnDefs:ColumnDef[]
}

export interface GigaState {
    tree:Tree
    subtotalBys:SubtotalBy[]
    sortBys:SortBy[]
}

/**
 * The root component of this React library. assembles raw data into `Row` objects which are then translated into their
 * virtual DOM representation
 *
 * The bulk of the table state is stored in `tree`, which contains subtotal and detail rows
 * Rows can be hidden if filtered out or sorted among other things, subtotal rows can be collapsed etc
 * mutations to the state of table from user initiated actions can be thought of as mutates on the `tree`
 *
 * IMPORTANT: GigaGrid the component does not actually mutate its own state nor give its children the ability
 * to mutate its state. State mutation is managed entirely by the GigaStore flux Store. Events generated by the
 * children of this component are emitted to a central dispatcher and are dispatched to the GigaStore
 *
 * Please DO NOT pass a reference of this component to its children nor call setState() in the component
 */

export class GigaGrid extends React.Component<GigaProps, GigaState> {

    private store:GigaStore;
    private dispatcher:Dispatcher<GigaAction>;

    constructor(props:GigaProps) {
        super(props);
        this.dispatcher = new Dispatcher<GigaAction>();
        this.store = new GigaStore(this.dispatcher, props);
        this.state = this.store.getState();
        this.store.addListener(()=> {
            this.setState(this.store.getState());
        });
    }

    render() {
        const tableRowColumnDefs:TableRowColumnDef[] = this.props.columnDefs.map(cd => {

            const tableRowCD:TableRowColumnDef = {
                colTag: cd.colTag,
                title: cd.title,
                aggregationMethod: cd.aggregationMethod,
                format: cd.format,
                width: "auto"
            };

            // determine if there is an existing SortBy for this column
            var sortBy = Immutable.List<SortBy>(this.state.sortBys).find((s)=>s.colTag === cd.colTag);
            if (sortBy) {
                tableRowCD.sortDirection = sortBy.direction;
                tableRowCD.customSortFn = sortBy.customSortFn;
            }

            return tableRowCD;
        });

        return (
            <div className="giga-grid">
                <table>
                    {this.renderColumnHeaders(tableRowColumnDefs)}
                    <tbody>
                        {this.renderTableRows(tableRowColumnDefs)}
                    </tbody>
                </table>
            </div>);
    }

    renderColumnHeaders(tableRowColumnDefs:TableRowColumnDef[]):ReactElement<{}> {
        const ths = tableRowColumnDefs.map((colDef:TableRowColumnDef, i:number)=> {
            return <TableHeader tableColumnDef={colDef} key={i} isFirstColumn={i===0}
                                isLastColumn={i===tableRowColumnDefs.length-1} dispatcher={this.dispatcher}/>
        });
        return (
            <thead>
                <tr>{ths}</tr>
            </thead>
        );
    }

    renderTableRows(tableRowColumnDefs:TableRowColumnDef[]):ReactElement<{}>[] {
        // TODO consider whether this should be part of GigaStore somehow ... we don't want to always re-rasterize
        const rows:Row[] = TreeRasterizer.rasterize(this.state.tree);
        // convert plain ColumnDef to TableRowColumnDef which has additional properties
        return rows.map((row:Row, i:number)=> {
            if (row.isDetail())
                return <DetailTableRow key={i} tableRowColumnDefs={tableRowColumnDefs} row={row as DetailRow}
                                       dispatcher={this.dispatcher}/>;
            else
                return <SubtotalTableRow key={i} tableRowColumnDefs={tableRowColumnDefs} row={row as SubtotalRow}
                                         dispatcher={this.dispatcher}/>
        });
    }
}
