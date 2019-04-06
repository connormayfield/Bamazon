
var mySQL = require('mysql');
var inquirer = require('inquirer');
var conTable = require("console.table");
// connection credentials and...other...stuff?
var connection = mySQL.createConnection({
   host: 'localhost',
   port: 3306,
   user: 'root',
   password: 'Bagelboy1!',
   database: 'bamazonDB'
});


connection.connect(function(err) {
   if (err) throw err;
   console.log("connected as id " + connection.threadId + "\n");
   showStuff();
 });


function showStuff() {
   connection.query("SELECT * FROM products", function(err, res){
       if (err) throw err;
       console.table(res);
       itemPrompt();
   })
}


function itemPrompt() {
   inquirer
       .prompt([
           {
           type: 'input',
           name: 'itemID',
           message: 'What is the ID of the item you would like to buy? [Quit with Q]',
           validate: function(value) {
             if (isNaN(value) === false) {
             return true;
           } else if(value=='q' || value=='Q'){
             exit();
           }
           else {
             return false;
           }
         }
       },
       {
           type: 'input',
           name: 'quantity',
           message: 'How many do you need? [Quit with Q]',
           validate: function(value) {
             if (isNaN(value) === false && parseInt(value)>0) {
               return true;
             } else if(value=="q" || value=="Q") {
               exit();
             }
             else {
               return false;
             }
           }
         }
       ])
       .then(function(answer) {
         connection.query("SELECT stock_quantity FROM products WHERE ?",{item_id:answer.itemID}, function (err, res) {
             if (err) throw err;
             if(res.length==0) {
                 console.log("\r\nI'm sorry, we don't carry that product.\r\n");
                 console.log("");

                 showStuff();
             } else if(res[0].stock_quantity<answer.quantity) {
                 console.log("\r\nI'm sorry, we don't have enough inventory to fulfill your order.\r\n");
                 showStuff();
             } else {
       var total=parseFloat(answer.quantity)*res[0].price;



               connection.query("SELECT item_id, stock_quantity, price FROM products WHERE ?",
                   [{
                       item_id:answer.itemID
                   }],
                   function(err, res) {

                       console.log(res);
                       var total = res[0].price*parseInt(answer.quantity)

                       if(res[0].stock_quantity > parseInt(answer.quantity)){

                         connection.query("UPDATE products SET ? WHERE ?",
                         [
                         {
                           stock_quantity: res[0].stock_quantity-parseInt(answer.quantity)
                         },
                         {
                           item_id: answer.itemID
                         }
                       ],function(err, res){

                         console.log("Congratulations on your purchase!");
                         console.log("Total cost is "+total)

                         showStuff();

                         })

                       }
                     })
                   }
                 })
               })
             }


   function exit() {
     connection.end();
     process.exit();
   }
