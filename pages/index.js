import {
	Box,
	Button,
	Input,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	InputGroup,
	InputLeftElement,
} from '@chakra-ui/react'
import { useState } from 'react'

export default function Home() {
	const [phoneData, setPhoneData] = useState([
		{ number: '+15555555555', alias: 'Dad' },
		{ number: '+14444444444', alias: 'Sister' },
	])

	return (
		<Box>
			<Box>
				<InputGroup>
					<InputLeftElement
						pointerEvents="none"
						color="gray.600"
						fontSize="1.2em"
						// eslint-disable-next-line react/no-children-prop
						children="$"
					/>
					<Input placeholder="Enter budget amount" />
				</InputGroup>
			</Box>

			<Box>
				<Table variant="simple">
					<Thead>
						<Tr>
							<Th>Verified Phone Number</Th>
							<Th>Alias</Th>
						</Tr>
					</Thead>
					<Tbody>
						{phoneData.map((phoneItem) => (
							<Tr key={phoneItem.number}>
								<Td>{phoneItem.number}</Td>
								<Td>{phoneItem.alias}</Td>
							</Tr>
						))}
					</Tbody>
				</Table>
			</Box>
			<Box>
				<Button colorScheme="teal" variant="solid">
					Randomize and Send!
				</Button>
			</Box>
		</Box>
	)
}
