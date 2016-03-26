import {GigaProps} from "./../GigaGrid";
import * as React from "react";
import {GridSubcomponentProps} from "../TableHeaderCell";
import {GigaStore} from "../../store/GigaStore";
import {SettingsPopover} from "./SettingsPopover";
import "./Toobar.styl";

export interface ToolbarProps extends GridSubcomponentProps<Toolbar> {
    gridProps:GigaProps
    gridStore:GigaStore
}

interface ToolbarState {
    showSettingsPopover: boolean
}

/**
 * The job of the toolbar is to dispatch actions to the flux reduce store. It is free to query the state of the grid
 * and its props
 */
export class Toolbar extends React.Component<ToolbarProps, ToolbarState> {

    constructor(props:ToolbarProps) {
        super(props);
        this.state = {
            showSettingsPopover: false
        }
    }

    dismissSettingsPopover() {
        this.setState({
            showSettingsPopover: false
        });
    }

    render() {
        const {dispatcher} = this.props;
        const state = this.props.gridStore.getState();
        const {columns, subtotalBys} = state;
        return (
            <div className="giga-grid-toolbar">
                <span className="toolbar-item" onClick={()=>this.setState({showSettingsPopover: !this.state.showSettingsPopover})}><i className="fa fa-cogs"/> Settings
                    {
                        this.state.showSettingsPopover ?
                        <SettingsPopover onDismiss={()=>this.dismissSettingsPopover()}
                                         dispatcher={dispatcher} subtotalBys={subtotalBys} columns={columns}/>
                            :
                            ""
                    }
                </span>
            </div>
        );
    }
}