import db from '../database/db_connects.js'
import format from 'pg-format'
const DB_TABLE = process.env.DB_TABLE



// Punto 1 desafío
export const findAll = async ({ limits = 5, order_by = 'id_ASC', page = 1 }) => {
  const query = `SELECT * FROM ${DB_TABLE}`
  const offset = page > 0 ? (page - 1) * limits : 0
  const [column, sort] = order_by.split('_')
  const formatedQuery = format(`${query} ORDER BY %s %s LIMIT %s OFFSET %s;`, column, sort, limits, offset)
  return await db(formatedQuery, [])
}

// Punto 2 desafío
export const findAllFiltered = async ({ limits = 5, order_by = 'id_ASC', page = 1, precio_min, precio_max, stock_min, stock_max, categoria, metal }) => {
  let query = `SELECT * FROM ${DB_TABLE}`
  const filtros = []
  const valores = []

  if (precio_max) {
    valores.push(precio_max)
    filtros.push(`precio< $${valores.length}`)
  }
  if (precio_min) {
    valores.push(precio_min)
    filtros.push(`precio>= $${valores.length}`)
  }
  if (stock_min) {
    valores.push(stock_min)
    filtros.push(`stock< $${valores.length}`)
  }
  if (stock_max) {
    valores.push(stock_max)
    filtros.push(`stock<$${valores.length}`)
  }
  if (categoria) {
    valores.push(categoria)
    filtros.push(`categoria =$${valores.length}`)
  }
  if (metal) {
    valores.push(metal)
    filtros.push(`metal =$${valores.length}`)
  }

  // Evalúo si la query viene con algun filtro
  if (filtros.length > 0) {
    query += ` WHERE ${filtros.join(' AND ')}`
  }

  const offset = page > 0 ? (page - 1) * limits : 0
  const [column, sort] = order_by.split('_')
  const formatedQuery = format(`${query} ORDER BY %s %s LIMIT %s OFFSET %s;`, column, sort, limits, offset)
  return await db(formatedQuery, valores)
}

//* ***************************************************
// OTRAS RUTAS DE PRUEBA - NO SOLICITADAS EN EL DESAFÍO.
//* ***************************************************

// Defino metodo para mostrar el registro de un correspondiente id
export const findById = async (id) => await db(`SELECT * FROM ${DB_TABLE} WHERE id =$1;`, [id])

// Defino metodo para crear un nuevo registro. Debo entregar como argumento los encabezados de cada columna definida en nuestra tabla. Ver archivo DDl y DML.
export const create = async ({ nombre, categoria, metal, precio, stock }) => await db(`INSERT INTO ${DB_TABLE} (id, nombre, categoria, metal, precio, stock) VALUES (DEFAULT,$1, $2, $3, $4, $5) RETURNING *;`, [nombre, categoria, metal, precio, stock])

export const updateById = async (id, { nombre, categoria, metal, precio, stock }) => await db(`UPDATE ${DB_TABLE} SET nombre=$2, categoria=$3, metal=$4, precio=$5, stock=$6 WHERE id=$1 RETURNING *;`, [id, nombre, categoria, metal, precio, stock])

export const deleteById = async (id) => await db(`DELETE FROM ${DB_TABLE} WHERE id=$1 RETURNING *;`, [id])
