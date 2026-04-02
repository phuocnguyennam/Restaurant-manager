import { initializeApp } from 'firebase/app'
import {
	getDatabase,
	ref,
	get,
	set,
	update,
	remove,
	query,
	orderByChild,
	equalTo,
} from 'firebase/database'
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

function mapObjectToArray(obj) {
	if (!obj) return []
	return Object.keys(obj).map((k) => {
		const parsedId = Number(k)
		return Object.assign({ id: Number.isNaN(parsedId) ? k : parsedId }, obj[k])
	})
}

async function getCollection(name) {
	const snap = await get(ref(db, name))
	if (!snap.exists()) return []
	return mapObjectToArray(snap.val())
}

async function getById(name, id) {
	const snap = await get(ref(db, `${name}/${id}`))
	return snap.exists() ? snap.val() : null
}

async function getNextId(name) {
	const items = await getCollection(name)
	const max = items.reduce((m, it) => (it && typeof it.id === 'number' && it.id > m ? it.id : m), 0)
	return max + 1
}

async function createItem(name, data) {
	let id = data && data.id
	if (id === undefined || id === null) {
		id = await getNextId(name)
	}
	const body = Object.assign({}, data, { id })
	await set(ref(db, `${name}/${id}`), body)
	return Object.assign({ id }, body)
}

async function updateItem(name, id, data) {
	await update(ref(db, `${name}/${id}`), data)
	const snap = await get(ref(db, `${name}/${id}`))
	return snap.exists() ? Object.assign({ id }, snap.val()) : null
}

async function deleteItem(name, id) {
	await remove(ref(db, `${name}/${id}`))
	return true
}

// nested helpers
async function setNested(name, keys = [], data) {
	const path = [name].concat(keys).join('/')
	await set(ref(db, path), data)
	return data
}

async function getNested(name, keys = []) {
	const path = [name].concat(keys).join('/')
	const snap = await get(ref(db, path))
	return snap.exists() ? snap.val() : null
}

// Role
export const getRoles = () => getCollection('Role')
export const getRole = (id) => getById('Role', id)
export const addRole = (data) => createItem('Role', data)
export const updateRole = (id, data) => updateItem('Role', id, data)
export const deleteRole = (id) => deleteItem('Role', id)

// User
export const getUsers = () => getCollection('User')
export const getUser = (id) => getById('User', id)
export const addUser = (data) => createItem('User', data)
export const updateUser = (id, data) => updateItem('User', id, data)
export const deleteUser = (id) => deleteItem('User', id)

// Find user by username (field `name`) using Realtime DB query
export async function getUserByUsername(username) {
	if (username === undefined || username === null) return null
	const q = query(ref(db, 'User'), orderByChild('name'), equalTo(username))
	const snap = await get(q)
	if (!snap.exists()) return null
	const val = snap.val()
	const arr = mapObjectToArray(val)
	return arr.length ? arr[0] : null
}

// Category
export const getCategories = () => getCollection('Category')
export const getCategory = (id) => getById('Category', id)
export const addCategory = (data) => createItem('Category', data)
export const updateCategory = (id, data) => updateItem('Category', id, data)
export const deleteCategory = (id) => deleteItem('Category', id)

// Product
export const getProducts = () => getCollection('Product')
export const getProduct = (id) => getById('Product', id)
export const addProduct = (data) => createItem('Product', data)
export const updateProduct = (id, data) => updateItem('Product', id, data)
export const deleteProduct = (id) => deleteItem('Product', id)

// Ingredient
export const getIngredients = () => getCollection('Ingredient')
export const getIngredient = (id) => getById('Ingredient', id)
export const addIngredient = (data) => createItem('Ingredient', data)
export const updateIngredient = (id, data) => updateItem('Ingredient', id, data)
export const deleteIngredient = (id) => deleteItem('Ingredient', id)

