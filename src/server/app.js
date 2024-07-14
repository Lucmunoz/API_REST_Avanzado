import express from 'express' // importamos express
import cors from 'cors'
import { logServer } from './middleware/logServer.js'

import { findAll, findById, create, updateById, deleteById, findAllFiltered } from './models/db_models.js'

const app = express() // Ejecutamos express y su ejecución la almacenamos en una constante
const PORT = process.env.PORT ?? 3000 // llamamos a la variable PORT desde nuestras variables de entorno y si esta no está creada, por defecto define el puerto 3000
const PATH = process.env.DB_DATABASE

app.use(cors())
app.use(express.json())

// CONSTRUCTOR HATEOAS
const generateHATEOAS = (arreglo) => {
  let stockTotal = 0
  const results = arreglo.map((objeto) => {
    stockTotal = stockTotal + objeto.stock
    return {
      nombre: objeto.nombre,
      href: `localhost:3000/${PATH}/${objeto.id}`
    }
  })
  const totalJoyas = arreglo.length
  const HATEOAS = { totalJoyas, stockTotal, results }
  return HATEOAS
}

/*  A continuación se presentan las rutas solicitadas en el desafío. Las respectivas consultas trabajan de forma parametrizada a fin de eviar el SQL injection.
    Por consola, se muestran reportes haciendo uso de un middleware definido como logServer.js (src/server/middleware/logServer.js)
*/

/* RESPUESTA PUNTO 1

  Se define ruta GET/joyas la que devuelve la estructura HATEOAS de todas las joyas almacenadas en la base de datos. Esta ruta es capaz de aceptar query string.
  la cual está configurada para aceptar los siguientes parámetros:
  - "limits": Su valor permite limitar la cantidad de resultados. Por defecto, limita los resultados a 5.
  - "page": Su valor define el numero de la pagina a mostrar para los resultados obtenidos. Por defecto, siempre mostrará los primeros 5 resultados (pagina 1)
  - "order_by"= Su valor define el campo y riterio por el cual se ordenarán los datos. Ejemplo: &order_by=stock_ASC ordenará los datos tomando en cuenta el stock de forma ascendente

  La ruta hace uso de la función generateHATEOAS la cual permite expresar los resultados siguiendo la estructura que solicita el desafío. */

app.get(`/${PATH}`, logServer, async (req, res) => {
  try {
    const response = await findAll(req.query)
    const data = generateHATEOAS(response)
    res.status(200).json({ status: true, message: data })
  } catch (error) {
    res.status(500).json({ status: false, message: 'Ha ocurrido un error!!', Data: error })
  }
})

/*  RESPUESTA PUNTO 2

  Se define la ruta GET/JOyas/filtros la cual está configurada para receibir los siguientes parámetros en una query:
  - precio_min: Su valor permite establecer un precio mínimo a fin de filtrar resultados y mostrar solo aquellos cuyo precio está por sobre el precio definido.
  - precio_max: Su valor permite establecer un precio máximo a fin de filtrar resultados y mostrar solo aquellos cuyo precio está por debajo del precio definido.
  - stock_min:  Su valor permite establecer un stock mínimo a fin de filtrar resultados y mostrar solo aquellos cuyo precio está por sobre el stock definido.
  - stock_max:  Su valor permite establecer un stock máximo a fin de filtrar resultados y mostrar solo aquellos cuyo precio está por debajo del stock máximo definido.
  - categoria:  Su valor permite establecer un cirterio de filtrado para el campo categoría a fin de mostrar solo los resultados que coincidan con el valor ingresado.
  - metal:      Su valor permite establecer un cirterio de filtrado para el campo metal a fin de mostrar solo los resultados que coincidan con el valor ingresado.

  Esta ruta muestra los objetos completos. No se hace uso de la función generateHATEOAS.
 */
app.get(`/${PATH}/filtros`, logServer, async (req, res) => {
  try {
    const response = await findAllFiltered(req.query)
    res.status(200).json({ status: true, message: response })
  } catch (error) {
    res.status(500).json({ status: false, message: 'Ha ocurrido un error!!', Data: error })
  }
})

//* ***************************************************
// OTRAS RUTAS DE PRUEBA - NO SOLICITADAS EN EL DESAFÍO.
//* ***************************************************

// Ruta para solicitar datos de la base de datos asociados a un determinado ID
app.get(`/${PATH}/:id`, logServer, async (req, res) => {
  try {
    const response = await findById(req.params.id)
    // La siguiente validación debiera estar en el front. Se deja en el backend para pruebas
    if (response.length === 0) {
      res.status(500).json({ status: false, message: 'Ha ocurrido un error!!', Data: 'ID no existe' })
    }
    res.status(200).json({ status: true, message: response })
  } catch (error) {
    res.status(500).json({ status: false, message: 'Ha ocurrido un error!!', Data: error })
  }
})

/*  Ruta para ingresar nuevos datos a la tabla.
    Debo entregar como argumento al metodo create (importado) los encabezados de cada columna definida en nuestra tabla. Ver archivo DDl y DML.
    Estos datos vienen en el body del request. Por tanto, los desestructuro y envío como argumentos en el create. */
app.post(`/${PATH}`, logServer, async (req, res) => {
  try {
    const { nombre, categoria, metal, precio, stock } = req.body

    const response = await create({ nombre, categoria, metal, precio, stock })
    res.status(201).json({ status: true, message: response })
  } catch (error) {
    res.status(500).json({ status: false, message: 'Ha ocurrido un error!!', Data: error })
  }
})

// Ruta para actualizar un dato
app.put(`/${PATH}/:id`, logServer, async (req, res) => {
  try {
    const { nombre, categoria, metal, precio, stock } = req.body
    const { id } = req.params
    const response = await updateById(id, { nombre, categoria, metal, precio, stock })
    res.status(201).json({ status: true, message: response })
  } catch (error) {
    res.status(500).json({ status: false, message: 'Ha ocurrido un error!!', Data: error })
  }
})

// Ruta para eliminar datos
app.delete(`/${PATH}/:id`, logServer, async (req, res) => {
  try {
    const { id } = req.params
    const response = await deleteById(id)
    res.status(201).json({ status: true, message: response })
  } catch (error) {
    res.status(500).json({ status: false, message: 'Ha ocurrido un error!!', Data: error })
  }
})

// Ruta para consultar estado de la API
app.get('/health', logServer, (_, res) => res.status(200).json({ status: true, message: 'Estas consultando la API de la joyería My Precious SPA' }))

app.all('*', (_, res) => res.status(404).json({ status: false, message: 'El recurso que consultas no está disponible' }))// ruta por defecto. Ante cualquier ruta que no exista, el servidor debe responder algo.

app.listen(PORT, () => { console.log('server Up... Listening') })
export default app
