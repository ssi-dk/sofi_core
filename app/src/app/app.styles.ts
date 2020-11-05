import { css } from "@emotion/core";

export const flex = css({
    display: 'flex',
    flex: '1 1 1',
    alignContent: 'center',
    alignSelf: 'center',
    flexDirection: 'column',
    height: '100vh'
});

export const reset = css({
    body: {
        margin: 0,
        padding: 0,
        fontFamily: 'sans-serif'
    },
    "*": {
        boxSizing: 'border-box'
    }
});