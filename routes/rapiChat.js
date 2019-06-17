module.exports = function (app, usuariosBD, ofertasBD, chatBD) {

    app.post("/api/chat/identificarse", function (req, res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        var criterio = {
            email: req.body.email,
            password: seguro
        };
        usuariosBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                res.status(401); // Unauthorized
                res.json({
                    autenticado: false
                })
            } else {
                var token = app.get('jwt').sign(
                    {usuario: criterio.email, tiempo: Date.now() / 1000},
                    "secreto");
                res.status(200);
                res.json({
                    autenticado: true,
                    token: token
                });
            }
        });
    });

    app.get("/api/chat/ofertas", function (req, res) {
        var criterio = {
            owner: {$ne: res.usuario}
        };
        ofertasBD.obtenerOfertas(criterio, function (ofertas) {
            if (ofertas == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                });
            } else {
                res.status(200);
                res.send(JSON.stringify(ofertas));
            }
        });
    });



    app.get("/api/chat/conversaciones",function (req,res) {
        var criterio={
            miembros:{"$in":[res.usuario]}
        };
        chatBD.obtenerConversacion(criterio,function(conversaciones){
           if(conversaciones===null){
               res.status(500);
               res.json({
                   error: "se ha producido un error"
               });
           }else{
                   var result=[];
                   var i;

                    for(i=0;i<conversaciones.length;i++) {
                        var usuario = conversaciones[i].miembros[0];
                        if (res.usuario === conversaciones[i].miembros[0]) {
                            usuario = conversaciones[i].miembros[1];
                        }
                        result.push({
                            tituloOferta:conversaciones[i].oferta.title,
                            idOferta:conversaciones[i].oferta._id.toString(),
                            usuario:usuario,
                            _id:conversaciones[i]._id
                        })
                    }
               res.status(200);
               res.send(JSON.stringify(result));
           }
        });
    });

    app.get("/api/chat/mensajes",function(req,res){
        var criterio= {
            "oferta._id": ofertasBD.mongo.ObjectID(req.query.idOferta),
            miembros: {$all: [res.usuario, req.query.destino]}
        };
        chatBD.obtenerConversacion(criterio,function(conversacion){
            if(conversacion===null)
            {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                });
            }else{
                if(conversacion[0]==null){
                    res.status(204 );
                    res.json({
                        error: "se ha producido un error"
                    });
                }else{
                    res.status(200);
                    res.send(JSON.stringify(conversacion[0].mensajes));
                }

            }
        });
    });
    
    app.post("/api/chat/desconectar",function (req,res) {
        
    })

    ///REVISARRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
    app.post("/api/chat/mensaje", function (req, res) {
        var criterio= {
            "oferta._id": ofertasBD.mongo.ObjectID(req.body.idOferta),
            miembros: {$all: [res.usuario, req.body.destino]}
        };

         chatBD.obtenerConversacion(criterio,function(conversacion){
             if(conversacion===null)
             {
                 res.status(500);
                 res.json({
                     error: "se ha producido un error"
                 });
             }else{
                 var mensaje=crearMensaje(res.usuario,req.body.idOferta,req.body.textoMensaje,new Date(),false);
                 if(conversacion.length===0){
                     ofertasBD.obtenerOfertas({_id:ofertasBD.mongo.ObjectID(req.body.idOferta)},function(oferta) {
                         if (oferta === null) {
                             res.status(500);
                             res.json({
                                 error: "se ha producido un error"
                             });
                         } else {
                         var conversacion = crearConversacion(res.usuario, req.body.destino, oferta[0]);
                         chatBD.crearConversacion(conversacion, function (result) {
                             if (result === null) {
                                 res.status(500);
                                 res.json({
                                     error: "se ha producido un error"
                                 });
                             } else {

                                 chatBD.insertarMensaje({_id: usuariosBD.mongo.ObjectID(result)}, mensaje, function (resultado) {
                                     res.status(200);
                                     res.send(JSON.stringify(mensaje));
                                 });
                             }
                         });
                     }
                     });
                 }else{
                    chatBD.insertarMensaje({_id:usuariosBD.mongo.ObjectID(conversacion[0]._id)},mensaje,function(resultado){
                            res.status(200);
                            res.send(JSON.stringify(mensaje));
                     });
                 }
             }
         });

    });


    app.delete("/api/chat/conversacion",function(req,res) {
        var criterio = {
            _id: chatBD.mongo.ObjectID(req.body.idConversacion)
        };
        chatBD.obtenerConversacion(criterio, function (conversacion) {
            if (conversacion === null) {
                res.status(500);
                res.json({
                    error: "ERROR"
                });
            } else {
              //AÑADIR COMPROBACION
                    chatBD.eliminarConverscion(criterio, function (result) {
                        if (result === null) {
                            res.status(500);
                            res.json({
                                error: "ERROR"
                            });
                        } else {
                            res.status(200);
                            res.json({
                                ok: "OK"
                            });
                        }
                    });

            }
        });
    });


    function crearConversacion(usuario1,usuario2, oferta) {
        return {
            miembros:[usuario1,usuario2],
            oferta: oferta,
            mensajes:[]
        }
    }

    function crearMensaje(origen, oferta, texto, fecha, leido) {
        return {
            origen: origen,
            id_oferta: oferta,
            texto: texto,
            fecha: fecha,
            leido: leido,
        };
    };



};
