import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodoAccess {
	constructor(
		private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
		private readonly todosTable = process.env.TODOS_TABLE,
		private readonly todosIndex = process.env.INDEX_NAME
	) {}

	async getAllTodos(userId: string): Promise<TodoItem[]> {
		logger.info('get all todos called')
		const result = await this.docClient
			.query({
				TableName: this.todosTable,
				IndexName: this.todosIndex,
				KeyConditionExpression: 'userId = :userId',
				ExpressionAttributeValues: {
					':userId': userId
				}
			})
			.promise()

			const items = result.Items

			return items as TodoItem[]
	}

	async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
		await this.docClient
			.put({
				TableName: this.todosTable,
				Item: todoItem
			})
			.promise()

			return todoItem as TodoItem
	}

	async updateTodoItem(
		userId: string,
		todoId: string,
		todoUpdate: TodoUpdate
	): Promise<TodoUpdate> {
		let result = await this.docClient
			.update({
				TableName: this.todosTable,
				Key: {
					todoId,
					userId,
				},
				UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
				ExpressionAttributeValues: {
					':name': todoUpdate.name,
					':duedate': todoUpdate.dueDate,
					':done': todoUpdate.done
				},
				ExpressionAttributeNames: {
					'#name': 'name'
				},
				ReturnValues: 'ALL_NEW'
			})
			.promise()
		
		logger.info('todo item updated')
		const updated = result.Attributes as TodoUpdate
		
		return updated as TodoUpdate
	}

	async deleteTodoItem(todoId: string, userId: string): Promise<string> {
		await this.docClient
			.delete({
				TableName: this.todosTable,
				Key: { todoId, userId },
			})
			.promise()

		return todoId as string
	}

	async updateTodoAttachmentUrl(
		todoId: string,
		userId: string,
		attachmentUrl: string
	): Promise<void> {
		await this.docClient
			.update({
				TableName: this.todosTable,
				Key: { todoId, userId },
				UpdateExpression: 'set attachmentUrl = :attachmentUrl',
				ExpressionAttributeValues: {
					':attachmentUrl': attachmentUrl
				}
			})
			.promise()
	}
}