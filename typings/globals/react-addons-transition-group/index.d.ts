// Generated by typings
// Source: https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/40c60850ad6c8175a62d5ab48c4e016ea5b3dffe/react/react-addons-transition-group.d.ts
declare namespace __React {
    
    interface TransitionGroupProps {
        component?: ReactType;
        childFactory?: (child: ReactElement<any>) => ReactElement<any>;
    }
    
    type TransitionGroup = ComponentClass<TransitionGroupProps>;
    
    namespace __Addons {
        export var TransitionGroup: __React.TransitionGroup;
    }
}

declare module "react-addons-transition-group" {
    var TransitionGroup: __React.TransitionGroup;
    type TransitionGroup = __React.TransitionGroup;
    export = TransitionGroup;
}
