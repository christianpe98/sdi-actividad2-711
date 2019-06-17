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
                app.get("log").info("Se ha agregado la oferta: "+oferta.title);
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
        ofertasBD.eliminarOferta(criterio,function(result)
        {
            if(result==null){
                res.send("ERROR ELIMINAR OFERTAS 2");
            }else{
                app.get("log").info("Se ha eliminado la oferta con id:"+ofertasBD.mongo.ObjectID(req.params.id));
               res.redirect("/verOfertasPublicadas");
            }
        })
    });

    app.get("/verOfertasCompradas",function(req,res){
       var criterio={
           purchaser:req.session.usuario
       };

        ofertasBD.obtenerOfertas(criterio,function(ofertas){
            if(ofertas==null)
            {
                res.send("ERROR AL OBTENER OFERTAS COMPRADAS");
            }else{
                criterio={
                    email:req.session.usuario
                }
                usuariosBD.obtenerUsuarios(criterio,function(usuario){
                    if(usuario==null || usuario.length>1)
                    {
                        res.send("ERROR:OFERTAS COMPRADAS USUARIOS");
                    }else{
                        var usuario={email:usuario[0].email,cash:usuario[0].cash};
                        var respuesta=swig.renderFile("views/identificado/estandar/bofertasCompradas.html",{ofertas:ofertas,usuario:usuario});
                        res.send(respuesta);
                    }
                });
            }
        })

    });

    app.get("/buscarOfertas",function (req,res) {
        var criterioBusqueda = {};
        if (req.query.busqueda != null) {
            // criterio = { "nombre" : new RegExp(req.query.busqueda,"i") };
            criterioBusqueda = {"title": {$regex: "" + req.query.busqueda + ".*", $options: "i"}};
        }
        var pg = parseInt(req.query.pg); // Es String !!!
        if (req.query.pg == null) { // Puede no venir el param
            pg = 1;
        }

        ofertasBD.obtenerOfertasPg(criterioBusqueda, pg, function (ofertas, total) {
            if (ofertas == null) {
                res.send("Error al listar ");
            } else {
                var ultimaPg = total / 4;
                if (total % 4 > 0) { // Sobran decimales
                    ultimaPg = ultimaPg + 1;
                }
                var paginas = []; // paginas mostrar
                for (var i = pg - 2; i <= pg + 2; i++) {
                    if (i > 0 && i <= ultimaPg) {
                        paginas.push(i);
                    }
                }
                var criterioUsuario={
                    email:req.session.usuario
                };
                usuariosBD.obtenerUsuarios(criterioUsuario,function(usuario)
                {
                    if(usuario==null){
                        res.send("ERROR");
                    }else{
                        var respuesta = swig.renderFile('views/identificado/estandar/bbuscarOferta.html',
                            {
                                ofertas: ofertas,
                                paginas: paginas,
                                actual: pg,
                                busqueda:req.query.busqueda,
                                usuario:usuario[0]
                            });
                        res.send(respuesta);
                    }
                });

            }
        });
    });

    app.get("/comprarOferta/:id",function(req,res){
        //Tenemos dinero? - SI o NO
        var criterioOferta={
            _id: ofertasBD.mongo.ObjectID(req.params.id)
        }
        ofertasBD.obtenerOfertas(criterioOferta,function(oferta){
           if(oferta==null)
           {
               res.send("ERROR 12");
           }else{
               var criterioUsuario={
                 email:req.session.usuario
               };
               usuariosBD.obtenerUsuarios(criterioUsuario,function(usuario)
               {
                   if(usuario==null)
                   {
                       res.send("ERROR 13");
                   }else{
                       if(oferta[0].price>usuario[0].cash){
                           res.redirect("/buscarOfertas?error=No tienes dinero suficiente para comprar la oferta");
                       }else{
                           if(oferta[0].owner===usuario[0].email)
                           {
                               res.redirect("/buscarOfertas?error=No puedes comprar tu propia oferta")
                           }else{
                               //Compramos la oferta
                               oferta[0].sold=true;
                               oferta[0].purchaser=usuario[0].email;
                               ofertasBD.modificarOferta(criterioOferta,oferta[0],function (ofertaModificada) {
                                   if(ofertaModificada==null)
                                   {
                                       res.send("ERROR 14");
                                   }else{
                                       usuario[0].cash-=oferta[0].price;
                                       usuariosBD.modificarUsuario(criterioUsuario,usuario[0],function (usuario) {
                                           if(usuario==null)
                                           {
                                               res.send("ERROR 15");
                                           }else{
                                               app.get("log").info("Se ha compadro la oferta con id:"+ofertasBD.mongo.ObjectID(req.params.id));
                                               res.redirect("/buscarOfertas");
                                           }
                                       });
                                   }
                               });
                           }
                       }
                   }
               });
           }
        });

    });

};
