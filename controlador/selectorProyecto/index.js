var express = require('express');
var app = module.exports = express();
var mongoo = require('mongoose');
app.set('views', __dirname + '/views');
var cookieSession = require('cookie-session');
app.use(cookieSession({name:"session",
    keys:["key1", "key2"]	 
}));
app.get('/selector', function(req, res){
    db.Proyecto.find(function(err,proy){
        var array = []
        proy.forEach(function(e){
            if(e.id_pertenecientes.indexOf(req.session.user_id)!=-1 || e.id_creador == req.session.user_id){
                array.push(e)
            }
        })
        res.render('selector', {proy:array});
    });
});
app.post('/selecupdate',function(req,res){
    var array = []
    db.Proyecto.find(function(err,proy){
        proy.forEach(function(e){
            if(e.id_pertenecientes.indexOf(req.session.user_id)!=-1 || e.id_creador == req.session.user_id){
                array.push(e)
            }
        })
        res.send({proy:array, actu:req.session.currentproject})
    });
});
app.post('/seleccionado', function(req,res){
    req.session.currentproject = req.body.dato;
    res.send({redirect: '/kanban'})
});
app.post('/agregarproyecto', function(req,res){
    var proyecto = db.Proyecto({
        nombre: req.body.nombre,
        id_creador: req.session.user_id, 
        id_pertenecientes: req.body.pertenece
    });
    proyecto.save(function(error,user){
        if(error){console.log(error)}
        res.send({resultado:"1"});
    });
});
app.post('/validaremail',function(req,res){
   db.User.find({email:req.body.email},function(err,user){
       if(user.length == 0){
           res.send({resultado:"0"})
       }
       else{
           db.User.find({_id:mongoo.Types.ObjectId(req.session.user_id)},function(err, uss){
               if(req.body.email == uss[0].email){
                res.send({resultado:"2"})
               }
               else{
               res.send({resultado:"1", usuario: user});
               }
           });
       }
   });

});
