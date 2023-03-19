const { response } = require("express");
const express = require ("express");
const recordRoutes = express.Router();
const dbo = require("../db/conn.js")
const ObjectId = require("mongodb").ObjectId;

recordRoutes.route("/products").get(function (req, res) {
    let db_connect = dbo.getDb("products");
    // console.log(dbo, db_connect)
    let filter = req.body.filter
    let value = req.body.filter_value
    let sort_by = req.body.sort_by
    if (filter === "cost" || filter == "number"){
      value = Number(value)
    }
    // console.log(filter, value)
    let obj = {}
    obj[filter] = value
    f = (filter !== undefined && value !== undefined)?obj:{}
    // console.log(f)
    if (sort_by !== undefined ){
      let obj2 = {}
      obj2[sort_by] = 1
      db_connect
        .collection("products")
        .find(f)
        .sort(obj2)
        .toArray(function (err, result) {
          if (err) throw err;
          res.json(result);
        });
    }else{
      db_connect
      .collection("products")
      .find(f)
      .toArray(function (err, result) {
        if (err) throw err;
        res.json(result);
      });
    }
   });


   recordRoutes.route("/products/add").post(function(req,res){
    let db_connect = dbo.getDb();
    let myObj = {
        name: req.body.name,
        cost: req.body.cost,
        description: req.body.description,
        number: req.body.number,
        unit_of_measurment: req.body.unit_of_measurment
    }
    db_connect.collection("products").find({name:req.body.name}).toArray(function (err, result) {
        if (err) throw err;
        if (result.length>0){
          res.json("Name must be unique") 
        }else{
          db_connect.collection("products").insertOne(myObj,function(err, result2){
            if (err) throw err
            res.json(result2)
          })
        }
        
      });
   })


   recordRoutes.route("/products/:id").delete(function (req, res) {
    let id = req.params.id
    let db_connect = dbo.getDb("products");

    db_connect.collection("products").find({_id:ObjectId(id)}).toArray(function (err, result) {
      if (err) throw err;
      console.log(result, id)
      if (result.length==0){
        throw "Product doesn't exist"
      }else{
        db_connect.collection("products").deleteOne({_id:ObjectId(id)},function(err, result2){
          if (err) throw err
          res.json(result2)
        })
      }
      
    });
  })

  recordRoutes.route("/products/:id").put(function(req,res){
    let id = req.params.id
    let db_connect = dbo.getDb();
    let myObj = {
        name: req.body.name,
        cost: req.body.cost,
        description: req.body.description,
        number: req.body.number,
        unit_of_measurment: req.body.unit_of_measurment
    }
    console.log(id)
    db_connect.collection("products").find({_id:ObjectId(id)}).toArray(function (err, result) {
        if (err) throw err;
        if (result.length==0){
          throw "Product doesn't exist"
        }else{
          db_connect.collection("products").update({_id:ObjectId(id)}, {$set:myObj},function(err, result2){
            if (err) throw err
            res.json(result2)
          })
        }
        
      });
   })

   recordRoutes.route("/raport").get(function (req, res) {
    let db_connect = dbo.getDb("products");
    // console.log(dbo, db_connect)
    db_connect
      .collection("products")
      .aggregate([{$project:{_id:0,"name":1, "overall_cost":{$multiply:["$number","$cost"]}}}])
      .toArray(function (err, result) {
        if (err) throw err;
        res.json(result);
      });
   });

   
module.exports = recordRoutes;