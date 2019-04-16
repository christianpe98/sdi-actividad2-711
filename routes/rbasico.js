module.exports=function(app,swig,usuariosBD){

    app.get("/inicio",function(req,res)
    {
        if(req.session.usuario==null) {
            var respuesta = swig.renderFile("views/anonimo/bindexAnonimo.html",{});
            res.send(respuesta);
        }else{
            var criterio={email:req.session.usuario};
            usuariosBD.obtenerUsuarios(criterio,function(usuarios) {
                if (usuarios.length === 0 || usuarios.length > 1) {
                    res.send("ERROR"); //<-------------------------------------- CAMBIAR
                } else {
                    if (usuarios[0].rol === 'U') {
                        var respuesta = swig.renderFile('views/identificado/estandar/bindexEstandar.html', {usuario: usuarios[0]});
                        res.send(respuesta);
                    }else
                        {
                            if (usuarios[0].rol === 'A') {
                                var respuesta = swig.renderFile('views/identificado/administrador/bindexAdministrador.html', {usuario: usuarios[0]});
                                res.send(respuesta);
                            }
                        }
                }
        });

        }
    });

    app.get("/error",function(req,res){
        res.send("HA OCURRIDO UN ERROR");
    })
}
