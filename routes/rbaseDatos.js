/*

SOLO SE UTILILZA PARA REINICIAR LA BASE DE DATOS CON LOS SIGUIENTES DATOS:
    1-USUARIOS

 */

module.exports=function(app,utilBD){

    app.get("/reiniciarBBDD",function(req,res)
    {
        utilBD.eliminarColecciones(function(result)
        {
            if(result==null)
            {
                res.send("NO SE HA PODIDO CONECTAR CON LA BASE DE DATOS");
            }else{
                var usuarios=generarUsuarios();
                /*var ofertas=generarOfertas(usuarios);*/
                utilBD.insertarDatos(usuarios,/*ofertas,*/function(result)
                {
                    if(result!=null)
                    {
                        app.get('log').info("Se ha reiniciado la Base de Datos");
                        res.send("SE HA REINICIADO LA BASE DE DATOS CORRECTAMENTE");
                    }else{
                        res.send("HA OCURRIDO UN ERROR DURANTE EL REINICIO DE LA BASE DE DATOS");
                    }
                });
            }
        })
    });

    function generarUsuarios()
    {
        var usuarios=[];
        usuarios.push(crearUsuario("admin@email.com","Edward","Nuñez","admin","A",100));
        usuarios.push(crearUsuario("christian@email.com","Christian","Peláez","123456","U",100));

        return usuarios;
    }

    function generarOfertas(usuarios)
    {
        var ofertas=[];
        ofertas.push(crearUsuario("admin@email.com","Edward","Nuñez","admin","A",100));
        ofertas.push(crearUsuario("christian@email.com","Christian","Peláez","123456","U",100));

        return ofertas;
    }

    function encriptarPassword(password) {
        return  app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(password).digest('hex');
    };

    function crearUsuario(email,nombre,apellido,password,rol,dinero) {
        return {
            email : email,
            name: nombre,
            lastname: apellido,
            password : encriptarPassword(password),
            rol: rol,
            cash:dinero,
        };
    };

};
