/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const AWS = require('aws-sdk')
const sns = new AWS.SNS()

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*')
	res.header('Access-Control-Allow-Headers', '*')
	next()
})

app.use(async (req, res, next) => {
	req.awsAccountId = req.apiGateway.context.invokedFunctionArn.split(':')[4]
	req.awsRegion = process.env.AWS_REGION
	req.amplifyEnv = process.env.ENV
	next()
})

app.get('/secret-text/list-numbers', async function (req, res) {
	// Add your code here
	console.log('the apigw context', JSON.stringify(req.apiGateway.context))
	console.log('the apigw EVENT', JSON.stringify(req.apiGateway.event))
	const data = await sns.listSMSSandboxPhoneNumbers().promise()
	console.log('the data', data)
	const verifiedNumbers = data.PhoneNumbers.filter(
		(dataItem) => dataItem.Status === 'Verified'
	).map((verifiedNumber) => ({ number: verifiedNumber.PhoneNumber, alias: '' }))

	res.json(verifiedNumbers)
})

app.post('/secret-text/publish-numbers', async function (req, res) {
	const budget = req.body.budget || '15.00'
	const numberData = req.body.numberData

	//shuffle the array: https://lodash.com/docs/4.17.15#shuffle
	//subscribe everybody if not already
	for (numberItem of numberData) {
		await sns
			.subscribe({
				Endpoint: numberItem.number,
				Protocol: 'sms',
				TopicArn: `arn:aws:sns:${req.awsRegion}:${req.awsAccountId}:secrettextsender-${req.amplifyEnv}`,
				Attributes: {
					FilterPolicy: JSON.stringify({
						sms: [numberItem.number],
					}),
				},
			})
			.promise()
	}

	for (let i = 0; i < numberData.length; i++) {
		const publishParams = {
			TopicArn: `arn:aws:sns:${req.awsRegion}:${req.awsAccountId}:secrettextsender-${req.amplifyEnv}`,
			MessageAttributes: {
				sms: {
					DataType: 'String.Array',
					StringValue: JSON.stringify([numberData[i].number]),
				},
			},
		}
		//if you're the last person, you get the first person
		if (i === numberData.length - 1) {
			await sns
				.publish({
					...publishParams,
					Message: `Your person is ${numberData[0].alias}. Your budget is $${budget}.`,
				})
				.promise()
		} else {
			//everyone else gets the next person.
			await sns
				.publish({
					...publishParams,
					Message: `Your person is ${
						numberData[i + 1].alias
					}. Your budget is $${budget}.`,
				})
				.promise()
		}
	}
	res.json({ success: 'post call succeed!', url: req.url, body: req.body })
})

app.listen(3000, function () {
	console.log('App started')
})

module.exports = app
