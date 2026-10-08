import { createTheme } from '@mui/material/styles'

export const FONT_FAMILY =
  "'SF Pro Rounded', ui-rounded, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"

export const muiTheme = createTheme({
  typography: {
    fontFamily: FONT_FAMILY,
  },
})