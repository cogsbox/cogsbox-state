export type ClientActivityEvent = {
    stateKey: string;
    path: string[];
    timestamp: number;
    duration?: number;
} & ({
    activityType: 'focus';
    details: {
        cursorPosition?: number;
    };
} | {
    activityType: 'blur';
    details: {
        duration: number;
    };
} | {
    activityType: 'input';
    details: {
        value: any;
        inputLength?: number;
        isComposing?: boolean;
        isPasting?: boolean;
        keystrokeCount?: number;
    };
} | {
    activityType: 'select';
    details: {
        selectionStart: number;
        selectionEnd: number;
        selectedText?: string;
    };
} | {
    activityType: 'hover_enter';
    details: {
        cursorPosition?: number;
    };
} | {
    activityType: 'hover_exit';
    details: {
        duration: number;
    };
} | {
    activityType: 'scroll';
    details: {
        scrollTop: number;
        scrollLeft: number;
    };
} | {
    activityType: 'cursor_move';
    details: {
        cursorPosition: number;
    };
});
export declare const pluginStore: any;
//# sourceMappingURL=pluginStore.d.ts.map