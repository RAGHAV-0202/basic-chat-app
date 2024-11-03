


import server from "./app.js";


async function Host(){
    try{
        server.listen(8000 , ()=>{
            console.log("listening on the port 8000")
        })
    }catch(err){
        console.log("err while hosting on the port 8000")
    }
}

Host()