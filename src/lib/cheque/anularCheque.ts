import { ApiResponseData } from "../definitions"

export default async function anularCheque(
  chequeId:string,
  bancoAfectadoId:string
){
  try{
    const response = await fetch(`/api/cheque/${chequeId}/anular`, {
      method: "POST",
      headers:{
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bancoAfectadoId:bancoAfectadoId
      })
    })

    const data:ApiResponseData = await response.json()
    return data
  
  }catch(error){
    if(error instanceof Error) return error.message
  }
}