// Recipe (nested by product_id -> ingredient_id)
export const setRecipe = (product_id, ingredient_id, data) => setNested('Recipe', [product_id, ingredient_id], data)
export const getRecipesForProduct = async (product_id) => {
	const q = query(ref(db, 'Recipe'), orderByChild('product_id'), equalTo(product_id))
	const snap = await get(q)
	if (!snap.exists()) return []
	return mapObjectToArray(snap.val())
}
export const getRecipe = (product_id, ingredient_id) => getNested('Recipe', [product_id, ingredient_id])
export const deleteRecipe = (product_id, ingredient_id) => remove(ref(db, `Recipe/${product_id}/${ingredient_id}`))

// Area
export const getAreas = () => getCollection('Area')
export const getArea = (id) => getById('Area', id)
export const addArea = (data) => createItem('Area', data)
export const updateArea = (id, data) => updateItem('Area', id, data)
export const deleteArea = (id) => deleteItem('Area', id)

// Table (seating)
export const getTables = () => getCollection('Table')
export const getTable = (id) => getById('Table', id)
export const addTable = (data) => createItem('Table', data)
export const updateTable = (id, data) => updateItem('Table', id, data)
export const deleteTable = (id) => deleteItem('Table', id)

// Reservation
export const getReservations = () => getCollection('Reservation')
export const getReservation = (id) => getById('Reservation', id)
export const addReservation = (data) => createItem('Reservation', data)
export const updateReservation = (id, data) => updateItem('Reservation', id, data)
export const deleteReservation = (id) => deleteItem('Reservation', id)

// Order
export const getOrders = () => getCollection('Order')
export const getOrder = (id) => getById('Order', id)
export const addOrder = (data) => createItem('Order', data)
export const updateOrder = (id, data) => updateItem('Order', id, data)
export const deleteOrder = (id) => deleteItem('Order', id)

// OrderDetail (nested by order_id -> product_id)
export const setOrderDetail = (order_id, product_id, data) => setNested('OrderDetail', [order_id, product_id], data)
export const getOrderDetailsForOrder = async (order_id) => {
	const data = await getNested('OrderDetail', [order_id])
	if (!data) return []
	return mapObjectToArray(data)
}
export const getOrderDetail = (order_id, product_id) => getNested('OrderDetail', [order_id, product_id])
export const deleteOrderDetail = (order_id, product_id) => remove(ref(db, `OrderDetail/${order_id}/${product_id}`))

// Invoice
export const getInvoices = () => getCollection('Invoice')
export const getInvoice = (id) => getById('Invoice', id)
export const addInvoice = (data) => createItem('Invoice', data)
export const updateInvoice = (id, data) => updateItem('Invoice', id, data)
export const deleteInvoice = (id) => deleteItem('Invoice', id)

// Generic exports
export default {
	// Roles
	getRoles,
	getRole,
	addRole,
	updateRole,
	deleteRole,
	// Users
	getUsers,
	getUser,
	addUser,
	updateUser,
	deleteUser,
	// Categories
	getCategories,
	getCategory,
	addCategory,
	updateCategory,
	deleteCategory,
	// Products
	getProducts,
	getProduct,
	addProduct,
	updateProduct,
	deleteProduct,
	// Ingredients
	getIngredients,
	getIngredient,
	addIngredient,
	updateIngredient,
	deleteIngredient,
	// Recipes
	setRecipe,
	getRecipe,
	getRecipesForProduct,
	deleteRecipe,
	// Tables
	getTables,
	getTable,
	addTable,
	updateTable,
	deleteTable,
	// Reservations
	getReservations,
	getReservation,
	addReservation,
	updateReservation,
	deleteReservation,
	// Orders
	getOrders,
	getOrder,
	addOrder,
	updateOrder,
	deleteOrder,
	// OrderDetails
	setOrderDetail,
	getOrderDetail,
	getOrderDetailsForOrder,
	deleteOrderDetail,
	// Invoices
	getInvoices,
	getInvoice,
	addInvoice,
	updateInvoice,
	deleteInvoice,
};
