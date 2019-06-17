module.exports={
    mongo : null,
    app : null,
    usuariosBD:null,
    ofertasBD:null,
    chatBD:null,
    init : function(app, mongo,usuariosBD,ofertasBD,chatBD) {
        this.mongo = mongo;
        this.app = app;
        this.usuariosBD=usuariosBD;
        this.ofertasBD=ofertasBD;
        this.chatBD=chatBD;
    },

    eliminarColecciones: function(functionCallback)
    {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                functionCallback(null);
            }else{
                  db.dropDatabase();
                  functionCallback(true);
            }
        });
    },

    insertarDatos: function(usuarios,ofertas,conversaciones,functionCallback)
    {
        var usuariosBD=this.usuariosBD;
        var ofertasBD=this.ofertasBD;
        var chatBD=this.chatBD;
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            }else{
                usuariosBD.insertarUsuario(usuarios,function (result){
                    if(result==null)
                    {
                        functionCallback(null);
                    }else{
                        ofertasBD.agregarOferta(ofertas,function(result){
                            if(result==null)
                            {
                                functionCallback(null);
                            }else {
                                chatBD.crearConversacion(conversaciones,functionCallback);
                            }
                        });
                    }
                });

            }
        });
    }
};
