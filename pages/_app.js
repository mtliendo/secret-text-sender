import '../styles/globals.css'
import { ChakraProvider } from '@chakra-ui/react'
import Amplify from 'aws-amplify'
import config from '../aws-exports'

Amplify.configure(config)
function MyApp({ Component, pageProps }) {
	return (
		<ChakraProvider>
			<Component {...pageProps} />
		</ChakraProvider>
	)
}

export default MyApp
