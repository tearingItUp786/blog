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
    default: {
      throw new Error(`Unhandled action type: ${type}`)
    }
  }
}

reducer.types = {
  UPDATE_QUERY: "UPDATE_QUERY",
}

export function updateQuery(dispatch, payload) {
  dispatch({ type: reducer.types.UPDATE_QUERY, payload })
}

export default reducer
