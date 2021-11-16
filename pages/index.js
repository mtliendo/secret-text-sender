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
	Flex,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { API } from 'aws-amplify'

export default function Home() {
	const [phoneData, setPhoneData] = useState([])
	const [budget, setBudget] = useState('')

	useEffect(() => {
		//list sandbox numbers
		const fetchNumberData = async () => {
			const verifiedNumbers = [
				{ number: '+15555555555', alias: 'Michael' },
				{ number: '+14444444444', alias: 'Rene' },
			]

			console.log(verifiedNumbers)
			setPhoneData(verifiedNumbers)
		}

		fetchNumberData()
	}, [])

	const handleAliasChange = async (value, index) => {
		const updatedPhoneData = phoneData.map((phoneItem, phoneItemIndex) => {
			if (index === phoneItemIndex) {
				phoneItem.alias = value
			}
			return phoneItem
		})

		setPhoneData(updatedPhoneData)
	}

	const handleSubmissionClick = async () => {
		// post budget and phone data to the 🌥️
		console.log(phoneData)
	}

	return (
		<Box mt="16">
			<Flex justifyContent="center">
				<InputGroup w="20vw">
					<InputLeftElement
						pointerEvents="none"
						color="gray.600"
						fontSize="1.2em"
						// eslint-disable-next-line react/no-children-prop
						children="$"
					/>
					<Input
						placeholder="Enter budget amount"
						value={budget}
						onChange={(e) => setBudget(e.target.value)}
					/>
				</InputGroup>
			</Flex>

			<Flex justifyContent="center" mt="8%">
				<Table variant="simple" w="80vw">
					<Thead>
						<Tr>
							<Th>Verified Phone Number</Th>
							<Th>Alias</Th>
						</Tr>
					</Thead>
					<Tbody>
						{phoneData.map((phoneItem, index) => (
							<Tr key={phoneItem.number}>
								<Td>{phoneItem.number}</Td>
								<Td>
									<Input
										value={phoneItem.alias}
										onChange={(e) => handleAliasChange(e.target.value, index)}
									/>
								</Td>
							</Tr>
						))}
					</Tbody>
				</Table>
			</Flex>
			<Flex mt="4%" mr="8%" justifyContent="flex-end">
				<Button
					colorScheme="teal"
					variant="solid"
					onClick={handleSubmissionClick}
				>
					Randomize and Send!
				</Button>
			</Flex>
		</Box>
	)
}
