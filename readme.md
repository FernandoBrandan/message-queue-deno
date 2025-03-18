
# Message Queue Consumer

Este proyecto implementa un consumidor de mensajes basado en RabbitMQ para ejecutar diversas operaciones en una base de datos.
Aunque inicialmente se diseñó para gestionar stock de productos,
el servicio es flexible y puede adaptarse a cualquier acción requerida en la base de datos.

## Tecnologías Utilizadas

- Deno + TypeScript
- RabbitMQ
- AMQP

## Funcionalidades Principales

El servicio consume mensajes de una cola de RabbitMQ, ejecuta la acción solicitada y responde según los resultados.
Las acciones se determinan a partir del campo act en el mensaje recibido.

Algunas de las operaciones implementadas incluyen:

- Validación de datos (VALIDATE-ITEMS)
- Actualización de registros (DISCOUNT-STOCK)
- Otras acciones personalizadas según las necesidades del sistema
- El sistema permite expandir la funcionalidad agregando nuevas operaciones a la lógica de consumo sin modificar la estructura principal.

- Contribución
  Si deseas agregar nuevas funciones al sistema, puedes modificar fn.ts y definir nuevas operaciones en endpoints.ts.
