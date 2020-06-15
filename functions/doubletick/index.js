var express = require('express');
var app = express();
app.use(express.json());
var path = require('path'); 
var catalyst = require('zcatalyst-sdk-node');
var bodyParser = require('body-parser');
//var data= [{item: 'analysis'}, {item: 'running'}, {item: 'double tick'}];
// //var urlEncodedParser = bodyParser.urlencoded({extended:false});

//template engine
app.use(express.static(path.join(__dirname, 'doubletick')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs');
app.use(express.static('public'));


function getToDoListFromDataStore(catalystApp) {
    return new Promise((resolve, reject) => {
     // Queries the catalyst datastore table
     catalystApp.zcql().executeZCQLQuery("Select * from DTNotes").then(queryResponse => {
      resolve(queryResponse);
     }).catch(err => {
      reject(err);
     })
    });
}




function isAuthenticated(req)
{
    var catalystApp = catalyst.initialize(req)
    let userManagement = catalystApp.userManagement();
    let userPromise = userManagement.getCurrentUser();

    return new Promise((resolve, reject) => {
        userPromise.then(currentUser => {
            console.log('CURRENT USER ::::' +currentUser);
            resolve(currentUser!=null);
        });
    });
}

app.get('/todo', function(req, res)
    {
        var catalystApp = catalyst.initialize(req);

        isAuthenticated(req).then(function(result) {
           if(result)
           {
                console.log('get data from datastore');
                var data=[];
                getToDoListFromDataStore(catalystApp).then(
                    notes => {
                        notes.forEach(element => {
                            data.push({item: [{id:element.DTNotes.ROWID.toString()},{name:element.DTNotes.NOTE.toString()}]});
                      }); 
                    res.render('todo', {todos: data});
                }
            ).catch(err => {
                console.log(err);
                sendErrorResponse(res);
            })
           }
           else
           {
                console.log("unauthenticated call made..redirecting to homepage..");
                res.redirect('/app/');
           }
        });
    });

app.post('/todo', function(req, res)
    {
        isAuthenticated(req).then(function(result) {
            if(result)
            {
                var catalystApp = catalyst.initialize(req);
                var datastore = catalystApp.datastore();
                var table = datastore.table('DTNotes');
                var notesVal = req.body.item;
                console.log(req.body);
        
                var rowData={}
                rowData["NOTE"]=notesVal;
        
                var insertPromise = table.insertRow(rowData);
                insertPromise.then((row) => {

                    /*catalystApp.pushNotification().web()
                        .sendNotification('PUSH WORKING FINE', ['srinath.p@zohocorp.com'])
                        .then((result) => {
                            console.log('PUSH SUCCESS' + result);
                            res.send('PUSH SUCCESS'+result);
                        })
                        .catch((err) => {
                            console.log('PUSH FAILURE' + err);
                            res.send("PUSH FAILURE OCCURRED" + err);
                        });*/

                res.render('addUL', {todos: [{id: row.ROWID},{name: notesVal}]});
                }).catch(err => {
                    console.log(err);
                    sendErrorResponse(res);
                });
                
            }
            else
            {
                console.log("unauthenticated call made..redirecting to homepage..");
                res.send('UNAUTHENTICATED');
            }
        });
    });


app.delete('/todo:item', function(req, res)
    {
        isAuthenticated(req).then(function(result) {
            if(result)
            {
                var id = req.params.item;

                var catalystApp = catalyst.initialize(req);
                let datastore = catalystApp.datastore();
                let table = datastore.table('DTNotes');
                let rowPromise = table.deleteRow(id);
                rowPromise.then((row) => {
                    console.log(row);
                    res.send(id);
                }).catch(err => {
                    console.log(err);
                    sendErrorResponse(res);
                });
            }
            else
            {
                console.log("unauthenticated call made..redirecting to homepage..");
                res.send('UNAUTHENTICATED');
            }
        });
    });

module.exports = app;