import * as cdk from '@aws-cdk/core'
import * as AmplifyHelpers from '@aws-amplify/cli-extensibility-helper'
import * as sns from '@aws-cdk/aws-sns'

export class cdkStack extends cdk.Stack {
	constructor(
		scope: cdk.Construct,
		id: string,
		props?: cdk.StackProps,
		amplifyResourceProps?: AmplifyHelpers.AmplifyResourceProps
	) {
		super(scope, id, props)
		/* Do not remove - Amplify CLI automatically injects the current deployment environment in this input parameter */
		new cdk.CfnParameter(this, 'env', {
			type: 'String',
			description: 'Current Amplify CLI env name',
		})

		const amplifyProjectInfo = AmplifyHelpers.getProjectInfo()

		// 👇create sns topic
		const snsTopicResourceNamePrefix = amplifyProjectInfo.projectName
		new sns.Topic(this, 'sns-topic', {
			topicName: `${snsTopicResourceNamePrefix}-${cdk.Fn.ref('env')}`,
		})
	}
}
