const fs =require("fs")
const express = require("express")
const bodyParser = require("body-parser")
const axios = require("axios")
const twig = require("twig")
const fileUpload = require('express-fileupload');
const morgan = require("morgan")("dev")
const multer = require('multer');
const upload = multer({dest: '/public/img'})



//variables globales :
const app = express()
const port = 8081
const fetch = axios.create({
    baseURL : "http://localhost:8080/api-oani/v1"
})
const TestesRouter = express.Router()




//Middlewares :
app.use(morgan)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended : true }))    
app.use(express.static("public"));
app.use(fileUpload());




//Routes :
app.get("/", (req, res) => {
    res.redirect("/testes/photos")
})
app.get("/front", (req, res) => {
    res.render("ae/index.twig")
})

app.get("/testes/%C5%93uvre", (req, res) => {
    res.render("testes/œuvre.twig")
})

app.get("/testes/Utilisateur", (req, res) => {
    res.render("testes/user.twig")
})

app.get("/testes/adresse", (req, res) => {
    res.render("testes/adresse.twig")
})

app.get("/testes/upload", (req, res) => {
	res.render("testes/upload.twig")
})

app.post('/testes/upload', (req, res) =>{
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.image;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv('/public/img/filename.jpg', (err)=> {
    if (err)
      return res.status(500).send(err);

    res.send('File uploaded!');
  });
});

app.post("/testes/adresse", (req, res) => {
	
	apiCall("/adresse","post",{
        pays : req.body.pays, 
		code_postal : req.body.postal,
		rue : req.body.adresse, 
		numero : req.body.numero,
		indication : req.body.complement,
		masquage : (req.body.masquage != undefined) ? 1 : 0
	},res,()=>{
            res.redirect("/testes/adresse")
    })

})



TestesRouter.route("/")

    .get((req, res) => {

        apiCall("/photo", "get", {}, res, (response) => {
            res.render("testes/panel_admin.twig", {
                photos : response
            })
        })

    })


TestesRouter.route("/get/:id")

    .get((req, res) => {

        apiCall("/photo/" + req.params.id, "get", {}, res, (response) => {
            res.render("testes/photo.twig", {
                photo : response
            })
        })

    })


TestesRouter.route("/edit/:id")

    .get( (req, res) => {

        apiCall("/photo/" + req.params.id, "get", {}, res, (response) => {
            res.render("testes/photo_edit.twig", {
                photo : response
            })
        })

    })

    .post( (req, res) => {

        apiCall("/photo/" + req.params.id, "put", {ordre : req.body.ordre}, res, () => {
            res.redirect("/testes/photos")
        })

    })


TestesRouter.route("/delete")

    .post((req, res) => {

        apiCall("/photo/" + req.body.id, "delete", {}, res, () => {
            res.redirect("/testes/photos")
        })

    })




//Création de nos routes :
app.use(`/testes/photos`, TestesRouter)


//Lancement de l'app
app.listen(port, () => console.log(`Server started on port : ${port}`))



//Functions :
function renderError(res, errMes){
    res.render("testes/error.twig", {
        errorMessage : errMes
    })
}


function apiCall(url, method, data, res, next){

    fetch({
        method : method,
        url : url,
        data : data
    })
        .then( (response) => {
            if(response.data.status == "error")
                renderError(res, response.data.message)


            else
                next(response.data.result)
        })
        .catch( (err) => renderError(res, err.message) )

}

