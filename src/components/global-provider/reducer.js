function reducer(state, action) {
  const { types } = reducer
  const { type, payload } = action

  switch (type) {
    case types.UPDATE_QUERY: {
      return {
        ...state,
        query: payload,
      }
    }
    case types.VISITED_HOME: {
      return {
        ...state,
        visitedHome: true,
      }
    }
    default: {
      throw new Error(`Unhandled action type: ${type}`)
    }
  }
}

reducer.types = {
  UPDATE_QUERY: "UPDATE_QUERY",
  VISITED_HOME: "VISITED_HOME",
}

export function updateQuery(dispatch, payload) {
  dispatch({ type: reducer.types.UPDATE_QUERY, payload })
}

export function updateVisitedHome(dispatch) {
  dispatch({ type: reducer.types.VISITED_HOME })
}

export default reducer
