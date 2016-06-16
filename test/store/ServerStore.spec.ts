import {ServerStore} from "../../src/store/ServerStore";
import {Dispatcher} from "flux";
import {GigaAction, GigaActionType} from "../../src/store/GigaStore";
import {SubtotalRow} from "../../src/models/Row";
/**
 * ServerStore
 * TODO make the test better and utilize common functions
 * Created by echen on 6/5/16.
 */

describe("ServerStore", () => {

    // make believe initial data (server format)
    const initialData = [
        {
            data: {"c1": "v1", "c2": 0.0},
            bucketInfo: {colTag: "g1", title: "t1", value: "v1"},
            sectorPath: [{colTag: "g1", title: "t1", value: "v1"}]
        },
        {
            data: {"c1": "vv1", "c2": 0.5},
            bucketInfo: {colTag: "g1", title: "t2", value: "v2"},
            sectorPath: [{colTag: "g1", title: "t2", value: "v2"}]
        }
    ];

    const columnDefs = [
        {colTag: "c1"},
        {colTag: "c2"}
    ];

    it("can correctly deduce the initial state when initialData is given", ()=> {
        const dispatcher:Dispatcher<GigaAction> = new Dispatcher();
        const store:ServerStore = new ServerStore(dispatcher, {
            data: [], initialData: initialData, columnDefs: columnDefs
        });
        dispatcher.dispatch({
            type: GigaActionType.INITIALIZE
        });
        const state = store.getState();
        expect(state.rasterizedRows.length).toBe(2);
        expect(state.rasterizedRows[0].isDetail()).toBe(false);
    });

    it("will mark a row as isLoading", () => {
        // initialize the store
        const dispatcher:Dispatcher<GigaAction> = new Dispatcher();
        const store:ServerStore = new ServerStore(dispatcher, {
            data: [], initialData: initialData, columnDefs: columnDefs
        });
        dispatcher.dispatch({
            type: GigaActionType.INITIALIZE
        });
        const testRow = store.getState().rasterizedRows[0];
        expect((testRow as SubtotalRow).isLoading()).toBe(false);
        dispatcher.dispatch({
            type: GigaActionType.LOADING_MORE_DATA,
            parentRow: testRow
        });
        expect((testRow as SubtotalRow).isLoading()).toBe(true);
    });

});