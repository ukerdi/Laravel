import { ImgHTMLAttributes } from 'react';
import logo from '@/images/logo.png'; // Asegúrate de que la ruta sea correcta

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img src={logo} alt="App Logo" {...props} />
    );
}