import { checkIfItemsExist, updateStock } from "./fn.ts"

interface ResponseType {
    error: boolean,
    message: string
}

type FunctionMap = {
    [key: string]: (...args: any[]) => Promise<ResponseType>
}

const functions: FunctionMap = {
    library: async (act: string, item: number, quantity: number): Promise<ResponseType> => {
        if (act === 'VALIDATE-ITEMS') {
            const res: ResponseType = await checkIfItemsExist(item, quantity) as ResponseType
            return res
        }

        if (act === 'DISCOUNT-STOCK') {
            const res: ResponseType = await updateStock(item, quantity) as ResponseType

            return res
        }

        return { error: true, message: 'Invalid action' }
    },

    // car: async (items: number[]): Promise<response> => {
    //     console.log(items)
    //     return { error: false, message: 'Operation completed' }
    // }
}

export const executeFunction = (fnName: string, ...args: any[]) => {
    if (typeof functions[fnName] === "function") {
        return functions[fnName](...args)
    } else {
        console.log(`Función ${fnName}  no encontrada -  ${args} `)
    }
}
