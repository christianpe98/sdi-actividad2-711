module.exports={
    mongo : null,
    app : null,
    usuariosBD:null,
    ofertasBD:null,
    init : function(app, mongo,usuariosBD,ofertasBD) {
        this.mongo = mongo;
        this.app = app;
        this.usuariosBD=usuariosBD;
        this.ofertasBD=ofertasBD;
    },

    eliminarColecciones: function(functionCallback)
    {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            }else{
                  db.dropDatabase();
                  functionCallback(true);
            }
        });
    },

    insertarDatos: function(usuarios,ofertas,functionCallback)
    {
        var usuariosBD=this.usuariosBD;
        var ofertasBD=this.ofertasBD;
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            }else{
                usuariosBD.insertarUsuario(usuarios,function (result){
                    if(result==null)
                    {
                        functionCallback(null);
                    }else{
                        ofertasBD.agregarOferta(ofertas,functionCallback);
                    }
                });

            }
        });
    }
};
