import type { MdxPageAndSlug } from "types";
import { getMdxComponent } from "./mdx";

type State = {
  canFetch: boolean;
  page: number;
  scrollPosition: number;
  clientHeight: number;
  containerHeight: number | null;
};

type Action =
  | {
      type: "setOnScroll";
      payload: Pick<State, "scrollPosition" | "clientHeight">;
    }
  | {
      type: "setContainerHeight";
      payload: State["containerHeight"];
    }
  | {
      type: "setCanFetch";
      payload: boolean;
    }
  | {
      type: "setPage";
      payload: number;
    };

export const initialState: State = {
  canFetch: true,
  page: 2,
  scrollPosition: 0,
  clientHeight: 0,
  containerHeight: null,
};

export function tilReducer(state: State, action: Action): State {
  switch (action.type) {
    case "setOnScroll":
      const { payload } = action;
      return {
        ...state,
        clientHeight: payload.clientHeight,
        scrollPosition: payload.scrollPosition,
      };
    case "setContainerHeight": {
      const { payload } = action;
      return {
        ...state,
        containerHeight: payload,
      };
    }
    case "setCanFetch": {
      const { payload } = action;
      return {
        ...state,
        canFetch: payload,
      };
    }
    case "setPage": {
      const { payload } = action;
      return {
        ...state,
        page: payload,
        canFetch: true,
      };
    }
  }
}

export function tilMapper(til: MdxPageAndSlug) {
  let component = getMdxComponent(String(til.code));

  if (til.code) {
    return {
      ...til,
      component,
    };
  }
}
