// https://deno.land/x/amqp@v0.24.0
import * as amqp from "@nashaddams/amqp"
import { executeFunction } from "./endpoints.ts"
const RABBITMQ_URL = "amqp://admin:admin@rabbitmq:5672"
const queue = 'ORDERSERVICE'
const queueError = 'ERROR_QUEUE'

async function check() {
  try {
    const connection = await amqp.connect({ hostname: "localhost", port: 5672, username: "admin", password: "admin", })
    console.log("Conexión exitosa con RabbitMQ.")
    return connection
  } catch (error) { console.error("Error de conexión a RabbitMQ:", error) }
}

async function consume(con: any) {
  const channel = await con.openChannel()
  await channel.declareQueue(queue, { passive: true })

  await channel.consume({ queue: queue }, async (args: any, props: any, data: any) => {

    console.log("---------------------------------------------------------------------------------------------------");

    console.log(props);

    const { exchange, routingKey } = args
    const { headers, correlationId, replyTo } = props
    console.log("routingKey", routingKey, "\nheaders", headers, "\ncorrelationId", correlationId, "\nreplyTo", replyTo)
    const messageContent = JSON.parse(new TextDecoder().decode(data))
    const act = messageContent.act

    interface ResponseType { error: boolean, message: string }
    const errors: ResponseType[] = []

    if (messageContent && messageContent.items && Array.isArray(messageContent.items)) {
      await Promise.all(messageContent.items.map(async (e: any) => {
        const api_name = e.api.toLowerCase()
        const functionResponse: ResponseType | undefined = await executeFunction(api_name, act, e.itemId, e.quantity, routingKey, correlationId) as ResponseType | undefined
        if (!functionResponse) {
          console.log("executeFunction returned undefined or null")
          return
        }

        if (functionResponse.error) {
          errors.push({ error: true, message: functionResponse.message });
          console.log("Message processed with errors", functionResponse.message)
        }
      }))

      const response = (errors.length > 0) ? { error: true, message: errors.map(error => error.message).join(', ') } : ''


      await channel.publish({
        ticket: "", // number
        exchange: exchange, // string
        routingKey: replyTo, // string 
      }, {
        contentType: "application/json",
        deliveryMode: args.deliveryMode,
        correlationId: correlationId,
      },
        new TextEncoder().encode(JSON.stringify(response)),
      )
    } else {
      console.error("El mensaje no contiene una propiedad 'items' válida.");
    }
    await channel.ack({ deliveryTag: args.deliveryTag })
  })
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const connection = await check()
  console.log(connection)
  await consume(connection)
}
