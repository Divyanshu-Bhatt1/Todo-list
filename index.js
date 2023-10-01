//jshint esversion:6
require ('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require('mongoose')
const _=require("lodash")

const PORT=process.env.PORT ;
const app = express();

mongoose.connect(process.env.MONGODB_CONNECT_URI).then(()=>console.log("connected to database")).catch((err)=>console.log("Error : ",err))

// mongoose.connect('mongodb+srv://admin-divyanshu:Test123@cluster0.wobhf1u.mongodb.net/todoListDB?appName=mongosh+1.10.6').then(()=>console.log("connected to database")).catch((err)=>console.log("Error : ",err))

const itemSchema = new mongoose.Schema({
  name: {
      type: String,
      required: true
  }
});

const dataItem = mongoose.model("dataItem", itemSchema);
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const d1=new dataItem({
  name:"Welcome to our todo list"
})

const d2=new dataItem({
  name:"Hot the + button to add a new item"
})

const d3=new dataItem({
  name:"<-- hit this button to delte an item"
})


const ListSchema=new mongoose.Schema({
  name:String,
  items:[itemSchema]
})

const List=mongoose.model("List",ListSchema)

app.get("/", function(req, res) {
  dataItem.find().then((items)=>
  {
      if(items.length==0)
      {
         dataItem.insertMany([d1,d2,d3]).then(()=>console.log("Data inserted successfully")).catch((err)=>console.log("Error :",err))
         res.redirect("/");
      }else{
         res.render("list", {listTitle: "Today", newListItems: items});
      }
  }
  ).catch((err)=>console.log("Error :",err))


});

app.post("/", function(req, res){

  const itemName= req.body.newItem;
  const listName=req.body.list;
  
  const newItem=new dataItem({
    name:itemName
  })

  if(listName==="Today")
  {
    newItem.save();
    res.redirect("/")
  }else{
    List.findOne({name:listName}).then((newFoundList)=>
    {
      newFoundList.items.push(newItem)
      newFoundList.save();
      res.redirect("/"+listName)
    }

    )
  }
  
 

});

app.post("/delete", function(req, res){
  const id=req.body.checkbox;
  const listName=req.body.listName

  if(listName==="Today")
  {
    dataItem.findByIdAndDelete(id).then(()=>console.log("Data deleted successfully")).catch((err)=>console.log("Error :",err))
    res.redirect("/")
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:id}}}).then((foundList)=>
    {
      res.redirect("/"+listName)
    }).catch((err)=>console.log("Error :",err))
  }
  
});

app.get("/:page",function(req,res){
  const customListName=_.capitalize(req.params.page);
  List.findOne({name:customListName}).then((newFoundList)=>
  {
    if(!newFoundList)
    {
      // creating new List
      const list=new List({
       name:customListName,
       items:[d1,d2,d3]
      })
      list.save()
      res.redirect("/"+customListName)
  
    }else{
      res.render("list",{listTitle:newFoundList.name,newListItems:newFoundList.items})
    }
  }
  ).catch((err)=>console.log("Error :",err))
  
  
})


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(PORT, function() {
  console.log(`Server started on port ${PORT}`);
});
