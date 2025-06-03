import { Box } from '@mui/material'
import LogInSignUp from './LogInSignUp'
import justparkLogo from '../assets/JUSTPARK.bmp';

const Landing = () => {

  return (
    <Box sx={{
        width: '100vw',
        height: '100vh',
        padding: 0,
        margin: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: 'center',
        position: "absolute",
        top: 0,
        left: 0,
        gap: "10px",
        background: 'Black',
        overflowY: "hidden"
    }}>
        <img 
            src={justparkLogo}
            alt="JustPark"
            style={{
                width: "720px",
                height: "770px",
                transform: "scale(0.8)",
                // objectFit: "cover",
                WebkitMaskImage: "linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%)",
                maskImage: "linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 1) 80%, rgba(0, 0, 0, 0) 100%)"
            }}
        />
        <LogInSignUp />
    </Box>
  )
}

export default Landing