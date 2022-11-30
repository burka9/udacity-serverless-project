import { TodoAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

// TODO: Implement businessLogic
const logger = createLogger('TodoAccess')
const attachmentUtils = new AttachmentUtils()
const todoAccess = new TodoAccess()

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
	logger.info('get todos for user function called')
	return todoAccess.getAllTodos(userId)
}

export async function createTodo(
	newTodo: CreateTodoRequest,
	userId: string
): Promise<TodoItem> {
	logger.info('create todo called')
	const todoId = uuid.v4()
	const createdAt = new Date().toISOString()
	const s3AttachmentUrl = attachmentUtils.getAttachmentUrl(todoId)

	const newItem = {
		userId,
		todoId,
		createdAt,
		done: false,
		attachmentUrl: s3AttachmentUrl,
		...newTodo
	}

	return await todoAccess.createTodoItem(newItem)
}


export async function updateTodo(
	userId: string,
	todoId: string,
	todoUpdate: UpdateTodoRequest,
): Promise<UpdateTodoRequest> {
	logger.info('update todo function called')
	return await todoAccess.updateTodoItem(todoId, userId, todoUpdate)
}

export async function deleteTodo(
	userId: string,
	todoId: string,
): Promise<string> { 
	return todoAccess.deleteTodoItem(todoId, userId)
}

export async function createAttachmentPresignedUrl(
	todoId: string,
	userId: string,
): Promise<string> {
	logger.info('create attachment url called by ', userId, todoId)
	return attachmentUtils.getUploadUrl(todoId)
}