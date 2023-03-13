import { NextApiRequest, NextApiResponse } from "next"

export default (request: NextApiRequest, response: NextApiResponse)=>{ 
    //posso fazer qualquer operação, seja consultar no bando de dados, cartão de crédito, login e etc...
    const users=[
        {
            id: 1,
            name:"felipe"
        },
        {
            id: 2,
            name:"teste2"
        }
    ]
    return response.json(users);
} 