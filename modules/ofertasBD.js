module.exports= {
    mongo: null,
    app: null,
    init: function (app, mongo) {
        this.mongo = mongo;
        this.app = app;
    },

    agregarOferta: function(oferta, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('ofertas');
                collection.insert(oferta, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result.ops[0]._id);
                    }
                    db.close();
                });
            }
        });
    },

    obtenerOfertas : function(criterio,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('ofertas');
                collection.find(criterio).toArray(function(err, ofertas) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(ofertas);
                    }
                    db.close();
                });
            }
        });
    },

    eliminarOferta:function(criterio,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('ofertas');
                collection.remove(criterio, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },

    obtenerOfertasPg : function(criterio,pg,funcionCallback){
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('ofertas');
                collection.count(function(err, count){
                    collection.find(criterio).skip( (pg-1)*5 ).limit( 5 )
                        .toArray(function(err, canciones) {
                            if (err) {
                                funcionCallback(null);
                            } else {
                                funcionCallback(canciones, count);
                            }
                            db.close();
                        });
                });
            }
        });
    },

    modificarOferta: function(criterio,oferta, funcionCallback) {
        this.mongo.MongoClient.connect(this.app.get('db'), function(err, db) {
            if (err) {
                funcionCallback(null);
            } else {
                var collection = db.collection('ofertas');
                collection.updateOne(criterio, {$set: oferta}, function(err, result) {
                    if (err) {
                        funcionCallback(null);
                    } else {
                        funcionCallback(result);
                    }
                    db.close();
                });
            }
        });
    },
};
