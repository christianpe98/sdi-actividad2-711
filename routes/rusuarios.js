module.exports=function(app,swig,usuariosBD){
    app.get("/registrarse",function(req,res){
        var respuesta=swig.renderFile('views/bregistro.html',{});
        res.send(respuesta);
    });

    app.post("/registrarse",function(req,res){
        //Validaciones
        validarDatosRegistro(req,res);

        var usuario = crearUsuario(req);

        var criterio={email:usuario.email };
        usuariosBD.obtenerUsuarios(criterio,function(usuarios)
        {
            if(usuarios.length>0)
            {
                res.redirect("/registrarse?error=usuarioRepetido");
            }else{
                usuariosBD.insertarUsuario(usuario, function(id) {
                    if (id == null){
                        res.redirect("/registrarse?error=errorRegistro")
                    } else {
                        //logger
                        res.send("AÑADIDO");
                    }
                });
            }
        });


    });

    function validarDatosRegistro(req,res)
    {
        if(!req.body.email)
        {
            res.redirect("/registrarse?error=noEmail");
        }
        if(!req.body.name)
        {
            res.redirect("/registrarse?error=noNombre");
        }
        if(!req.body.lastName)
        {
            res.redirect("/registrarse?error=noApellido");
        }
        if(!req.body.password)
        {
            res.redirect("/registrarse?error=noContraseña");
        }
        if(!req.body.passwordConfirm)
        {
            res.redirect("/registrarse?error=noContraseñaConfirmar");
        }
        if(req.body.passwordConfirm !== req.body.password)
        {
            res.redirect("/registrarse?error=contraseñasDistintas");
        }
    };

    function encriptarPassword(password) {
        return  app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(password).digest('hex');
    };

    function crearUsuario(req) {
        return {
            email : req.body.email,
            name: req.body.name,
            lastname: req.body.lastName,
            password : encriptarPassword(req.body.password),
            cash:100,
        };
    }
}
