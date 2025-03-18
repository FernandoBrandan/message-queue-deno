import { MongoClient, ObjectId } from "https://deno.land/x/mongo@v0.34.0/mod.ts"

export const checkIfItemsExist = async (item: number, quantity: number) => {
  const client = new MongoClient()
  try {
    await client.connect("mongodb://root:gateway@localhost:3100/library?authSource=admin")
  } catch (err) {
    console.log("Error de conexión a la base de datos - MessageQueue - file fn.ts", err);
    return { err: true, message: 'Error de conexión a la base de datos' }
  }
  const data = await client.database().collection("books").findOne({ serie: item })
  if (!data) return { error: true, message: `El producto con ID ${item} no existe` }
  const id_bookDetail: string = data.bookDetail.toString()
  const dataBookDetail = await client.database().collection("bookdetails").findOne({ _id: new ObjectId(id_bookDetail.toString()) })
  if (!dataBookDetail) return { error: true, message: `No se encontró información de stock para el producto con ID ${item}` }
  if (dataBookDetail.stock === 0) return { error: true, message: `No hay stock para el producto con ID ${item}. Se solicitaron ${quantity} unidades.` }
  if (dataBookDetail.stock < quantity) return { error: true, message: `No hay suficiente stock para el producto con ID ${item}. Se solicitaron ${quantity} unidades, pero solo hay ${dataBookDetail.stock} disponibles.` }

  return { error: false, message: 'Todos los productos existen y tienen stock suficiente' }
}

export const updateStock = async (item: number, quantity: number) => {
  const client = new MongoClient()
  try {
    await client.connect("mongodb://root:gateway@localhost:3100/library?authSource=admin")
  } catch (err) {
    console.error("Error connecting to MongoDB", err);
    throw err;
  }
  const data = await client.database().collection("books").findOne({ serie: item })
  if (!data) return { error: true, message: `Libro no encontrado. ${item}.` }

  const id_bookDetail: string = data.bookDetail.toString()
  const result = await client.database().collection("bookdetails").findAndModify(
    { _id: new ObjectId(id_bookDetail) }, // Filtro
    { update: { $inc: { stock: -quantity } } }, // Modificación 
  );
  if (!result) return { error: true, message: `Detalle no encontrado. ${item}.` }

  console.log(result);
  // const updatedStock = result.stock
  // if (Number(updatedStock) < 0) errors.push('No hay suficiente stock.')

  return { error: false, message: 'stock updated successfully' }
}