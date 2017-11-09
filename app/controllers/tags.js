'use strict';


var StandardError = require('standard-error');
var db = require('../../config/sequelize');

exports.listtags = function(req, res) {
    db.Tag.findAll({order: "Tag_name"})
    	.then(function(tags){
        	return res.jsonp(tags);
    	}).catch(function(err){
    		return res.render('error', {
   	         	error: err,
            	status: 500
        	});
    	});
};

exports.addtag = function(req, res) {
    return db.Tag.create(req.query)
    .then(function(tag){
        return res.jsonp(tag);
    }).catch(function(err){
        return res.render('error', {
            error: err,
            status: 500
        });
    });
};

exports.deletetag = function(req, res) {
    db.Tag.findOne({where: {Tag_name: req.query.Tag_name}})
        .then(function(tag){
            tag.destroy();
        }).then(function(){
            return res.jsonp({msg: "success"});
        }).catch(function(err){
            return res.render('error',{
                error: err,
                status: 500
            });
        });
};

