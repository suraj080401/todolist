const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app=express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://suraj_singh:surajsingh@cluster0.v0mxm.mongodb.net/todolistDB?retryWrites=true&w=majority",{ useNewUrlParser: true, useUnifiedTopology: true });

const itemsSchema = {
  name: String
};
const Item= mongoose.model("Item",itemsSchema);
const item1=new Item({
 name:"Welcome to your Todolist"
});
const item2=new Item({
  name:"Hit the + button to add new TODO"
 });
const item3=new Item({
  name:"<- To delete"
 });
const defaultItem=[item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}
const List=mongoose.model("List",listSchema);
app.get("/",function(req,res){
   Item.find({},function(err,items)
   {
     if(items.length===0)
     {
       Item.insertMany(defaultItem,function(err){
        if(err)
        {
          console.log(err);
        } 
    });
    res.redirect("/");
  }
  else
  {
    res.render("list",{listTitle:"Today",newListItems:items});
  }
   });
});
app.get("/:customListName",function(req,res){
 const customListName = _.capitalize(req.params.customListName);
  
 List.findOne({name:customListName},function(err,foundList){
    if(!err)
    {
      if(!foundList)
      {
        const list=new List({
          name : customListName,
          items: defaultItem
        })
        list.save();
        res.redirect("/"+ customListName);
      }
      else
      {
        res.render("list",{listTitle: foundList.name,newListItems:foundList.items})
      }
    }
 });
 
});
app.post("/",function(req,res){
  let itemName=req.body.newItem;
  let listName=req.body.list;
    const item = new Item({
    name: itemName
  });
  if(listName==="Today")
  {
  item.save();
  res.redirect("/")
  }
  else
  {
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});
app.post("/delete",function(req,res){
  const id=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today")
  {
    Item.findByIdAndRemove(id,function(err){
      if(err)
      {
        console.log(err);
      }
      res.redirect("/")
    })
  }
  else
  {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:id}}},function(err,foundList){
      if(!err)
      {
        res.redirect("/"+listName);
      }
    });
  }
});


app.get("/work",function(req,res){
  res.render("list",{listTitle: "Work List",newListItems:workItems});
});
app.post("/work",function(req,res){
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});
app.listen(process.env.PORT);