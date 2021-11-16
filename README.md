# Amplify Secret Texter

1. amplify init

2. amplify add api

- secrettextapi
- /secret-text
- secrettextfunc
- serverless
- not protected

3. https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SNS.html

Inside of `app.js`

```js
//add imports
const AWS = require('aws-sdk')
const sns = new AWS.SNS()
```

```js
// add route
app.get('/secret-text/list-numbers', async function (req, res) {
	const data = await sns.listSMSSandboxPhoneNumbers().promise()

	const verifiedNumbers = data.PhoneNumbers.filter(
		(dataItem) => dataItem.Status === 'Verified'
	).map((verifiedNumber) => ({ number: verifiedNumber.PhoneNumber, alias: '' }))

	res.json(verifiedNumbers)
})
```

update custom `policy.json`

```js
{
		"Action": ["SNS:ListSMSSandboxPhoneNumbers"],
		"Resource": ["arn:aws:sns:*:*:*"]
}
```

`amplify push -y`

Test in ThunderClient

## update frontend

1. configure Amplify in `_app.js`
2. udpate the `index.js file`

```jsx
import { API } from 'aws-amplify'

useEffect(() => {
	//list sandbox numbers
	const fetchNumberData = async () => {
		const verifiedNumbers = await API.get(
			'secrettextapi',
			'/secret-text/list-numbers'
		).catch((e) => console(e))

		console.log(verifiedNumbers)
		setPhoneData(verifiedNumbers)
	}

	fetchNumberData()
}, [])
```

Test to make sure I get the numbers 🎉

## Adding the rest

Update the frontend code with what we're trying to do

```js
const handleSubmissionClick = async () => {
	await API.post('secrettextapi', '/secret-text/publish-numbers', {
		body: {
			budget,
			numberData: phoneData,
		},
	})
}
```

## Create the SNS topic

`amplify add custom`

stack name: secretTextSNSTopic

```js
// 👇create sns topic
const snsTopicResourceNamePrefix = amplifyProjectInfo.projectName
new sns.Topic(this, 'sns-topic', {
	topicName: `${snsTopicResourceNamePrefix}-${cdk.Fn.ref('env')}`,
})
```

```js
// add env vars as middleware
app.use(async (req, res, next) => {
	req.awsAccountId = req.apiGateway.context.invokedFunctionArn.split(':')[4]
	req.awsRegion = process.env.AWS_REGION
	req.amplifyEnv = process.env.ENV
	next()
})
```

## scaffold the route

```js
app.post('/secret-text/publish-numbers', async function (req, res) {
  //pull off the data sent from the frontend
  const budget = req.body.budget || '15.00'
	const numberData = req.body.numberData

  res.json({ success: 'post call succeed!', url: req.url, body: req.body })
}
```

```js
// iterate through the numberData and subscribe everyone
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
```

## publish the message

```js
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
```

## update the policy!

```js
{
		"Action": ["SNS:Publish", "SNS:Subscribe"],
		"Resource": ["arn:aws:sns:*:*:secrettextsender-${env}"]
}
```
