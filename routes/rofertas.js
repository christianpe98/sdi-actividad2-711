module.exports=function(app,swig,ofertasBD,usuariosBD){
    app.get("/agregarOferta",function (req,res) {
        var criterio={
            email:req.session.usuario
        }
        usuariosBD.obtenerUsuarios(criterio,function(usuario){
            if(usuario==null || usuario.length>1)
            {
                res.send("ERROR:AGREGAR OFERTA USUARIOS");
            }else{
                var usuario={email:usuario[0].email,cash:usuario[0].cash};
                var respuesta=swig.renderFile("views/identificado/estandar/bagregarOferta.html",{usuario:usuario});
                res.send(respuesta);
            }
        })

    });
    
    app.post("/agregarOferta",function (req,res) {
        //VALIDACIONES
        if(!req.body.title.toString().trim().length) //No lleva solo espacios
        {
            res.redirect("/agregarOferta?error=noTitulo");
            return;
        }

        if(!req.body.description.toString().trim().length)
        {
            res.redirect("/agregarOferta?error=noDescripcion");
            return;
        }

        if(!req.body.price>0)
        {
            res.redirect("/agregarOferta?error=precioNegativo");
            return;
        }

        //VALIDAR FECHA
        var oferta=crearOferta(req);
        ofertasBD.agregarOferta(oferta,function(result){
            if(result==null)
            {
                res.send("ERROR: NO SE HA PODIDO AGREGAR LA OFERTA");
            }else{
                res.redirect("/verOfertasPublicadas");
            }
        })
    });

    function crearOferta(req){
        return {
            title: req.body.title,
            description:req.body.description,
            date:req.body.date,
            price:req.body.price,
            owner:req.session.usuario,
            sold:false,
            purchaser:null
        }
    };

    app.get("/verOfertasPublicadas",function(req,res){
        var criterio={
            owner:req.session.usuario
        };
        ofertasBD.obtenerOfertas(criterio,function(ofertas){
            if(ofertas==null)
            {
                res.send("ERROR AL OBTENER OFERTAS PUBLICADAS");
            }else{
                var criterio={
                    email:req.session.usuario
                }
                usuariosBD.obtenerUsuarios(criterio,function(usuario){
                    if(usuario==null || usuario.length>1)
                    {
                        res.send("ERROR:AGREGAR OFERTA USUARIOS");
                    }else{
                        var usuario={email:usuario[0].email,cash:usuario[0].cash};
                        var respuesta=swig.renderFile("views/identificado/estandar/bofertasPublicadas.html",{ofertas:ofertas,usuario:usuario});
                        res.send(respuesta);
                    }
                });
            }
        })
    });

    app.get("/eliminarOferta/:id",function(req,res){
        var criterio={
            "_id":ofertasBD.mongo.ObjectID(req.params.id),
        };
        ofertasBD.obtenerOfertas(criterio,function (oferta) {
            if(oferta==null)
            {
                res.send("ERROR ELIMINAR OFERTAS 1");
            }else{
                console.log(oferta[0].owner);
                console.log(req.session.usuario);
                if(oferta[0].owner!==req.session.usuario)
                {
                    res.send("NO PUEDE BORRAR UNA OFERTA SI NO ES EL PROPIETARIO");
                }else{
                    ofertasBD.eliminarOferta(criterio,function(result)
                    {
                        if(result==null){
                            res.send("ERROR ELIMINAR OFERTAS 2");
                        }else{
                           res.redirect("/verOfertasPublicadas");
                        }
                    })
                }
            }
        })
    });

};
