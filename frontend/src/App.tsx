import {
  Button as MuiButton,
  Container,
  CssBaseline,
  Typography,
} from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { Button as AntButton, ConfigProvider } from 'antd'
import { Button } from '@/components/ui/button'
import { FONT_FAMILY, muiTheme } from '@/theme'

function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ConfigProvider theme={{ token: { fontFamily: FONT_FAMILY } }}>
        <Container
          maxWidth="sm"
          sx={{
            minHeight: '100svh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            textAlign: 'center',
          }}
        >
          <Typography variant="h3" component="h1">
            Hello world
          </Typography>
          <Typography variant="body1" color="text.secondary">
            React + Vite · Material UI · shadcn/ui · Ant Design
          </Typography>
          <div className="flex gap-3">
            <MuiButton variant="contained">MUI Button</MuiButton>
            <Button variant="outline">shadcn Button</Button>
            <AntButton type="primary">AntD Button</AntButton>
          </div>
        </Container>
      </ConfigProvider>
    </ThemeProvider>
  )
}

export default App