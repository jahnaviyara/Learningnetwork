var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs('mongodb://jahnavi:jahnavi@cluster0-shard-00-00-lhkoh.mongodb.net:27017,cluster0-shard-00-01-lhkoh.mongodb.net:27017,cluster0-shard-00-02-lhkoh.mongodb.net:27017/DataCollection?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority',['Subject','Faculty','Videos'])
var bcrypt = require('bcrypt')

/* GET home page. */
router.get('/',function(req,res,next){
  res.render('form',{});
});

router.post('/getdata',function(req,res,next){
  var usertype1 = req.body.usertype;
  // console.log(usertype1);
  if(usertype1 == "Faculty"){
    res.redirect('/login')
  }
  else{
    res.redirect('/videopage');
  }
})

router.get('/login',function(req, res, next){
  var status = req.query.status;
  res.render('home',{msg:status});
});

router.get('/register',function(req, res, next){
  var status = req.query.status;
  res.render('register',{msg:status});
});

router.get('/forgetpswd',function(req,res,next){
  var status = req.query.status;
  res.render('forgetpswd',{msg:status});
})

router.post('/insertion',function(req,res,next){
  var name = req.body.name;
  var id = req.body.fid;
  console.log("name:",name,id,req.body.pass);
  if(name.length == 0 ||  id.length == 0 || req.body.pass.length == 0){
    res.render('register',{msg:"Enter all credentials"})
  }
  else{
    bcrypt.hash(req.body.pass,10,function(err,hashedPass){
      if(err){
        console.log(err);
      }
      // console.log(name,id,hashedPass);
      db.Faculty.insert({name:name,fid:id,password:hashedPass},function(err,docs){
        if(err){
          console.log(err);
        }
        else{
          res.redirect('/login');
        }
      })
    });
  }
});

router.post('/validation',function(req,res,next){
  var id = req.body.fid;
  var pd = req.body.pswd;
  // console.log(id,pd);
  if(id.length == 0 || pd.length == 0){
    res.redirect('/login?status=Enter all Credentials!!');
  }
  else{
    db.Faculty.find({fid:id},function(err,docs){
      if(err){
        res.send("Please Enter Correct Credentials");
      }
      else{
        // console.log(docs[0].password);
        if(docs.length == 0){
          res.redirect('/register?status=Not a registered user!!');
        }
        else{
          bcrypt.compare(pd,docs[0].password,function(err,result){
            if(err){
              res.send("Enter correct Credentials"+err)
            }
            if(result){
              res.render('form1',{})
            }
            else{
              res.redirect('/login?status=Enter all Credentials!!');
            }
          });
        }
      }
    });
  }
});

router.post('/selection',function(req,res,next){
  var func = req.body.directedto;
  console.log(func);
  if(func == "Videopage"){
    res.redirect('/videopage')
  }
  else{
    res.redirect('/uploadVideo');
  }
});

router.get('/videopage',function(req,res,next){
  db.Videos.find({},function(err,docs){
    if(err){
      res.send(err)
    }
    else{
        var links = new Array();
        docs.forEach(element => {
          // console.log(element);
          var li;
          if(element.url.includes('youtube') || element.url.includes('youtu.be')){
            li = element.url+"/"+element.topic+"/"+element.dateofupload+"/"+element.subjectname;
          }
          else{
            li = element.url+"////"+element.topic+"////"+element.dateofupload+"////"+element.subjectname;
          }
          links.push(li);
        });
        links = JSON.stringify(links);
        res.render('videospage',{link:links});
    }
  })
})

router.get('/uploadVideo',function(req,res,next){
  var status = req.query.status;
  res.render('uploaddata',{msg:status});
})

router.post('/datauploaded',function(req,res,next){
  var sname = req.body.sname;
  var scode = req.body.scode;
  var branch = req.body.branch;
  var sem = req.body.sem;
  var topic = req.body.topic;
  var date = req.body.date;
  var url = req.body.url;
  if(sname.length == 0 || scode.length == 0 || branch.length == 0 || sem.length == 0 || topic.length == 0 || date.length == 0 || url.length == 0){
    res.redirect('/uploadVideo?status=All the data is needed!!');
  }
  else{
    db.Subject.insert({subjectname:sname,subjectcode:scode,branch:branch,semester:sem},function(err,docs){
      if(err){
        res.send(err)
      }
      else{
        db.Videos.insert({subjectcode:scode,topic:topic,dateofupload:date,subjectname:sname,url:url},function(err,docs){
          if(err){
            res.send(err);
          }
          else{
            res.send("Data Uploaded successfully");
          }
        })
      }
  });
  }
});

router.post('/SearchBar',function(req,res,next){
  var ttbs = req.body.ttbs;
  if(ttbs.length == 0){
    res.redirect('/videopage');
  }
  else{
    db.Videos.createIndex( { subjectname: "text", topic: "text",dateofupload: "text" });
    db.Videos.find({$text: {$search : ttbs}},function(err,docs){
      if(err){
        res.send(err);
      }
      else{
        var links = new Array();
        if(docs.length == 0){
          res.redirect('/videopage');
        }
        else{
          docs.forEach(element => {
            // console.log(element);
            var li;
            if(element.url.includes('youtube') || element.url.includes('youtu.be')){
              li = element.url+"/"+element.topic+"/"+element.dateofupload+"/"+element.subjectname;
            }
            else{
              li = element.url+"////"+element.topic+"////"+element.dateofupload+"////"+element.subjectname;
            }
            links.push(li);
          });
          links = JSON.stringify(links);
          res.render('videospage',{link:links});
        }
      }
    })
  }
});

router.post('/forgetpassword',function(req,res,next){
  var fid = req.body.fid;
  var pass1 = req.body.pass1;
  var pass = req.body.pass;
  // console.log(pass,pass1);
  if(pass1.length == 0 || pass.length == 0){
    res.render('forgetpswd',{msg:"Please Enter Password"}) 
  }
  else{
    if(pass1 != pass){
      res.render('forgetpswd',{msg:"Enter same password in confirm password and new password."})
    }
    else{
      bcrypt.hash(req.body.pass1,10,function(err,hashedPass){
        if(err){
          console.log(err);
        }
        db.Faculty.findAndModify({query:{fid:fid},update:{$set:{password:hashedPass}},new:false},function(err,docs){
          if(err){
            res.send(err);
          }
          else{
            if(docs == null){
              res.render('register',{msg: "You are not a registered user"});
            }
            else{
              res.redirect('/login');
            }
          }
        })
      });
    }
  }
});
module.exports = router;   