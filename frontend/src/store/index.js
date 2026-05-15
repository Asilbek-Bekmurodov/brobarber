import { configureStore, createSlice } from '@reduxjs/toolkit'

const appSlice = createSlice({
  name: 'app',
  initialState: {
    isMenuOpen: false,
    activeSection: 'home',
  },
  reducers: {
    toggleMenu: (state) => {
      state.isMenuOpen = !state.isMenuOpen
    },
    setActiveSection: (state, action) => {
      state.activeSection = action.payload
    },
  },
})

export const { toggleMenu, setActiveSection } = appSlice.actions

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
})
