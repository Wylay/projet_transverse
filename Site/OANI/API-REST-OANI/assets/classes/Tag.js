const config = {
    errors : {
        //ID
        wrongValueId : "Mauvaise valeur pour id !",
        wrongTypeId : "Mauvais type pour id !",
        noResultId : "Aucun résultat pour cet id !",
        noValueId : "Pas de valeur pour id !",
        //Tag
        noValueTag : "Pas de valeur pour tag !",
        noUniqueTag : "Valeur pour tag déjà existante !"
    }
}




class Tag {
    
    constructor(db){
        this.db = db
    }




    getByID(id){
        return new Promise((next) => {

            checkId(id)
                .then( (result) => {
                    id = result

                    return this.db.query("SELECT * FROM tag WHERE (id = ?)", [id])
                })
                .then( (result) => {
                    if(result[0] == undefined)
                        next( new Error(config.errors.noResultId) )

                    else
                        next(result[0])
                })
                .catch( (err) => next(err) )

        })
    }


    getAll(id_oeuvre){

        return new Promise( (next) => {

            if(id_oeuvre){

                checkExistingId(id_oeuvre, "Œuvre", this.db)
                    .then((result) => {
                        id_oeuvre = result

                        return this.db.query('SELECT * FROM tag WHERE (`Œuvre` = ?) ORDER BY ordre', [id_oeuvre])
                    })
                    .then( (result) => next(result) )
                    .catch( (err) => next(err) )

            }


            else{

                this.db.query('SELECT * FROM tag ORDER BY `Œuvre`')
                    .then( (result) => next(result) )
                    .catch( (err) => next(err) )

            }
            
        })

    }


    add(tag, id_oeuvre){

        return new Promise( (next) => {
            //GESTION DE id_oeuvre
            checkExistingId(id_oeuvre, `œuvre`, this.db)
                .then( (result) => {
                    id_oeuvre = result

                    return checkTag(tag, id_oeuvre, this.db)
                })
                .then( (result) => {
                    tag = result

                    return this.db.query('INSERT INTO tag(tag, `Œuvre`) VALUES(?, ?)', [tag, id_oeuvre])

                })
                .then( () => {
                    return this.db.query('SELECT * FROM tag WHERE (tag = ?)', [tag])
                })
                .then( (result) => next(result[0]) )
                .catch( (err) => next(err) )

        })

    }


    delete(id){

        return new Promise( (next) => {
            
            checkExistingId(id, "tag", this.db)
                .then( (result) =>{
                    id = result

                    return this.db.query('DELETE FROM tag WHERE (id = ?)', [id])    
                })
                .then( () => {
                    return this.db.query('SELECT * FROM tag ORDER BY `Œuvre`')
                })
                .then( (result) =>{
                    next(result)
                })
                .catch( (err) => next(err) )
    
        })
    }

}




function checkId(id) {

    return new Promise( (resolve, reject) => {

        if(!id)
            reject( new Error(config.errors.noValueId) )
    
    
        else if(parseInt(id) != id)
            reject( new Error(config.errors.wrongTypeId) )
    
    
        else if(id <= 0)
            reject( new Error(config.errors.wrongValueId) )
    
        resolve(parseInt(id))

    })

}


function checkExistingId(id, table, db) {

    return new Promise( (resolve, reject) => {

        checkId(id)
            .then( (result) => {
                id = result;

                return db.query('SELECT id FROM ' + table  + ' WHERE (id = ?)', [id])
            })
            .then((result) => {
                if(result[0] == undefined)
                    reject(new Error(config.errors.noResultId))

                else
                    resolve(id)
            })
            .catch( (err) => reject(err) )

    })

}


function checkTag(tag, id_oeuvre, db){
    return new Promise( (resolve, reject) => {
        
        if(!tag || tag.trim() == "")
            reject( new Error(config.errors.noValueTag) )


        else{
            tag = tag.trim()

            db.query('SELECT tag FROM tag WHERE ( (tag = ?) AND (`Œuvre` = ?) )', [tag, id_oeuvre])
                .then( (result) => {
                    if(result[0] != undefined)
                        reject( new Error(config.errors.noUniqueTag) )

                    else
                        resolve(tag)
                })
                .catch( (err) => reject(err) )
        }

    })
};




module.exports = Tag;