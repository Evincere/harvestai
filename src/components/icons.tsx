import { Home, Settings, Eye, Cloud, Sun, Loader } from 'react-feather'
import { SVGProps } from 'react'

// Definicion de iconos a ser usados por la aplicacion.

export const HomeIcon = (props: SVGProps<SVGSVGElement>) => <Home {...props} size={20} />
export const SettingsIcon = (props: SVGProps<SVGSVGElement>) => <Settings {...props} size={20} />
export const EyeIcon = (props: SVGProps<SVGSVGElement>) => <Eye {...props} size={20} />
export const Spinner = (props: SVGProps<SVGSVGElement>) => <Loader {...props} size={20} />
export const CloudIcon = (props: SVGProps<SVGSVGElement>) => <Cloud {...props} size={20} />
export const SunIcon = (props: SVGProps<SVGSVGElement>) => <Sun {...props} size={20} />
