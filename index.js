//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose")
const _ = require("lodash")
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//connecting to mongodb server
mongoose.connect("mongodb+srv://admin-aam:test123@cluster0.30orzjw.mongodb.net/todolistDB?retryWrites=true&w=majority")

//creating schema
const itemsSchema = new mongoose.Schema({

  name: String
})
//creating model
const Item = mongoose.model("Item", itemsSchema)
//creating documents 
const item1 = new Item({
  name: "welcome to your to do list app"
})
const item2 = new Item({
  name: "hit + button to add new item"
})
const item3 = new Item({
  name: "click checkbox to delete the item"
})
const defaultItems = [item1, item2, item3];

//customlist schema
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})
//creating customlist model
const List = mongoose.model("list", listSchema)


//inserting documents to items collection
/*Item.insertMany(defaultItems,function(err){
  if(err){
    console.log(err);
  }
  else{
    console.log("successfully added the items to database")
  }

})*/
/*Item.deleteMany({},function(err){
  if(err)
  {
    console.log(err)

  }
  else{
    console.log("successfully deleted all the documents")
  }
}) */


app.get("/", function (req, res) {

  const day = date.getDate();

  Item.find(function (err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("successfully added the items to database")
        }

      })
      res.redirect("/")
    }
    else {
      console.log(foundItems.name)
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  })



});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  // console.log(customListName)


  List.findOne({ name: customListName }, function (err, foundList) {
    if (customListName === "About") {
      res.render("about")
    }
    else if (!err) {
      if (!foundList) {
        //crrate list
        const list = new List({
          name: customListName,
          items: defaultItems

        })
        list.save()
        res.redirect("/" + customListName)
      }
      else {
        //show list
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
      }
    }
  })

})

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  console.log(listName)

  const item = new Item({
    name: itemName
  })

  if (listName === "Today") {
    item.save();
    res.redirect("/")
  }
  else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item)
      console.log(foundList)
      foundList.save()
      res.redirect("/" + listName)
    })

  }

});
app.post("/delete", function (req, res) {
  const itemID = req.body.checkbox
  const listName = _.capitalize(req.body.listName);
  console.log(listName)

  if (listName === "Today") {

    Item.findByIdAndDelete(itemID, function (err) {
      if (!err) {
        console.log("deleted the checked item")
      }
      res.redirect("/")
    })
  }
  else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: itemID } } }, function (err, foundList) {
      if (!err) {
        res.redirect("/" + listName)
        // console.log(foundList)
      }
    })
  }

})

// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

// app.get("/about", function (req, res) {
//   res.render("about");
// });

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});
