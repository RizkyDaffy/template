import { Typography } from '@mui/material'
import { authLayoutStyles } from './styles'

/** Full-width bottom footer section: brand • security • version. */
export function AuthFooter() {
  return (
    <footer style={authLayoutStyles.footer}>
      <Typography sx={authLayoutStyles.footerText} component="div">
        <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2L3 5v6c0 5 3.8 9.7 9 11 5.2-1.3 9-6 9-11V5l-9-3zm0 2.18L19 6.58V11c0 4-2.9 8-7 9.16C7.9 19 5 15 5 11V6.58l7-2.4z"
          />
        </svg>
        RIZUU SOFTWARE
        <span style={authLayoutStyles.dot}>•</span>
        <span className="desktop-only">Protected by End-to-End Enterprise Encryption</span>
        <span style={authLayoutStyles.dot} className="desktop-only">•</span>
        Version 1.0.0
      </Typography>
    </footer>
  )
}
